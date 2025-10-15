const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employee', 'employer', 'admin'],
    default: 'employee',
  },
  stack: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: Number,
    default: 0,
  },
  country: String,
  state: String,
  city: String,
  cvURL: String,
  profileComplete: {
    type: Boolean,
    default: false,
  },
  rank: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  examsTaken: {
    type: Number,
    default: 0,
  },
  certifications: {
    type: [String],
    default: [],
  },
  companyName: String,
  industry: String,
  hqLocation: String,
  jobsPosted: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);