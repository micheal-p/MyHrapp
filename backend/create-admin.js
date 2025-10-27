const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');  // Correct relative path
require('dotenv').config();  // Loads .env (MONGO_URI)

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/myhr_db')  // Adjust DB if needed
  .then(async () => {
    const email = 'admin@myhr.com';
    const password = 'admin1234admin';  // Change in prod
    const hashed = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin exists already!');
      process.exit(0);
    }
    await User.create({
      fullName: 'Admin User',
      email,
      password: hashed,
      role: 'admin',
      profileComplete: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Admin created: ${email} / ${password}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating admin:', err);
    process.exit(1);
  });