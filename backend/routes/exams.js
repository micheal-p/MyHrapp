// backend/routes/exams.js (Complete - Added Admin Middleware)
const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');  // Added

// Predefined stacks for admin dropdown
const AVAILABLE_STACKS = [
  'Marketing',
  'Engineering',
  'HR',
  'Finance',
  'Sales',
  'Design',
  'Operations',
  'Legal',
  'Healthcare',
  'Education'
];

// ===============================
// 📊 GET AVAILABLE EXAMS COUNT (FOR BADGE)
// ===============================
router.get('/available/count', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('stack');
    
    if (!user?.stack) {
      return res.json({ count: 0 });
    }

    const totalAvailable = await Exam.countDocuments({
      isActive: true,
      stack: user.stack
    });

    const completedCount = await ExamResult.countDocuments({
      userId: req.userId
    });

    const pendingCount = Math.max(0, totalAvailable - completedCount);

    res.json({ count: pendingCount });
  } catch (error) {
    console.error('Get available exams count error:', error);
    res.status(500).json({ error: 'Failed to fetch count', count: 0 });
  }
});

// ===============================
// 📋 GET ALL AVAILABLE EXAMS
// ===============================
router.get('/available', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('stack');
    
    if (!user?.stack) {
      return res.json({ exams: [] });
    }
    
    const exams = await Exam.find({ 
      isActive: true,
      stack: user.stack 
    }).select('title description stack duration totalQuestions passingScore createdAt');

    const completedExams = await ExamResult.find({ 
      userId: req.userId 
    }).select('examId');

    const completedExamIds = completedExams.map(result => result.examId.toString());

    const examsWithStatus = exams
      .map(exam => ({
        ...exam.toObject(),
        completed: completedExamIds.includes(exam._id.toString()),
        available: !completedExamIds.includes(exam._id.toString()),
      }))
      .filter(exam => exam.available)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ exams: examsWithStatus });
  } catch (error) {
    console.error('Get available exams error:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// ===============================
// 📝 GET EXAM BY ID (FOR TAKING)
// ===============================
router.get('/:examId', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const user = await User.findById(req.userId).select('stack');
    
    if (exam.stack !== user.stack) {
      return res.status(403).json({ error: 'Access denied: Exam not for your stack' });
    }

    const existingResult = await ExamResult.findOne({
      userId: req.userId,
      examId: exam._id,
    });

    if (existingResult) {
      return res.status(400).json({ 
        error: 'You have already completed this exam',
        result: existingResult 
      });
    }

    const questionsWithoutAnswers = exam.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options.map(opt => ({ text: opt.text })),
      difficulty: q.difficulty,
      category: q.category,
    }));

    res.json({
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        stack: exam.stack,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        passingScore: exam.passingScore,
        questions: questionsWithoutAnswers,
      }
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

// ===============================
// ✅ SUBMIT EXAM
// ===============================
router.post('/:examId/submit', auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    const exam = await Exam.findById(req.params.examId);
    const user = await User.findById(req.userId);
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    if (exam.stack !== user.stack) {
      return res.status(403).json({ error: 'Access denied: Exam not for your stack' });
    }

    const existingResult = await ExamResult.findOne({
      userId: req.userId,
      examId: exam._id,
    });

    if (existingResult) {
      return res.status(400).json({ error: 'Exam already completed' });
    }

    let correctAnswers = 0;
    const gradedAnswers = answers.map(answer => {
      const question = exam.questions.id(answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      
      if (isCorrect) correctAnswers++;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      };
    });

    const score = Math.round((correctAnswers / exam.totalQuestions) * 100);
    const passed = score >= exam.passingScore;

    const result = new ExamResult({
      userId: req.userId,
      examId: exam._id,
      score,
      correctAnswers,
      totalQuestions: exam.totalQuestions,
      timeTaken,
      answers: gradedAnswers,
      passed,
      certificateIssued: passed,
    });

    await result.save();

    user.examsTaken = (user.examsTaken || 0) + 1;
    
    if (passed && !user.certifications.includes(exam.title)) {
      user.certifications.push(exam.title);
    }

    await user.save();

    // Recalculate score and rank
    const WEIGHTS = {
      experience: 2,
      skills: 1,
      examsTaken: 10,
      certifications: 15,
      cvBonus: 10,
      profileComplete: 5,
    };

    const calculateScore = (u) => {
      let s = 0;
      s += (u.experience || 0) * WEIGHTS.experience;
      s += (u.skills?.length || 0) * WEIGHTS.skills;
      s += (u.examsTaken || 0) * WEIGHTS.examsTaken;
      s += (u.certifications?.length || 0) * WEIGHTS.certifications;
      if (u.cvURL) s += WEIGHTS.cvBonus;
      if (u.profileComplete) s += WEIGHTS.profileComplete;
      return s;
    };

    user.score = calculateScore(user);
    await user.save();
    
    const updateRegionalRanks = async (country, state, city) => {
      try {
        const query = { role: 'employee', country, state, city };
        const users = await User.find(query).sort({ score: -1 });
        
        const updates = users.map((u, index) => ({
          updateOne: {
            filter: { _id: u._id },
            update: { rank: index + 1 }
          }
        }));

        if (updates.length > 0) {
          await User.bulkWrite(updates);
        }
      } catch (error) {
        console.error('Update regional ranks error:', error);
      }
    };

    if (user.country && user.state && user.city) {
      await updateRegionalRanks(user.country, user.state, user.city);
    }

    res.json({
      message: passed ? 'Congratulations! You passed!' : 'Exam completed',
      result: {
        score,
        correctAnswers,
        totalQuestions: exam.totalQuestions,
        passed,
        certificateIssued: passed,
      }
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// ===============================
// 🏆 GET USER'S EXAM RESULTS
// ===============================
router.get('/results/me', auth, async (req, res) => {
  try {
    const results = await ExamResult.find({ userId: req.userId })
      .populate('examId', 'title description stack')
      .sort({ completedAt: -1 });

    res.json({ results });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// ===============================
// 📊 ADMIN: CREATE EXAM
// ===============================
router.post('/admin/create', auth, admin, async (req, res) => {
  try {
    const { title, description, stack, duration, totalQuestions, passingScore, questions } = req.body;

    if (!AVAILABLE_STACKS.includes(stack)) {
      return res.status(400).json({ error: `Invalid stack. Must be one of: ${AVAILABLE_STACKS.join(', ')}` });
    }

    const exam = new Exam({
      title,
      description,
      stack,
      duration: duration || 120,
      totalQuestions: totalQuestions || 120,
      passingScore: passingScore || 70,
      questions: questions || [],
      createdBy: req.userId,
    });

    await exam.save();

    res.status(201).json({ message: 'Exam created successfully for stack: ' + stack, exam });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// ===============================
// 📝 ADMIN: GET ALL EXAMS
// ===============================
router.get('/admin/all', auth, admin, async (req, res) => {
  try {
    const exams = await Exam.find().populate('createdBy', 'fullName').sort({ createdAt: -1 });
    res.json({ exams, availableStacks: AVAILABLE_STACKS });
  } catch (error) {
    console.error('Get all exams error:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// ===============================
// 🗑️ ADMIN: DELETE EXAM
// ===============================
router.delete('/admin/:examId', auth, admin, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.examId);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

// ===============================
// ➕ ADMIN: ADD QUESTION TO EXAM
// ===============================
router.post('/admin/:examId/questions', auth, admin, async (req, res) => {
  try {
    const { question } = req.body;  // { questionText, options, correctAnswer, ... }
    const exam = await Exam.findByIdAndUpdate(
      req.params.examId,
      { $push: { questions: question } },
      { new: true }
    );
    res.json({ message: 'Question added', exam });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

module.exports = router;