const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  location: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
