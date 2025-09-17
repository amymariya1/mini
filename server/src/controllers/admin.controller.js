import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Post from '../models/Post.js';
import Message from '../models/Message.js';
import Question from '../models/Question.js';

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

// Users management
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

// Products management (Shopping)
export async function listProducts(_req, res) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.json({ products });
  } catch (err) {
    console.error('List products error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    console.error('Get product error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createProduct(req, res) {
  try {
    const payload = req.body || {};
    const created = await Product.create(payload);
    return res.status(201).json({ product: created });
  } catch (err) {
    console.error('Create product error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const updated = await Product.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product: updated });
  } catch (err) {
    console.error('Update product error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Blog posts management
export async function listPosts(req, res) {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'name email')
      .populate('reviewedBy', 'name email');
    return res.json({ posts });
  } catch (err) {
    console.error('List posts error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getPost(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json({ post });
  } catch (err) {
    console.error('Get post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createPost(req, res) {
  try {
    const payload = req.body || {};
    // Any user-submitted post should default to pending + not published unless explicitly overridden by admin
    const created = await Post.create({
      title: payload.title,
      content: payload.content,
      author: payload.author || null,
      tags: payload.tags || [],
      coverImage: payload.coverImage || '',
      status: payload.status || 'pending',
      published: payload.published === true && payload.status === 'approved' ? true : false,
    });
    return res.status(201).json({ post: created });
  } catch (err) {
    console.error('Create post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    // Prevent flipping published true unless status is approved (consistency)
    if (payload.published === true && payload.status !== 'approved') {
      payload.published = false;
    }
    const updated = await Post.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Post not found' });
    return res.json({ post: updated });
  } catch (err) {
    console.error('Update post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Post not found' });
    return res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Delete post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Approve/Reject moderation actions
export async function approvePost(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.adminId;
    const updated = await Post.findByIdAndUpdate(
      id,
      { $set: { status: 'approved', published: true, reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: '' } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Post not found' });
    return res.json({ post: updated });
  } catch (err) {
    console.error('Approve post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function rejectPost(req, res) {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body || {};
    const adminId = req.adminId;
    const updated = await Post.findByIdAndUpdate(
      id,
      { $set: { status: 'rejected', published: false, reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: String(reason) } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Post not found' });
    return res.json({ post: updated });
  } catch (err) {
    console.error('Reject post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Chat messages moderation
export async function listMessages(req, res) {
  try {
    const { room = 'global', limit = 100 } = req.query;
    const messages = await Message.find({ room }).sort({ createdAt: -1 }).limit(Number(limit));
    return res.json({ messages });
  } catch (err) {
    console.error('List messages error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Message not found' });
    return res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Delete message error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Mind Check Questions management
export async function listQuestions(req, res) {
  try {
    const { category = 'mindcheck', active } = req.query;
    const query = { category };
    if (active !== undefined) query.active = active === 'true';
    const questions = await Question.find(query).sort({ order: 1, createdAt: -1 });
    return res.json({ questions });
  } catch (err) {
    console.error('List questions error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createQuestion(req, res) {
  try {
    const { text, scale = '', category = 'mindcheck', order = 0, active = true } = req.body || {};
    if (!text || !String(text).trim()) return res.status(400).json({ message: 'Question text is required' });
    const created = await Question.create({ text: String(text).trim(), scale, category, order, active });
    return res.status(201).json({ question: created });
  } catch (err) {
    console.error('Create question error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const updated = await Question.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Question not found' });
    return res.json({ question: updated });
  } catch (err) {
    console.error('Update question error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Question not found' });
    return res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error('Delete question error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
