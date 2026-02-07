const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const { sendLeaveRequestEmail, sendLeaveStatusEmail } = require('../utils/email');

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'Employee') {
      if (req.user.employeeId) {
        query.employee = req.user.employeeId._id || req.user.employeeId;
      } else {
        return res.json([]);
      }
    }
    
    const leaves = await Leave.find(query)
      .populate('employee', 'employeeName email reportingManager')
      .populate('approvedBy', 'employeeName')
      .sort({ createdAt: -1 });
    
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

router.post('/', auth, async (req, res) => {
  try {
    const { employee, leaveType, startDate, endDate, reason } = req.body;
    
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    if (!leaveType) {
      return res.status(400).json({ message: 'Leave type is required' });
    }
    
    const leaveDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    
    const emp = await Employee.findById(employee);
    let availableBalance = 0;
    
    switch(leaveType) {
      case 'Casual Leave':
        availableBalance = emp.leaveBalance.casualLeave;
        break;
      case 'Sick Leave':
        availableBalance = emp.leaveBalance.sickLeave;
        break;
      case 'Earned Leave':
        availableBalance = emp.leaveBalance.earnedLeave;
        break;
      default:
        return res.status(400).json({ message: 'Invalid leave type' });
    }
    
    if (availableBalance < leaveDays) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} balance. Available: ${availableBalance} days, Requested: ${leaveDays} days` 
      });
    }
    
    const leave = new Leave({
      employee,
      employeeName: emp.employeeName,
      leaveType,
      startDate,
      endDate,
      reason,
      leaveDays
    });
    
    await leave.save();
    await leave.populate('employee', 'employeeName email reportingManager');
    
    try {
      console.log('📧 Attempting to send leave request email...');
      const employeeData = await Employee.findById(employee).populate('reportingManager', 'email employeeName');
      
      console.log('   Employee:', employeeData.employeeName);
      console.log('   Employee Email:', employeeData.email);
      console.log('   Reporting Manager:', employeeData.reportingManager?.employeeName || 'None');
      console.log('   Reporting Manager Email:', employeeData.reportingManager?.email || 'None');
      
      if (employeeData.reportingManager?.email) {
        const leaveData = {
          employeeName: employeeData.employeeName,
          leaveType: leaveType,
          startDate: startDate,
          endDate: endDate,
          duration: leaveDays,
          reason: reason,
          status: leave.status
        };
        
        console.log('   Sending email to manager:', employeeData.reportingManager.email);
        const emailResult = await sendLeaveRequestEmail(leaveData, employeeData.reportingManager.email);
        
        if (emailResult && emailResult.success) {
          console.log('   ✓ Leave request email sent successfully to manager');
        } else {
          console.error('   ✗ Failed to send email:', emailResult?.message || 'Unknown error');
        }
        } else {
          console.warn('   ⚠ No reporting manager email found. Email not sent.');
          console.warn('   💡 Tip: Assign a reporting manager to the employee to receive leave request notifications.');
          
          if (employeeData.email) {
          console.log('   📧 Sending confirmation email to employee instead:', employeeData.email);
          const leaveData = {
            employeeName: employeeData.employeeName,
            leaveType: leaveType,
            startDate: startDate,
            endDate: endDate,
            duration: leaveDays,
            reason: reason,
            status: leave.status
          };
          
          const { sendEmail } = require('../utils/email');
          await sendEmail(
            employeeData.email,
            `Leave Request Submitted - ${leaveType}`,
            `Your leave request has been submitted successfully.\n\nDetails:\n- Leave Type: ${leaveType}\n- Start Date: ${new Date(startDate).toLocaleDateString()}\n- End Date: ${new Date(endDate).toLocaleDateString()}\n- Duration: ${leaveDays} day(s)\n- Status: Pending\n\nYour request is pending approval.`,
            `<div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Leave Request Submitted</h2>
              <p>Your leave request has been submitted successfully.</p>
              <p><strong>Status:</strong> Pending Approval</p>
            </div>`
          );
        }
      }
    } catch (emailError) {
      console.error('✗ Failed to send leave request email:', emailError.message);
      console.error('   Error stack:', emailError.stack);
    }
    
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', auth, authorize('Manager', 'Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id).populate('employee');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    leave.status = status;
    
    if (status === 'Approved') {
      if (req.user.employeeId) {
        leave.approvedBy = req.user.employeeId._id || req.user.employeeId;
      } else {
        leave.approvedBy = null;
      }
      
      const leaveDays = leave.leaveDays;
      const updateField = {};
      
      switch(leave.leaveType) {
        case 'Casual Leave':
          updateField['leaveBalance.casualLeave'] = -leaveDays;
          updateField['leaveBalance.total'] = -leaveDays;
          break;
        case 'Sick Leave':
          updateField['leaveBalance.sickLeave'] = -leaveDays;
          updateField['leaveBalance.total'] = -leaveDays;
          break;
        case 'Earned Leave':
          updateField['leaveBalance.earnedLeave'] = -leaveDays;
          updateField['leaveBalance.total'] = -leaveDays;
          break;
      }
      
      await Employee.findByIdAndUpdate(leave.employee._id, {
        $inc: updateField
      });
    }
    
    await leave.save();
    await leave.populate('approvedBy', 'employeeName');
    await leave.populate('employee', 'employeeName email');
    
    try {
      if (leave.employee?.email) {
        const leaveData = {
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          duration: leave.leaveDays,
          reason: leave.reason,
          rejectionReason: req.body.rejectionReason || null
        };
        
        await sendLeaveStatusEmail(leaveData, leave.employee.email, status);
      }
    } catch (emailError) {
      console.error('Failed to send leave status email:', emailError.message);
    }
    
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
