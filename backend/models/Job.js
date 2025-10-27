// backend/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
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
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
  },
  requirements: [{
    type: String,
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open',
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', JobSchema);