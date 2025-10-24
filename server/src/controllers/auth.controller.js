import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { findByEmail, createUser, setUserResetToken, findByResetTokenHash, clearUserResetToken } from '../utils/userStore.js';
import { sendResetEmail, sendWelcomeEmail } from '../utils/mailer.js'; // Import the email functions

// Utils
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(req, res) {
  try {
    const { name, email, password, age, userType, license, specialization, bio, rating, experience } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || age === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      return res.status(400).json({ message: 'Invalid age' });
    }

    // For therapists, license is required
    if (userType === 'therapist' && !license) {
      return res.status(400).json({ message: 'License is required for therapists' });
    }

    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = { 
      name, 
      email, 
      passwordHash, 
      age: ageNum,
      userType: userType || 'user'
    };

    // Add license for therapists
    if (userType === 'therapist') {
      userData.license = license;
      userData.isApproved = false; // Therapists need admin approval
      userData.isActive = false;   // Therapists are inactive until approved
      
      // Add therapist-specific fields if provided
      if (specialization) userData.specialization = specialization;
      if (bio) userData.bio = bio;
      if (rating !== undefined) userData.rating = Number(rating);
      if (experience !== undefined) userData.experience = Number(experience);
    }

    const user = await createUser(userData);
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, {
        name: user.name,
        userType: user.userType
      });
      console.log(`Welcome email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
    // Customize response message based on user type
    const message = userType === 'therapist' 
      ? 'Registration successful. Your account is pending admin approval.'
      : 'Registered successfully';
    
    return res.status(201).json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        age: user.age,
        userType: user.userType
      },
      message
    });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If user is a therapist, check if they are approved
    if (user.userType === "therapist" && !user.isApproved) {
      return res.status(403).json({ message: "Your account is pending admin approval" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Include userType, age, and approval status in response
    return res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        age: user.age,
        userType: user.userType,
        isApproved: user.isApproved
      } 
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    console.log(`Forgot password request received for email: ${email}`);
    
    if (!email) {
      console.log('Forgot password request failed: Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await findByEmail(email);
    if (!user) {
      console.log(`Forgot password request: No user found with email ${email}`);
      // Only send reset emails to registered users
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    console.log(`Forgot password request: Found user with email ${email}`);

    // Generate raw token and hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log(`Forgot password request: Generated token for user ${user._id}`);

    if (mongoose.connection.readyState === 1) {
      // Persist to DB
      console.log(`Forgot password request: Updating user ${user._id} in database`);
      await User.updateOne(
        { _id: user._id },
        { $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpires: expiresAt } }
      );
    } else {
      // In-memory fallback via utils
      console.log(`Forgot password request: Updating user ${user._id} in memory`);
      setUserResetToken(email, rawToken, expiresAt);
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    console.log(`Forgot password request: Sending reset email to ${email}`);

    // Send the email (SMTP if configured; otherwise console)
    await sendResetEmail(email, resetUrl);
    
    console.log(`Forgot password request: Reset email sent successfully to ${email}`);

    return res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/forgot-password-auto (new endpoint for automatic reset)
export async function forgotPasswordAuto(req, res) {
  try {
    const { email } = req.body;
    console.log(`Automatic forgot password request received for email: ${email}`);
    
    if (!email) {
      console.log('Automatic forgot password request failed: Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await findByEmail(email);
    if (!user) {
      console.log(`Automatic forgot password request: No user found with email ${email}`);
      // Only send reset emails to registered users
      // Maintain consistency with original forgotPassword function for security
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
    }

    console.log(`Automatic forgot password request: Found user with email ${email}`);

    // Generate raw token and hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log(`Automatic forgot password request: Generated token for user ${user._id}`);

    if (mongoose.connection.readyState === 1) {
      // Persist to DB
      console.log(`Automatic forgot password request: Updating user ${user._id} in database`);
      await User.updateOne(
        { _id: user._id },
        { $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpires: expiresAt } }
      );
    } else {
      // In-memory fallback via utils
      console.log(`Automatic forgot password request: Updating user ${user._id} in memory`);
      setUserResetToken(email, rawToken, expiresAt);
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    console.log(`Automatic forgot password request: Sending reset email to ${email}`);

    // Send the email (SMTP if configured; otherwise console)
    await sendResetEmail(email, resetUrl);
    
    console.log(`Automatic forgot password request: Reset email sent successfully to ${email}`);

    console.log('Automatic forgot password request: Returning success response');
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Automatic forgot password error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    console.log('Reset password request received');
    
    if (!token || !password) {
      console.log('Reset password request failed: Token and new password are required');
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const tokenHash = hashToken(token);
    console.log('Reset password request: Hashed token for lookup');

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      });
    } else {
      // In-memory search via utils
      user = await findByResetTokenHash(tokenHash);
    }

    if (!user) {
      console.log('Reset password request failed: Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    console.log(`Reset password request: Found user ${user._id} with valid token`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (mongoose.connection.readyState === 1) {
      user.passwordHash = passwordHash;
      user.resetPasswordTokenHash = null;
      user.resetPasswordExpires = null;
      await user.save();
      console.log(`Reset password request: Updated password for user ${user._id} in database`);
    } else {
      // update in-memory user and clear token
      user.passwordHash = passwordHash;
      clearUserResetToken(user.email);
      console.log(`Reset password request: Updated password for user ${user._id} in memory`);
    }

    return res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}