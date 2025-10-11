import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // ✅ Your Mongoose User model

const router = express.Router();

// 🔹 REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, userType, age } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      userType: userType || "user", // default role
      age,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 REGISTER THERAPIST
router.post("/register-therapist", async (req, res) => {
  try {
    const { name, email, password, age, license } = req.body;

    // Validate all required fields
    if (!name || !email || !password || !age || !license) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new therapist user (not approved by default)
    const therapist = await User.create({
      name,
      email,
      passwordHash,
      userType: "therapist",
      age,
      license, // Store license information
      isApproved: false, // Therapists need admin approval
      isActive: false, // Therapists are inactive until approved
    });

    res.json({
      success: true,
      message: "Registration successful. Your account is pending admin approval.",
      user: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        userType: therapist.userType,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 LOGIN (supports userType)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // For therapists, also check if they are approved
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // If user is a therapist, check if they are approved
    if (user.userType === "therapist" && !user.isApproved) {
      return res.status(403).json({ message: "Your account is pending admin approval" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token (optional)
    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET || "supersecret", {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType, // ✅ therapist / user / admin
        age: user.age,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "supersecret", { expiresIn: "15m" });

    // Optional: Send reset link by email
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${token}`;

    res.json({
      success: true,
      message: "Password reset link sent to your email",
      // In a real app, you would send the email here
      // For demo, we return the link
      resetLink,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(400).json({ message: "Invalid token" });

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;