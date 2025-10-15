// updatePasswords.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ✅ FIX 1: Use `const mongoURI =` instead of `MONGODB_URI=`
const mongoURI = "mongodb+srv://myhradmin:admin1234@cluster0.3togncm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function updatePasswords() {
  try {
    // ✅ FIX 2: Make sure you use the same variable name here
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Define user schema
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
    });

    const User = mongoose.model("User", userSchema);

    // Users and their new plain passwords
    const updates = [
      { email: "nkanta9191@gmail.com", newPassword: "123456" },
      { email: "nkanta200@gmail.com", newPassword: "inyene" },
    ];

    // Loop through and update each one
    for (const { email, newPassword } of updates) {
      const hashed = await bcrypt.hash(newPassword, 10);
      const result = await User.updateOne({ email }, { password: hashed });

      if (result.modifiedCount > 0) {
        console.log(`✅ Password updated for ${email}`);
      } else {
        console.log(`⚠️ No user found with email ${email}`);
      }
    }

    await mongoose.disconnect();
    console.log("🔒 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error updating passwords:", error);
  }
}

updatePasswords();