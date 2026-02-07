const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');

router.get('/public', async (req, res) => {
  try {
    const departments = await Department.find().select('name _id').sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().populate('head', 'employeeName');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create department
router.post('/', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { name, head, location } = req.body;
    
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Department name must be unique' });
    }
    
    if (head && head !== '') {
      const employee = await Employee.findById(head);
      if (!employee) {
        return res.status(400).json({ message: 'Department head must be an existing employee' });
      }
    }
    
    const departmentData = { name, location };
    if (head && head !== '') {
      departmentData.head = head;
    }
    
    const department = new Department(departmentData);
    await department.save();
    await department.populate('head', 'employeeName');
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { name, head, location } = req.body;
    
    if (head && head !== '') {
      const employee = await Employee.findById(head);
      if (!employee) {
        return res.status(400).json({ message: 'Department head must be an existing employee' });
      }
    }
    
    const updateData = { name, location };
    if (head && head !== '') {
      updateData.head = head;
    } else if (head === '') {
      updateData.head = null;
    }
    
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('head', 'employeeName');
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
