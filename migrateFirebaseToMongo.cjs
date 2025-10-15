// migrateFirebaseToMongo.cjs (FIXED VERSION)
require('dotenv').config();
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase to MongoDB Migration\n');

// Check for service account key
const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.log('❌ ERROR: serviceAccountKey.json not found!\n');
  console.log('📥 Download it from Firebase Console:');
  console.log('   1. Go to: https://console.firebase.google.com');
  console.log('   2. Select project: myhr-53fc1');
  console.log('   3. Click gear icon ⚙️  → Project Settings');
  console.log('   4. Go to "Service Accounts" tab');
  console.log('   5. Click "Generate New Private Key"');
  console.log('   6. Save as: serviceAccountKey.json');
  console.log('   7. Move it to: ' + __dirname);
  console.log('\n💡 OR if you have no Firebase data, skip migration:');
  console.log('   - Just start backend: cd backend && npm run dev');
  console.log('   - Start app and signup - data goes to MongoDB!\n');
  process.exit(1);
}

// Load service account
let serviceAccount;
try {
  serviceAccount = require(keyPath);
  console.log('✅ Service account key loaded');
  console.log(`   Project ID: ${serviceAccount.project_id}\n`);
} catch (error) {
  console.log('❌ Failed to load serviceAccountKey.json');
  console.log('   Error:', error.message, '\n');
  process.exit(1);
}

// Initialize Firebase Admin
let firestore;
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  firestore = admin.firestore();
  console.log('✅ Firebase Admin initialized\n');
} catch (error) {
  console.log('❌ Firebase initialization failed');
  console.log('   Error:', error.message, '\n');
  process.exit(1);
}

// MongoDB User Schema
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: String,
  stack: String,
  skills: [String],
  experience: Number,
  country: String,
  state: String,
  lga: String,
  cvURL: String,
  rank: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  examsTaken: { type: Number, default: 0 },
  certifications: [String],
  profileComplete: { type: Boolean, default: false },
  companyName: String,
  industry: String,
  hqLocation: String,
  jobsPosted: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model('User', UserSchema);

async function listFirebaseCollections() {
  console.log('🔍 Checking Firebase collections...\n');
  
  try {
    const collections = await firestore.listCollections();
    
    if (collections.length === 0) {
      console.log('❌ No collections found in Firebase!\n');
      console.log('💡 This means you have NO DATA to migrate.');
      console.log('   You can start fresh with MongoDB!\n');
      return [];
    }
    
    console.log('📦 Found Firebase collections:');
    const collectionData = [];
    
    for (const collection of collections) {
      const snapshot = await collection.get();
      const count = snapshot.size;
      console.log(`   - ${collection.id}: ${count} document${count !== 1 ? 's' : ''}`);
      collectionData.push({ name: collection.id, count });
    }
    
    console.log('');
    return collectionData;
  } catch (error) {
    console.error('❌ Error listing collections:', error.message);
    return [];
  }
}

async function migrateCollection(collectionName) {
  console.log(`\n📤 Migrating collection: ${collectionName}...`);
  
  try {
    const snapshot = await firestore.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log('   ⚠️  Collection is empty\n');
      return 0;
    }
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const passwords = [];
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        
        // Validate email
        if (!data.email) {
          console.log(`   ⏭️  Skipping ${doc.id} (no email)`);
          skipped++;
          continue;
        }
        
        // Check if already exists in MongoDB
        const existing = await User.findOne({ 
          email: data.email.toLowerCase() 
        });
        
        if (existing) {
          console.log(`   ⏭️  ${data.email} (already in MongoDB)`);
          skipped++;
          continue;
        }
        
        // Generate temporary password
        const tempPassword = `MyHr${Math.random().toString(36).slice(-6).toUpperCase()}!`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        // Create MongoDB user
        const user = new User({
          email: data.email.toLowerCase(),
          password: hashedPassword,
          fullName: data.fullName || '',
          role: data.role || 'employee',
          stack: data.stack || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          experience: parseInt(data.experience) || 0,
          country: data.country || '',
          state: data.state || '',
          lga: data.lga || '',
          cvURL: data.cvURL || '',
          rank: parseInt(data.rank) || 0,
          score: parseInt(data.score) || 0,
          examsTaken: parseInt(data.examsTaken) || 0,
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
          profileComplete: data.profileComplete || false,
          companyName: data.companyName || '',
          industry: data.industry || '',
          hqLocation: data.hqLocation || '',
          jobsPosted: parseInt(data.jobsPosted) || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        });
        
        await user.save();
        
        console.log(`   ✅ ${data.email}`);
        passwords.push({ email: data.email, password: tempPassword });
        migrated++;
        
      } catch (error) {
        console.error(`   ❌ Error migrating ${doc.id}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n   📊 ${collectionName} Summary:`);
    console.log(`      ✅ Migrated: ${migrated}`);
    console.log(`      ⏭️  Skipped: ${skipped}`);
    console.log(`      ❌ Errors: ${errors}`);
    
    if (passwords.length > 0) {
      console.log('\n   🔑 Temporary Passwords:');
      passwords.forEach(p => {
        console.log(`      ${p.email} → ${p.password}`);
      });
    }
    
    return migrated;
    
  } catch (error) {
    console.error(`   ❌ Migration error: ${error.message}`);
    return 0;
  }
}

async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found in .env file!\n');
      console.log('Add this to your .env:');
      console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myhr\n');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
    
    // List Firebase collections
    const collections = await listFirebaseCollections();
    
    if (collections.length === 0) {
      console.log('🎉 No migration needed!\n');
      console.log('Next steps:');
      console.log('   1. cd backend && npm run dev');
      console.log('   2. npx expo start');
      console.log('   3. Sign up in the app');
      console.log('   4. Data automatically saves to MongoDB!\n');
      process.exit(0);
    }
    
    // Migrate user-related collections
    const userCollections = ['users', 'employees', 'employers'];
    let totalMigrated = 0;
    
    for (const collectionInfo of collections) {
      if (userCollections.includes(collectionInfo.name)) {
        const count = await migrateCollection(collectionInfo.name);
        totalMigrated += count;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`   Total users migrated: ${totalMigrated}`);
    
    if (totalMigrated > 0) {
      console.log('\n⚠️  IMPORTANT NEXT STEPS:');
      console.log('   1. Save the temporary passwords shown above');
      console.log('   2. Send them to users OR implement password reset');
      console.log('   3. Users need to login with these temp passwords');
      console.log('   4. Consider building a password reset feature\n');
    }
    
    console.log('Next: Start your backend and app:');
    console.log('   cd backend && npm run dev');
    console.log('   npx expo start\n');
    
  } catch (error) {
    console.error('\n❌ Migration Failed!');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Check dependencies
const requiredPackages = ['firebase-admin', 'mongoose', 'bcryptjs', 'dotenv'];
const missingPackages = [];

requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg);
  } catch (e) {
    missingPackages.push(pkg);
  }
});

if (missingPackages.length > 0) {
  console.log('❌ Missing packages! Install them:\n');
  console.log(`   npm install ${missingPackages.join(' ')}\n`);
  process.exit(1);
}

// Run migration
main();