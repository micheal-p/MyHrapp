// backend/routes/rankings.js (Fixed - score >=0, Trim Stack, Always Fallback for Employers)
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
      console.log('User not found for ID:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Current User:', { _id: currentUser._id, role: currentUser.role, city: currentUser.city, state: currentUser.state, country: currentUser.country });

    const query = { 
      role: 'employee',
      profileComplete: true,
      score: { $gte: 0 }  // FIXED: >=0 to include low scores
    };

    const trimmedStack = (stack || '').trim();  // FIXED: Trim spaces
    const trimmedLocation = (location || '').trim();

    if (trimmedStack) {
      query.stack = { $regex: new RegExp(escapeRegex(trimmedStack), 'i') };  // FIXED: Escape special chars + trim
    }

    if (trimmedLocation) {
      query.$or = [
        { city: { $regex: new RegExp(escapeRegex(trimmedLocation), 'i') } },
        { state: { $regex: new RegExp(escapeRegex(trimmedLocation), 'i') } },
        { country: { $regex: new RegExp(escapeRegex(trimmedLocation), 'i') } }
      ];
    } else if (currentUser.role === 'employee' && view) {
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

    console.log('MongoDB Query:', JSON.stringify(query));

    const leaderboard = await User.find(query)
      .select('fullName stack experience score rank city state country skills')
      .sort({ score: -1, rank: 1 })
      .limit(50);

    console.log(`✅ Leaderboard: ${leaderboard.length} users in ${view || 'default'}${trimmedStack ? ` for stack "${trimmedStack}"` : ''}${trimmedLocation ? ` for location "${trimmedLocation}"` : ''}`);
    if (leaderboard.length > 0) {
      console.log('Matched Users:', JSON.stringify(leaderboard.map(u => ({ _id: u._id, fullName: u.fullName, stack: u.stack, city: u.city, state: u.state }))));
    } else {
      console.log('No matches found. Checking all employees...');
      const allEmployees = await User.find({ role: 'employee', profileComplete: true, score: { $gte: 0 } })  // FIXED: >=0
        .select('_id fullName stack city state country score');
      console.log('All valid employees:', JSON.stringify(allEmployees));
    }

    let finalLeaderboard = leaderboard;
    if (leaderboard.length === 0 && currentUser.role === 'employer') {  // FIXED: Always fallback for employers (no filter check)
      const fallbackQuery = { role: 'employee', profileComplete: true, score: { $gte: 0 } };  // FIXED: >=0
      console.log('Fallback Query:', JSON.stringify(fallbackQuery));
      const fallbackLeaderboard = await User.find(fallbackQuery)
        .select('fullName stack experience score rank city state country skills')
        .sort({ score: -1, rank: 1 })
        .limit(50);
      console.log(`✅ Fallback Leaderboard: ${fallbackLeaderboard.length} users`);
      if (fallbackLeaderboard.length > 0) {
        console.log('Fallback Matched Users:', JSON.stringify(fallbackLeaderboard.map(u => ({ _id: u._id, fullName: u.fullName, stack: u.stack, city: u.city, state: u.state }))));
      }
      finalLeaderboard = fallbackLeaderboard;
    }

    res.json({ 
      leaderboard: finalLeaderboard,
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

// Helper for regex escape (FIXED for safe matching)
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===============================
// 📊 GET USER'S RANK DETAILS
// ===============================
router.get('/my-rank', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('fullName stack experience score rank city state country examsTaken certifications');

    if (!user) {
      console.log('User not found for rank:', req.userId);
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