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

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

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
  console.log(`📱 Mobile: http://172.28.62.182:${PORT}`);
  console.log(`💻 Local: http://localhost:${PORT}`);
});

module.exports = app;