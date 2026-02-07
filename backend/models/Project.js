const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  role: { type: String }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  budget: { type: Number, required: true },
  submissionDate: { type: Date, required: true },
  teamMembers: [teamMemberSchema],
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected'], 
    default: 'Submitted' 
  },
  approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
