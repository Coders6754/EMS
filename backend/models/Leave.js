const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String }, // Store employee name for display even after deletion
  leaveType: { type: String, enum: ['Casual Leave', 'Sick Leave', 'Earned Leave'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  leaveDays: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
