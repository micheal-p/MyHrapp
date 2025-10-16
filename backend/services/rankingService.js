// backend/services/rankingService.js
const User = require('../models/User');

// Scoring weights
const WEIGHTS = {
  experience: 2,        // 2 points per year
  skills: 1,           // 1 point per skill
  examsTaken: 10,      // 10 points per exam
  certifications: 15,  // 15 points per certification
  cvBonus: 10,         // 10 points for having a CV
  profileComplete: 5,  // 5 points for complete profile
};

/**
 * Calculate user score based on profile data
 */
const calculateScore = (user) => {
  let score = 0;

  // Experience points
  score += (user.experience || 0) * WEIGHTS.experience;

  // Skills points
  score += (user.skills?.length || 0) * WEIGHTS.skills;

  // Exams points
  score += (user.examsTaken || 0) * WEIGHTS.examsTaken;

  // Certifications points
  score += (user.certifications?.length || 0) * WEIGHTS.certifications;

  // CV bonus
  if (user.cvURL) {
    score += WEIGHTS.cvBonus;
  }

  // Profile completion bonus
  if (user.profileComplete) {
    score += WEIGHTS.profileComplete;
  }

  return score;
};

/**
 * Update ranks for all employees in a region
 */
const updateRegionalRanks = async (country, state = null, city = null) => {
  try {
    // Build query
    const query = { role: 'employee', country };
    if (state) query.state = state;
    if (city) query.city = city;

    // Get all users in region, sorted by score (descending)
    const users = await User.find(query).sort({ score: -1 });

    // Update ranks
    const updates = users.map((user, index) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { rank: index + 1 }
      }
    }));

    if (updates.length > 0) {
      await User.bulkWrite(updates);
    }

    console.log(`✅ Updated ${updates.length} ranks in ${city || state || country}`);
  } catch (error) {
    console.error('Update regional ranks error:', error);
    throw error;
  }
};

/**
 * Update score and rank for a single user
 */
const updateUserRanking = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'employee') {
      throw new Error('User not found or not an employee');
    }

    // Calculate new score
    const newScore = calculateScore(user);

    // Update user's score
    await User.findByIdAndUpdate(userId, { score: newScore });

    // Update ranks in user's region (city level)
    if (user.country && user.state && user.city) {
      await updateRegionalRanks(user.country, user.state, user.city);
    }

    // Get updated user with new rank
    const updatedUser = await User.findById(userId).select('-password');
    return updatedUser;
  } catch (error) {
    console.error('Update user ranking error:', error);
    throw error;
  }
};

/**
 * Recalculate all rankings (run periodically or on-demand)
 */
const recalculateAllRankings = async () => {
  try {
    console.log('🔄 Recalculating all rankings...');

    // Get all employees
    const employees = await User.find({ role: 'employee' });

    // Update all scores
    for (const employee of employees) {
      const newScore = calculateScore(employee);
      await User.findByIdAndUpdate(employee._id, { score: newScore });
    }

    // Get unique regions
    const regions = await User.aggregate([
      { $match: { role: 'employee' } },
      {
        $group: {
          _id: {
            country: '$country',
            state: '$state',
            city: '$city'
          }
        }
      }
    ]);

    // Update ranks for each region
    for (const region of regions) {
      if (region._id.country && region._id.state && region._id.city) {
        await updateRegionalRanks(
          region._id.country,
          region._id.state,
          region._id.city
        );
      }
    }

    console.log('✅ All rankings recalculated');
  } catch (error) {
    console.error('Recalculate all rankings error:', error);
    throw error;
  }
};

module.exports = {
  calculateScore,
  updateUserRanking,
  updateRegionalRanks,
  recalculateAllRankings,
};