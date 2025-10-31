// backend/models/Job.js (New Stub - Mongoose Schema for Job Postings)
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
    required: true,  // e.g., "Marketing"
  },
  location: {
    type: String,
    required: true,
  },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  requirements: [{
    type: String,
  }],
  applicationQuestions: [{
    type: String,
  }],
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References your User model (employer)
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;