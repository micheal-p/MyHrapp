// backend/migrate-cvs.js (Run once: node migrate-cvs.js)
const mongoose = require('mongoose');
const User = require('./models/User');  // Adjust path if models/ is not direct child

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB for migration');
    migrateCvs();
  })
  .catch(err => console.error('Migration error:', err));

async function migrateCvs() {
  try {
    const users = await User.find({ cvURL: { $exists: true, $ne: null } });
    console.log(`Found ${users.length} users with legacy cvURL`);

    for (let user of users) {
      if (!user.cvURLs || !user.cvURLs.includes(user.cvURL)) {
        user.cvURLs.push(user.cvURL);
        await user.save();
        console.log(`Migrated CV for user ${user.fullName}`);
      }
    }

    // Optional: Remove legacy cvURL field after migration (uncomment if ready)
    // await User.updateMany({}, { $unset: { cvURL: 1 } });
    // console.log('Legacy cvURL field removed');

    console.log('Migration complete!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Migration failed:', error);
    mongoose.disconnect();
  }
}