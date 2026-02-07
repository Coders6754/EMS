const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const Leave = require('../models/Leave');
const { auth } = require('../middleware/auth');

router.get('/summary', auth, async (req, res) => {
  try {
    let summary = {};
    
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      summary = {
        totalEmployees: await Employee.countDocuments(),
        totalDepartments: await Department.countDocuments(),
        totalProjects: await Project.countDocuments(),
        totalInvoices: await Invoice.countDocuments(),
        totalLeaves: await Leave.countDocuments()
      };
    } else {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json({
          totalEmployees: 0,
          totalDepartments: 0,
          totalProjects: 0,
          totalInvoices: 0,
          totalLeaves: 0
        });
      }
      
      const projects = await Project.find({
        $or: [
          { projectManager: employeeId },
          { 'teamMembers.employee': employeeId }
        ]
      }).select('_id');
      const projectIds = projects.map(p => p._id);
      
      summary = {
        totalEmployees: 1,
        totalDepartments: 0,
        totalProjects: projects.length,
        totalInvoices: await Invoice.countDocuments({ project: { $in: projectIds } }),
        totalLeaves: await Leave.countDocuments({ employee: employeeId })
      };
    }
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/employees-by-department', auth, async (req, res) => {
  try {
    let matchStage = {};
    
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      const employee = await Employee.findById(employeeId).select('department');
      if (!employee || !employee.department) {
        return res.json([]);
      }
      matchStage = { department: employee.department };
    }
    
    const pipeline = [
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      {
        $unwind: '$departmentInfo'
      }
    ];
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    pipeline.push({
      $group: {
        _id: '$departmentInfo.name',
        count: { $sum: 1 }
      }
    });
    
    const data = await Employee.aggregate(pipeline);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/projects-by-status', auth, async (req, res) => {
  try {
    let matchStage = {};
    
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      matchStage = {
        $or: [
          { projectManager: employeeId },
          { 'teamMembers.employee': employeeId }
        ]
      };
    }
    
    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    pipeline.push({
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    });
    
    const data = await Project.aggregate(pipeline);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/monthly-invoices', auth, async (req, res) => {
  try {
    let matchStage = {};
    
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
      
      matchStage = { project: { $in: projectIds } };
    }
    
    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    pipeline.push(
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    );
    
    const data = await Invoice.aggregate(pipeline);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/leaves-analysis', auth, async (req, res) => {
  try {
    let matchStage = {};
    
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json({ byType: [], byStatus: [] });
      }
      matchStage = { employee: employeeId };
    }
    
    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    const byTypePipeline = [...pipeline, {
      $group: {
        _id: '$leaveType',
        count: { $sum: 1 }
      }
    }];
    
    const byStatusPipeline = [...pipeline, {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }];
    
    const byType = await Leave.aggregate(byTypePipeline);
    const byStatus = await Leave.aggregate(byStatusPipeline);
    
    res.json({ byType, byStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/leave-widget', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    let query = {
      $or: [
        { startDate: { $gte: firstDay, $lte: lastDay } },
        { endDate: { $gte: firstDay, $lte: lastDay } }
      ]
    };
    
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId) {
        return res.json([]);
      }
      query.employee = employeeId;
    }
    
    const leaves = await Leave.find(query).populate('employee', 'employeeName department');
    
    const leavesWithNames = leaves.map(leave => {
      const leaveObj = leave.toObject();
      if (!leaveObj.employee && leaveObj.employeeName) {
        leaveObj.employee = { employeeName: leaveObj.employeeName, _deleted: true };
      }
      return leaveObj;
    });
    
    res.json(leavesWithNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
