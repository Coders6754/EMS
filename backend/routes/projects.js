const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const { sendProjectProposalEmail, sendProjectStatusEmail } = require('../utils/email');

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      query = {
        $or: [
          { projectManager: employeeId },
          { 'teamMembers.employee': employeeId }
        ]
      };
    }
    
    const projects = await Project.find(query)
      .populate('projectManager', 'employeeName email')
      .populate('teamMembers.employee', 'employeeName')
      .populate('approvedBy', 'employeeName')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, authorize('Manager', 'Admin'), async (req, res) => {
  try {
    const { projectName, projectManager, budget, submissionDate, teamMembers } = req.body;
    
    if (budget <= 0) {
      return res.status(400).json({ message: 'Budget must be a positive number' });
    }
    
    if (new Date(submissionDate) < new Date()) {
      return res.status(400).json({ message: 'Submission date cannot be a past date' });
    }
    
    if (!teamMembers || teamMembers.length === 0) {
      return res.status(400).json({ message: 'At least one team member is required' });
    }
    
    const project = new Project({
      projectName,
      projectManager,
      budget,
      submissionDate,
      teamMembers,
      status: 'Submitted'
    });
    
    await project.save();
    await project.populate('projectManager', 'employeeName email');
    await project.populate('teamMembers.employee', 'employeeName');
    
    try {
      const manager = await Employee.findById(projectManager);
      const financeHeads = await Employee.find({ 
        $or: [
          { role: 'Admin' },
          { department: await Project.findOne({ departmentName: 'Finance' }).select('_id') }
        ]
      }).limit(1);
      
      const projectData = {
        projectName: project.projectName,
        clientName: projectName, 
        budget: project.budget,
        submissionDate: project.submissionDate,
        status: project.status
      };
      
      const managerEmail = manager?.email;
      const financeEmail = financeHeads[0]?.email;
      
      if (managerEmail || financeEmail) {
        await sendProjectProposalEmail(projectData, managerEmail, financeEmail);
      }
    } catch (emailError) {
      console.error('Failed to send project proposal email:', emailError.message);
    }
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', auth, authorize('Manager', 'Admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (status === 'Under Review' && project.status === 'Submitted') {
      project.status = 'Under Review';
    } else if (status === 'Approved' && project.status === 'Under Review') {
      project.status = 'Approved';
      project.approvedBy.push(req.user.employeeId._id);
    } else if (status === 'Rejected') {
      project.status = 'Rejected';
      project.rejectionReason = rejectionReason;
    }
    
    await project.save();
    await project.populate('projectManager', 'employeeName email');
    await project.populate('teamMembers.employee', 'employeeName');
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, authorize('Manager', 'Admin'), async (req, res) => {
  try {
    const { projectName, projectManager, budget, submissionDate, teamMembers, status, rejectionReason } = req.body;
    
    const currentProject = await Project.findById(req.params.id);
    if (!currentProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const oldStatus = currentProject.status;
    
    const updateData = {
      projectName,
      projectManager,
      budget,
      submissionDate,
      teamMembers
    };
    
    if (status) {
      updateData.status = status;
      if (status === 'Rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      } else if (status !== 'Rejected') {
        updateData.rejectionReason = null;
      }
    }
    
    let project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('projectManager', 'employeeName email')
      .populate('teamMembers.employee', 'employeeName email')
      .populate('approvedBy', 'employeeName email');
    
    if (status === 'Approved' && oldStatus !== 'Approved' && req.user.employeeId) {
      const approverId = req.user.employeeId._id || req.user.employeeId;
      if (!project.approvedBy.some(id => id.toString() === approverId.toString())) {
        project.approvedBy.push(approverId);
        await project.save();
        await project.populate('approvedBy', 'employeeName email');
      }
    }
    
    if (status && status !== oldStatus) {
      try {
        const projectData = {
          projectName: project.projectName,
          budget: project.budget,
          submissionDate: project.submissionDate,
          rejectionReason: project.rejectionReason
        };
        
        if (project.projectManager?.email) {
          await sendProjectStatusEmail(projectData, project.projectManager.email, oldStatus, status);
        }
        
        const teamMemberEmails = project.teamMembers
          .map(tm => tm.employee?.email)
          .filter(email => email && email !== project.projectManager?.email); // Avoid duplicate
        
        const emailPromises = teamMemberEmails.map(email => 
          sendProjectStatusEmail(projectData, email, oldStatus, status)
        );
        
        await Promise.all(emailPromises);
        
        console.log(`✓ Project status change email sent (${oldStatus} → ${status})`);
      } catch (emailError) {
        console.error('Failed to send project status change email:', emailError.message);
      }
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
