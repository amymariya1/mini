import mongoose from 'mongoose';
import { randomUUID, createHash } from 'crypto';
import User from '../models/User.js';

// Helper to know if Mongoose is connected
function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1; // 1 = connected
}

// In-memory fallback store when no DB connection is available
const memoryStore = new Map(); // key: email, value: { _id, name, email, passwordHash, resetPasswordTokenHash, resetPasswordExpires }

export async function findByEmail(email) {
  if (isDbConnected()) {
    return User.findOne({ email });
  }
  // In-memory lookup
  return memoryStore.get(email) || null;
}

export async function createUser({ name, email, passwordHash, age, userType, license, isApproved, isActive }) {
  if (isDbConnected()) {
    const user = await User.create({ 
      name, 
      email, 
      passwordHash, 
      age,
      userType: userType || 'user',
      ...(userType === 'therapist' && { license, isApproved: false, isActive: false })
    });
    return user;
  }
  // In-memory create
  const user = { 
    _id: randomUUID(), 
    name, 
    email, 
    passwordHash, 
    age,
    userType: userType || 'user',
    ...(userType === 'therapist' && { license, isApproved: false, isActive: false }),
    resetPasswordTokenHash: null, 
    resetPasswordExpires: null 
  };
  memoryStore.set(email, user);
  return user;
}

// Helpers for password reset in memory mode
export function setUserResetToken(email, rawToken, expiresAt) {
  const user = memoryStore.get(email);
  if (!user) return null;
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpires = expiresAt;
  memoryStore.set(email, user);
  return user;
}

export function findByResetTokenHash(tokenHash) {
  if (isDbConnected()) {
    return User.findOne({ resetPasswordTokenHash: tokenHash, resetPasswordExpires: { $gt: new Date() } });
  }
  // In-memory search
  for (const [, user] of memoryStore) {
    if (user.resetPasswordTokenHash === tokenHash && user.resetPasswordExpires && user.resetPasswordExpires > new Date()) {
      return user;
    }
  }
  return null;
}

export function clearUserResetToken(email) {
  const user = memoryStore.get(email);
  if (!user) return null;
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpires = null;
  memoryStore.set(email, user);
  return user;
}