import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { findByEmail, createUser, setUserResetToken, findByResetTokenHash, clearUserResetToken } from '../utils/userStore.js';
import { sendResetEmail } from '../utils/mailer.js';

// Utils
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(req, res) {
  try {
    const { name, email, password, age } = req.body;
    if (!name || !email || !password || age === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      return res.status(400).json({ message: 'Invalid age' });
    }

    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await createUser({ name, email, passwordHash, age: ageNum });
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, age: user.age },
      message: 'Registered successfully'
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

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Include age in response
    return res.json({ user: { id: user._id, name: user.name, email: user.email, age: user.age } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await findByEmail(email);
    if (!user) {
      // Do not reveal whether user exists
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    // Generate raw token and hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (mongoose.connection.readyState === 1) {
      // Persist to DB
      await User.updateOne(
        { _id: user._id },
        { $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpires: expiresAt } }
      );
    } else {
      // In-memory fallback via utils
      setUserResetToken(email, rawToken, expiresAt);
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    // Send the email (SMTP if configured; otherwise console)
    await sendResetEmail(email, resetUrl);

    return res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });

    const tokenHash = hashToken(token);

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

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (mongoose.connection.readyState === 1) {
      user.passwordHash = passwordHash;
      user.resetPasswordTokenHash = null;
      user.resetPasswordExpires = null;
      await user.save();
    } else {
      // update in-memory user and clear token
      user.passwordHash = passwordHash;
      clearUserResetToken(user.email);
    }

    return res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}