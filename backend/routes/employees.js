const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { generateEmployeeId } = require('../utils/counter');
const { sendEmployeeCredentialsEmail } = require('../utils/email');

router.get('/', auth, async (req, res) => {
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
    
    const employees = await Employee.find({})
      .populate('department', 'name')
      .populate('reportingManager', 'employeeName')
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role === 'Employee') {
      const employeeId = req.user.employeeId?._id || req.user.employeeId;
      if (!employeeId || req.params.id !== employeeId.toString()) {
        return res.status(403).json({ message: 'Access denied: You can only view your own profile' });
      }
    }
    
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('reportingManager', 'employeeName');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/leave-balance', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('employeeName employeeId leaveBalance leaveAllocationYear');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({
      employeeName: employee.employeeName,
      employeeId: employee.employeeId,
      leaveBalance: employee.leaveBalance,
      allocationYear: employee.leaveAllocationYear
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { employeeName, email, contactNumber, department, joiningDate, reportingManager, password } = req.body;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password is required and must be at least 6 characters long' });
    }
    
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one capital letter' });
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&* etc.)' });
    }
    
    if (!/^\d+$/.test(contactNumber)) {
      return res.status(400).json({ message: 'Contact number must contain only numeric values' });
    }
    
    if (contactNumber.length !== 10) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
    }
    
    if (new Date(joiningDate) > new Date()) {
      return res.status(400).json({ message: 'Joining date cannot be a future date' });
    }
    
    const existingEmployee = await Employee.findOne({ email: normalizedEmail });
    if (existingEmployee) {
      return res.status(400).json({ 
        message: `An employee with email "${email}" already exists. Please use a different email address.` 
      });
    }
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        message: `A user account with email "${email}" already exists. Please use a different email address.` 
      });
    }
    
    const employeeId = await generateEmployeeId();
    
    const employeeData = {
      employeeName,
      employeeId,
      email: normalizedEmail,
      contactNumber,
      department,
      joiningDate
    };
    
    if (reportingManager && reportingManager !== '') {
      employeeData.reportingManager = reportingManager;
    }
    
    const employee = new Employee(employeeData);
    await employee.save();
    
    const user = new User({
      email: normalizedEmail,
      password: password,
      role: 'Employee',
      employeeId: employee._id
    });
    await user.save();
    
    await employee.populate('department', 'name');
    await employee.populate('reportingManager', 'employeeName');
    
    try {
      await sendEmployeeCredentialsEmail(
        {
          email: normalizedEmail,
          employeeName: employee.employeeName,
          employeeId: employee.employeeId
        },
        password
      );
      console.log(`✓ Employee credentials email sent to ${normalizedEmail}`);
    } catch (emailError) {
      console.error('Failed to send employee credentials email:', emailError.message);
    }
    
    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      if (field === 'email') {
        return res.status(400).json({ 
          message: `An employee with email "${value}" already exists. Please use a different email address.` 
        });
      } else if (field === 'employeeId') {
        return res.status(400).json({ 
          message: `An employee with ID "${value}" already exists. Please try again.` 
        });
      }
      return res.status(400).json({ 
        message: `Duplicate entry: ${field} "${value}" already exists.` 
      });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { employeeName, email, contactNumber, department, joiningDate, reportingManager } = req.body;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (contactNumber && !/^\d+$/.test(contactNumber)) {
      return res.status(400).json({ message: 'Contact number must contain only numeric values' });
    }
    
    if (contactNumber && contactNumber.length !== 10) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
    }
    
    if (joiningDate && new Date(joiningDate) > new Date()) {
      return res.status(400).json({ message: 'Joining date cannot be a future date' });
    }
    
    if (email) {
      const existingEmployee = await Employee.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id } // Exclude current employee
      });
      if (existingEmployee) {
        return res.status(400).json({ 
          message: `An employee with email "${email}" already exists. Please use a different email address.` 
        });
      }
    }
    
    const updateData = { employeeName, contactNumber, department, joiningDate };
    
    if (email) {
      updateData.email = email.toLowerCase().trim();
    }
    
    if (reportingManager && reportingManager !== '') {
      updateData.reportingManager = reportingManager;
    } else if (reportingManager === '') {
      updateData.reportingManager = null;
    }
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('department', 'name').populate('reportingManager', 'employeeName');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      if (field === 'email') {
        return res.status(400).json({ 
          message: `An employee with email "${value}" already exists. Please use a different email address.` 
        });
      } else if (field === 'employeeId') {
        return res.status(400).json({ 
          message: `An employee with ID "${value}" already exists. Please try again.` 
        });
      }
      return res.status(400).json({ 
        message: `Duplicate entry: ${field} "${value}" already exists.` 
      });
    }
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const Leave = require('../models/Leave');
    await Leave.updateMany(
      { employee: req.params.id },
      { $set: { employeeName: employee.employeeName } }
    );
    
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
