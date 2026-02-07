const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { auth } = require('../middleware/auth');
const { generateEmployeeId } = require('../utils/counter');

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, employeeName, contactNumber, department } = req.body;
    
    if (role === 'Admin' || role === 'Manager') {
      return res.status(403).json({ 
        message: 'Admin and Manager accounts cannot be registered. Please use the fixed login credentials.' 
      });
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format. Example: user@example.com' });
    }
    
    if (normalizedEmail.includes('..') || normalizedEmail.startsWith('.') || normalizedEmail.endsWith('.')) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (contactNumber) {
      if (!/^\d+$/.test(contactNumber)) {
        return res.status(400).json({ message: 'Contact number must contain only numeric values' });
      }
      if (contactNumber.length !== 10) {
        return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
      }
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
    
    const userRole = 'Employee';
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    let employee = await Employee.findOne({ email: normalizedEmail });
    
    if (!employee) {
      const employeeId = await generateEmployeeId();
      const emailName = normalizedEmail.split('@')[0]; // Use email prefix as default name
      const defaultName = employeeName || emailName.charAt(0).toUpperCase() + emailName.slice(1);
      const defaultContact = contactNumber || '0000000000';
      
      employee = new Employee({
        employeeName: defaultName,
        employeeId: employeeId,
        email: normalizedEmail,
        contactNumber: defaultContact,
        department: department || undefined,
        joiningDate: new Date()
      });
      await employee.save();
    }
    
    const user = new User({ 
      email: normalizedEmail, 
      password, 
      role: userRole,
      employeeId: employee._id 
    });
    await user.save();
    await user.populate('employeeId');
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        employeeId: user.employeeId 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    const user = await User.findOne({ email: normalizedEmail }).populate('employeeId');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        employeeId: user.employeeId 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ 
    user: { 
      id: req.user._id, 
      email: req.user.email, 
      role: req.user.role,
      employeeId: req.user.employeeId 
    } 
  });
});

router.post('/link-employee', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Employee') {
      return res.status(403).json({ message: 'Only employees can link their account' });
    }
    
    if (req.user.employeeId) {
      return res.status(400).json({ message: 'Your account is already linked to an employee record' });
    }
    
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }
    
    const employee = await Employee.findOne({
      $or: [
        { _id: employeeId },
        { email: req.user.email.toLowerCase().trim() },
        { employeeId: employeeId }
      ]
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found. Please contact your administrator.' });
    }
    
    const existingLink = await User.findOne({ employeeId: employee._id });
    if (existingLink && existingLink._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'This employee record is already linked to another account' });
    }
    
    req.user.employeeId = employee._id;
    await req.user.save();
    await req.user.populate('employeeId');
    
    res.json({ 
      message: 'Employee account linked successfully',
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        employeeId: req.user.employeeId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/available-employees', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Employee') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const employees = await Employee.find({
      $or: [
        { email: req.user.email.toLowerCase().trim() },
        { email: { $exists: false } } // Unlinked employees
      ]
    }).select('employeeId employeeName email department').populate('department', 'name').limit(10);
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
