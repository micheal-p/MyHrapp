const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Signup request:', req.body);
    
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'employee',
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Signup successful:', user.email);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        _id: user._id,
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Login successful:', user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        rank: user.rank,
        score: user.score,
        examsTaken: user.examsTaken,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

module.exports = router;