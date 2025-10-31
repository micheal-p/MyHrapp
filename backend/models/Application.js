// backend/models/Application.js (New - Mongoose Schema for Job Applications)
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References your User model (employee)
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',  // References your Job model (if you have one; adjust if needed)
    required: true,
  },
  coverLetter: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],  // Workflow states
    default: 'Pending',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  // Optional: Answers to custom questions from PostJob
  answers: [{
    question: String,
    answer: String,
  }],
  // Optional: CV URL (if uploaded separately)
  cvURL: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,  // Adds createdAt/updatedAt
});

// Indexes for faster queries (e.g., by employer/job)
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });  // One application per job per user
applicationSchema.index({ job: 1, status: 1 });  // Quick count by job/status

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;