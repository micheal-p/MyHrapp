// backend/models/User.js (Complete - Updated with cvURLs Array)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employee', 'employer', 'admin'],
    required: true,
  },
  companyName: {
    type: String,
  },
  industry: {
    type: String,
  },
  profileComplete: {
    type: Boolean,
    default: false,
  },
  stack: {
    type: String,
  },
  experience: {
    type: Number,
    default: 0,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  skills: [{
    type: String,
  }],
  score: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  examsTaken: {
    type: Number,
    default: 0,
  },
  certifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certification',
  }],
  jobsPosted: {
    type: Number,
    default: 0,
  },
  cvURL: {  // Legacy single CV (keep for backward compat, migrate to cvURLs)
    type: String,
  },
  cvURLs: [{  // New: Array for multiple CVs
    type: String,
    default: [],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);