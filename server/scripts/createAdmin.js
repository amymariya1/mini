import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../src/models/Admin.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yourDatabaseName";

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const email = "admin@example.com";
    const password = "Admin@123";
    const name = "Super Admin";

    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await Admin.findOne({ email });
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.isSuperAdmin = true;
      existing.active = true;
      await existing.save();
      console.log("✅ Existing admin updated:", email);
    } else {
      await Admin.create({ name, email, passwordHash, isSuperAdmin: true });
      console.log("✅ New admin created:", email);
    }

    console.log("Login with:", email, password);
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  }
}

createAdmin();
