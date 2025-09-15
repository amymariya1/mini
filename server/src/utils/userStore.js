import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import User from '../models/User.js';

// Helper to know if Mongoose is connected
function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1; // 1 = connected
}

// In-memory fallback store when no DB connection is available
const memoryStore = new Map(); // key: email, value: { _id, name, email, passwordHash }

export async function findByEmail(email) {
  if (isDbConnected()) {
    return User.findOne({ email });
  }
  // In-memory lookup
  return memoryStore.get(email) || null;
}

export async function createUser({ name, email, passwordHash, age }) {
  if (isDbConnected()) {
    const user = await User.create({ name, email, passwordHash, age });
    return user;
  }
  // In-memory create
  const user = { _id: randomUUID(), name, email, passwordHash, age };
  memoryStore.set(email, user);
  return user;
}