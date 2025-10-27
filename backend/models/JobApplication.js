// backend/models/JobApplication.js
const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'interview', 'rejected', 'hired'],
    default: 'applied',
  },
  coverLetter: {
    type: String,
  },
  matchScore: {
    type: Number,  // Based on CV/rank/skill match
    default: 0,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);