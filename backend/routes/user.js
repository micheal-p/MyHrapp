const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ===============================
// RANKING CALCULATION
// ===============================
const WEIGHTS = {
  experience: 2,
  skills: 1,
  examsTaken: 10,
  certifications: 15,
  cvBonus: 10,
  profileComplete: 5,
};

const calculateScore = (user) => {
  let score = 0;
  score += (user.experience || 0) * WEIGHTS.experience;
  score += (user.skills?.length || 0) * WEIGHTS.skills;
  score += (user.examsTaken || 0) * WEIGHTS.examsTaken;
  score += (user.certifications?.length || 0) * WEIGHTS.certifications;
  if (user.cvURL) score += WEIGHTS.cvBonus;
  if (user.profileComplete) score += WEIGHTS.profileComplete;
  return score;
};

const updateRegionalRanks = async (country, state, city) => {
  try {
    const query = { role: 'employee', country, state, city };
    const users = await User.find(query).sort({ score: -1 });
    const updates = users.map((user, index) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { rank: index + 1 }
      }
    }));
    if (updates.length > 0) {
      await User.bulkWrite(updates);
    }
    console.log(`Updated ${updates.length} ranks in ${city}, ${state}, ${country}`);
  } catch (error) {
    console.error('Update regional ranks error:', error);
  }
};

// ===============================
// GET PROFILE (CURRENT USER)
// ===============================
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Get profile request for:', req.userId);
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
        logoURL: user.logoURL,
        jobsPosted: user.jobsPosted,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// ===============================
// UPDATE PROFILE
// ===============================
router.put('/profile', auth, async (req, res) => {
  try {
    console.log('Update profile request for:', req.userId);
    console.log('Updates:', req.body);

    const updates = { ...req.body };
    updates.updatedAt = new Date();

    // Remove protected fields
    delete updates.password;
    delete updates.email;
    delete updates._id;
    delete updates.id;

    // Get current user
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge current + updates for validation
    const mergedData = { ...currentUser.toObject(), ...updates };

    // === ROLE-BASED PROFILE COMPLETE LOGIC ===
    if (currentUser.role === 'employee') {
      // Update score
      const newScore = calculateScore(mergedData);
      updates.score = newScore;

      // Auto-calculate profileComplete for employees
      updates.profileComplete = !!(
        mergedData.stack &&
        Array.isArray(mergedData.skills) && mergedData.skills.length > 0 &&
        mergedData.country && mergedData.state && mergedData.city
      );
    } 
    else if (currentUser.role === 'employer') {
      // Auto-calculate profileComplete for employers
      updates.profileComplete = !!(
        mergedData.companyName &&
        mergedData.industry &&
        mergedData.country && mergedData.state && mergedData.city
      );
    }

    console.log('Calculated profileComplete:', updates.profileComplete);

    // === UPDATE USER IN DB ===
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found after update' });
    }

    // === UPDATE RANKINGS (only for employees) ===
    if (user.role === 'employee' && user.country && user.state && user.city) {
      await updateRegionalRanks(user.country, user.state, user.city);

      // Re-fetch with updated rank
      const rankedUser = await User.findById(req.userId).select('-password');
      console.log('Profile updated. New score:', rankedUser.score, 'Rank:', rankedUser.rank);

      return res.json({
        message: 'Profile updated successfully',
        user: {
          _id: rankedUser._id,
          id: rankedUser._id,
          fullName: rankedUser.fullName,
          email: rankedUser.email,
          role: rankedUser.role,
          stack: rankedUser.stack,
          skills: rankedUser.skills,
          experience: rankedUser.experience,
          country: rankedUser.country,
          state: rankedUser.state,
          city: rankedUser.city,
          cvURL: rankedUser.cvURL,
          profileComplete: rankedUser.profileComplete,
          rank: rankedUser.rank,
          score: rankedUser.score,
          examsTaken: rankedUser.examsTaken,
          certifications: rankedUser.certifications,
        },
      });
    }

    // === SUCCESS RESPONSE (EMPLOYER OR NO RANK UPDATE) ===
    console.log('Profile updated successfully');
    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        // Employee fields
        stack: user.stack,
        skills: user.skills,
        experience: user.experience,
        cvURL: user.cvURL,
        rank: user.rank,
        score: user.score,
        examsTaken: user.examsTaken,
        certifications: user.certifications,
        // Employer fields
        companyName: user.companyName,
        industry: user.industry,
        logoURL: user.logoURL,
        jobsPosted: user.jobsPosted,
        // Common
        country: user.country,
        state: user.state,
        city: user.city,
        profileComplete: user.profileComplete,
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to update profile' 
    });
  }
});

// ===============================
// RECALCULATE ALL RANKINGS (ADMIN)
// ===============================
router.post('/recalculate-rankings', auth, async (req, res) => {
  try {
    console.log('Recalculating all rankings...');
    const employees = await User.find({ role: 'employee' });

    for (const employee of employees) {
      const newScore = calculateScore(employee);
      await User.findByIdAndUpdate(employee._id, { score: newScore });
    }

    const regions = await User.aggregate([
      { $match: { role: 'employee', country: { $exists: true }, state: { $exists: true }, city: { $exists: true } } },
      {
        $group: {
          _id: { country: '$country', state: '$state', city: '$city' }
        }
      }
    ]);

    for (const region of regions) {
      await updateRegionalRanks(region._id.country, region._id.state, region._id.city);
    }

    console.log('All rankings recalculated');
    res.json({ message: 'Rankings recalculated successfully', regions: regions.length });
  } catch (error) {
    console.error('Recalculate rankings error:', error);
    res.status(500).json({ error: 'Failed to recalculate rankings' });
  }
});

// ===============================
// GET USER BY ID (MUST BE LAST!)
// ===============================
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Get user by ID:', req.params.id);

    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'employee') {
      return res.status(404).json({ error: 'Not a candidate profile' });
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
      },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

module.exports = router;