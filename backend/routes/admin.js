// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/// ===============================
// 📊 GET ADMIN STATS
// ===============================
router.get('/stats', auth, async (req, res) => {
  try {
    // TODO: Add admin role check
    // const user = await User.findById(req.userId);
    // if (user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    const totalUsers = await User.countDocuments();
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalExams = await Exam.countDocuments({ isActive: true });
    const totalResults = await ExamResult.countDocuments();

    // Calculate average score
    const avgScoreResult = await ExamResult.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    const averageScore = avgScoreResult.length > 0 
      ? Math.round(avgScoreResult[0].avgScore) 
      : 0;

    res.json({
      totalUsers,
      totalEmployees,
      totalEmployers,
      totalExams,
      totalResults,
      averageScore
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ===============================
// 👥 MANAGE USERS
// ===============================
router.get('/users', auth, admin, async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:userId', auth, admin, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;  // Protect
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:userId', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;