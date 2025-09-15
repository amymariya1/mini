import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

// Simple in-memory session token store for demo (can be replaced by JWT later)
const sessionTokens = new Map(); // token -> adminId

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function registerAdmin(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await Admin.create({ name, email, passwordHash, isSuperAdmin: true });
    return res.status(201).json({
      admin: { id: admin._id, name: admin.name, email: admin.email, isSuperAdmin: admin.isSuperAdmin },
      message: 'Admin registered successfully'
    });
  } catch (err) {
    console.error('Admin register error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email, active: true });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return simple token to mirror current approach (no JWT)
    const token = generateToken();
    sessionTokens.set(token, String(admin._id));

    return res.json({
      admin: { id: admin._id, name: admin.name, email: admin.email, isSuperAdmin: admin.isSuperAdmin },
      token,
      authSource: 'api-admin'
    });
  } catch (err) {
    console.error('Admin login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function logoutAdmin(req, res) {
  try {
    const token = req.headers['x-admin-token'] || req.query.token || (req.body && req.body.token);
    if (token) sessionTokens.delete(token);
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Admin logout error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token || (req.body && req.body.token);
  if (!token) return res.status(401).json({ message: 'Missing admin token' });
  const adminId = sessionTokens.get(token);
  if (!adminId) return res.status(401).json({ message: 'Invalid admin token' });
  req.adminId = adminId;
  return next();
}

// Admin dashboard endpoints (users management as example)
export async function listUsers(_req, res) {
  try {
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    console.error('List users error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id, { passwordHash: 0 });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Get user error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;
    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { ...(name && { name }), ...(email && { email }), ...(age !== undefined && { age }) } },
      { new: true, runValidators: true, projection: { passwordHash: 0 } }
    );
    if (!updated) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: updated });
  } catch (err) {
    console.error('Update user error', err);
    if (err.code === 11000) return res.status(409).json({ message: 'Email already in use' });
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}