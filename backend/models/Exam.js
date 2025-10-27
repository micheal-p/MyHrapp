// backend/models/Exam.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [{
    text: String,
    isCorrect: Boolean,
  }],
  correctAnswer: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  category: {
    type: String, // e.g., "Technical", "Soft Skills", "Industry Knowledge"
  },
});

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  stack: {
    type: String, // Which role/profession this exam is for (e.g., "Marketing")
    required: true,
  },
  duration: {
    type: Number, // Minutes
    default: 120,
  },
  totalQuestions: {
    type: Number,
    default: 120,
  },
  passingScore: {
    type: Number,
    default: 70, // Percentage
  },
  questions: [QuestionSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

module.exports = mongoose.model('Exam', ExamSchema);