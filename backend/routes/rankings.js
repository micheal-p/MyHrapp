// backend/routes/rankings.js (Fixed - Case-Insensitive Regex, Broad Employer Search)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ===============================
// 🏆 GET LEADERBOARD
// ===============================
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { view, stack, location } = req.query;
    
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build query for employees
    const query = { 
      role: 'employee',
      profileComplete: true,
      score: { $gt: 0 }
    };

    // Handle stack filter with case-insensitive regex
    if (stack) {
      query.stack = { $regex: stack, $options: 'i' }; // e.g., "M" matches "Marketing"
    }

    // Handle location filter with case-insensitive regex
    if (location) {
      query.$or = [
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } }
      ];
    } else if (currentUser.role === 'employee' && view) {
      // Only apply location fallback for employees
      if (view === 'city' && currentUser.city) {
        query.country = currentUser.country;
        query.state = currentUser.state;
        query.city = currentUser.city;
      } else if (view === 'state' && currentUser.state) {
        query.country = currentUser.country;
        query.state = currentUser.state;
      } else if (view === 'country' && currentUser.country) {
        query.country = currentUser.country;
      }
    }
    // No location fallback for employers → broad search

    const leaderboard = await User.find(query)
      .select('fullName stack experience score rank city state country skills')
      .sort({ score: -1, rank: 1 })
      .limit(50);

    console.log(`✅ Leaderboard: ${leaderboard.length} users in ${view || 'default'}${stack ? ` for stack ${stack}` : ''}${location ? ` for location ${location}` : ''}`);

    res.json({ 
      leaderboard,
      region: currentUser.role === 'employee' ? {
        city: currentUser.city,
        state: currentUser.state,
        country: currentUser.country
      } : {}
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ===============================
// 📊 GET USER'S RANK DETAILS
// ===============================
router.get('/my-rank', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('fullName stack experience score rank city state country examsTaken certifications');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cityTotal = await User.countDocuments({
      role: 'employee',
      country: user.country,
      state: user.state,
      city: user.city,
      profileComplete: true
    });

    const stateTotal = await User.countDocuments({
      role: 'employee',
      country: user.country,
      state: user.state,
      profileComplete: true
    });

    const countryTotal = await User.countDocuments({
      role: 'employee',
      country: user.country,
      profileComplete: true
    });

    res.json({
      user: {
        fullName: user.fullName,
        stack: user.stack,
        experience: user.experience,
        score: user.score,
        rank: user.rank,
        city: user.city,
        state: user.state,
        country: user.country,
        examsTaken: user.examsTaken,
        certifications: user.certifications
      },
      totals: {
        city: cityTotal,
        state: stateTotal,
        country: countryTotal
      }
    });
  } catch (error) {
    console.error('Get my rank error:', error);
    res.status(500).json({ error: 'Failed to fetch rank details' });
  }
});

module.exports = router;