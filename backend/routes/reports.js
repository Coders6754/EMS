const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');

router.get('/employees', auth, async (req, res) => {
  try {
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      const employee = await Employee.findById(employeeId)
        .populate('department', 'name')
        .populate('reportingManager', 'employeeName');
      return res.json(employee ? [employee] : []);
    }
    
    const { department, joiningDateFrom, joiningDateTo } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (joiningDateFrom && joiningDateTo) {
      query.joiningDate = { 
        $gte: new Date(joiningDateFrom), 
        $lte: new Date(joiningDateTo) 
      };
    }
    
    
    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('reportingManager', 'employeeName');
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/departments', auth, async (req, res) => {
  try {
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      const employee = await Employee.findById(employeeId).select('department');
      if (!employee || !employee.department) {
        return res.json([]);
      }
      const department = await Department.findById(employee.department).populate('head', 'employeeName');
      return res.json(department ? [department] : []);
    }
    
    const departments = await Department.find().populate('head', 'employeeName');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/projects', auth, async (req, res) => {
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
    
    const { status } = req.query;
    if (status) query.status = status;
    
    const projects = await Project.find(query)
      .populate('projectManager', 'employeeName')
      .populate('teamMembers.employee', 'employeeName');
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/invoices', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      
      const projects = await Project.find({
        $or: [
          { projectManager: employeeId },
          { 'teamMembers.employee': employeeId }
        ]
      }).select('_id');
      const projectIds = projects.map(p => p._id);
      
      if (projectIds.length === 0) {
        return res.json([]);
      }
      
      query.project = { $in: projectIds };
    }
    
    const { status } = req.query;
    if (status) query.status = status;
    
    const invoices = await Invoice.find(query).populate('project', 'projectName');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/leaves', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      query.employee = employeeId;
    }
    
    const { status } = req.query;
    if (status) query.status = status;
    
    const leaves = await Leave.find(query)
      .populate('employee', 'employeeName')
      .populate('approvedBy', 'employeeName');
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/role-based', auth, async (req, res) => {
  try {
    let data = {};
    
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      data.employees = await Employee.countDocuments();
      data.departments = await Department.countDocuments();
      data.projects = await Project.countDocuments();
      data.invoices = await Invoice.countDocuments();
      data.leaves = await Leave.countDocuments();
    } else {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      data.employee = await Employee.findById(employeeId);
      data.leaves = await Leave.find({ employee: employeeId });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
