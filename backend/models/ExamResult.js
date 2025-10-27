// backend/models/ExamResult.js
const mongoose = require('mongoose');

const ExamResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  score: {
    type: Number, // Percentage
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // Minutes
  },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    isCorrect: Boolean,
  }],
  passed: {
    type: Boolean,
    required: true,
  },
  certificateIssued: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ExamResult', ExamResultSchema);