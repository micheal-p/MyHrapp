const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('👤 Get profile request for:', req.userId);
    
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        stack: user.stack,
        skills: user.skills,
        experience: user.experience,
        country: user.country,
        state: user.state,
        city: user.city,
        cvURL: user.cvURL,
        profileComplete: user.profileComplete,
        rank: user.rank,
        score: user.score,
        examsTaken: user.examsTaken,
        certifications: user.certifications,
        companyName: user.companyName,
        industry: user.industry,
        hqLocation: user.hqLocation,
        jobsPosted: user.jobsPosted,
      },
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('✏️  Update profile request for:', req.userId);
    console.log('Updates:', req.body);
    
    const updates = req.body;
    updates.updatedAt = new Date();

    delete updates.password;
    delete updates.email;
    delete updates._id;
    delete updates.id;

    // ✅ NEW: Auto-set profileComplete if key fields present
    const isComplete = updates.skills && updates.skills.length > 0 &&
                      updates.experience && updates.experience > 0 &&
                      updates.country && updates.city;
    if (isComplete) {
      updates.profileComplete = true;
      // ✅ NEW: Simple rank calc (e.g., score * 10 + experience; refine later)
      updates.rank = (updates.score || 0) * 10 + (updates.experience || 0);
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Profile updated successfully');

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        stack: user.stack,
        skills: user.skills,
        experience: user.experience,
        country: user.country,
        state: user.state,
        city: user.city,
        cvURL: user.cvURL,
        profileComplete: user.profileComplete,
        rank: user.rank,
        score: user.score,
        examsTaken: user.examsTaken,
      },
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;