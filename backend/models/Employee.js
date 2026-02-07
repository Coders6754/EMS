const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  joiningDate: { type: Date, required: true },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  leaveBalance: {
    casualLeave: { type: Number, default: 8 },      // 8 days per year
    sickLeave: { type: Number, default: 8 },        // 8 days per year
    earnedLeave: { type: Number, default: 14 },     // 14 days per year
    total: { type: Number, default: 30 }            // 30 days per year
  },
  leaveAllocationYear: { type: Number, default: () => new Date().getFullYear() }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
