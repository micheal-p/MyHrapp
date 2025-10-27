// backend/server.js (Fixed - Routes Before app.listen)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });

// Routes (All before app.listen - Fixed)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const examRoutes = require('./routes/exams');
const rankingsRoutes = require('./routes/rankings');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/admin', adminRoutes);

// Health checks
app.get('/', (req, res) => {
  res.json({
    message: 'MyHr API is running!',
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Mobile: http://172.28.62.182:${PORT}`);  // Update IP to your current one (ifconfig)
  console.log(`💻 Local: http://localhost:${PORT}`);
});

module.exports = app;