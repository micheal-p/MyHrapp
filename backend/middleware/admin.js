// backend/middleware/admin.js (New File)
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin check failed' });
  }
};