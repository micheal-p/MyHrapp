// backend/server.js (Fixed - Typo in Require, Duplicates Removed)
require('dotenv');  // FIXED: Early dotenv load (was 'requirement')
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load .env (dotenv already required above)
const dotenv = require('dotenv');
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

// Routes (All before app.listen - Fixed, Added applications routes)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const examRoutes = require('./routes/exams');
const rankingsRoutes = require('./routes/rankings');
const adminRoutes = require('./routes/admin');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');  // NEW: Applications routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);  // NEW: Mount applications

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
  console.log(`📱 Mobile: http://172.20.10.10:${PORT}`);  // Updated IP to match frontend logs
  console.log(`💻 Local: http://localhost:${PORT}`);
});

module.exports = app;