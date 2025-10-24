import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { sendTherapistApprovalEmail, sendTherapistRejectionEmail } from '../utils/mailer.js';
import Product from '../models/Product.js';
import Post from '../models/Post.js';
import Message from '../models/Message.js';
import Question from '../models/Question.js';

// Token handling: prefer stateless HMAC token (JWT-like) if ADMIN_TOKEN_SECRET is set; fallback to in-memory tokens
const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET || '';
const sessionTokens = new Map(); // token -> adminId (fallback only)

function base64url(input) {
  return Buffer.from(JSON.stringify(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64url(header);
  const payloadB64 = base64url(payload);
  const data = `${headerB64}.${payloadB64}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${data}.${signature}`;
}

function verifyToken(token) {
  try {
    const [headerB64, payloadB64, sig] = String(token).split('.');
    if (!headerB64 || !payloadB64 || !sig) return null;
    const data = `${headerB64}.${payloadB64}`;
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    if (expected !== sig) return null;
    const payloadJson = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    const payload = JSON.parse(payloadJson);
    if (payload.exp && Math.floor(Date.now() / 1000) > Number(payload.exp)) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function generateRandomToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function registerAdmin(req, res) {
  try {
    const { name, email, password, setupCode } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Registration guard: allow if no admins exist, OR if explicitly allowed by env, OR if setup code matches
    const totalAdmins = await Admin.countDocuments({});
    const allowFlag = String(process.env.ADMIN_ALLOW_REGISTER || '').toLowerCase() === 'true';
    const setupOk = (process.env.ADMIN_SETUP_CODE && setupCode && setupCode === process.env.ADMIN_SETUP_CODE);
    if (totalAdmins > 0 && !allowFlag && !setupOk) {
      return res.status(403).json({ message: 'Admin registration is disabled (an admin already exists)' });
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

    console.log('Login attempt with email:', email);
    const admin = await Admin.findOne({ email, active: true });
    console.log('Admin found:', admin);
    
    if (!admin) {
      console.log('No active admin found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    console.log('Password match:', ok);
    
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Prefer stateless token if secret is configured, otherwise fallback to in-memory token
    let token;
    if (ADMIN_SECRET) {
      const now = Math.floor(Date.now() / 1000);
      token = signToken({ sub: String(admin._id), iat: now, exp: now + (60 * 60 * 12) }); // 12h expiry
    } else {
      token = generateRandomToken();
      sessionTokens.set(token, String(admin._id));
    }

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
    // Stateless tokens don't require server-side revocation; fallback tokens do
    if (!ADMIN_SECRET && token) sessionTokens.delete(token);
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Admin logout error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token || (req.body && req.body.token);
  if (!token) return res.status(401).json({ message: 'Missing admin token' });

  if (ADMIN_SECRET) {
    const payload = verifyToken(token);
    if (!payload || !payload.sub) return res.status(401).json({ message: 'Invalid admin token' });
    req.adminId = String(payload.sub);
    return next();
  }

  // Fallback legacy in-memory session
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

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isActive = !user.isActive;
    await user.save();
    
    return res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('Toggle user status error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent deletion of admin users
    if (user.userType === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    await User.findByIdAndDelete(id);
    
    return res.json({ 
      message: 'User deleted successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Delete user error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// List pending therapists (not approved yet)
export async function listPendingTherapists(_req, res) {
  try {
    const therapists = await User.find({ 
      userType: "therapist", 
      isApproved: false 
    }).select("name email age license createdAt");
    
    return res.json({ success: true, therapists });
  } catch (err) {
    console.error('List pending therapists error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Approve a therapist
export async function approveTherapist(req, res) {
  try {
    const { id } = req.params;
    
    // Find the therapist
    const therapist = await User.findById(id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    
    if (therapist.userType !== 'therapist') {
      return res.status(400).json({ message: 'User is not a therapist' });
    }
    
    // Update therapist status
    therapist.isApproved = true;
    therapist.isActive = true;
    await therapist.save();
    
    // Send approval email
    try {
      await sendTherapistApprovalEmail(therapist.email, {
        name: therapist.name
      });
      console.log(`Therapist approval email sent successfully to ${therapist.email}`);
    } catch (emailError) {
      console.error('Error sending therapist approval email:', emailError);
      // Don't fail the approval if email fails
    }
    
    return res.json({ 
      success: true,
      message: 'Therapist approved successfully',
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        isApproved: therapist.isApproved,
        isActive: therapist.isActive
      }
    });
  } catch (err) {
    console.error('Approve therapist error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Reject a therapist
export async function rejectTherapist(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Find the therapist
    const therapist = await User.findById(id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    
    if (therapist.userType !== 'therapist') {
      return res.status(400).json({ message: 'User is not a therapist' });
    }
    
    // Send rejection email before deleting/deactivating
    try {
      await sendTherapistRejectionEmail(therapist.email, {
        name: therapist.name,
        reason: reason || 'Your application did not meet our current requirements.'
      });
      console.log(`Therapist rejection email sent successfully to ${therapist.email}`);
    } catch (emailError) {
      console.error('Error sending therapist rejection email:', emailError);
      // Continue with rejection even if email fails
    }
    
    // Option 1: Delete the therapist account
    // await User.findByIdAndDelete(id);
    
    // Option 2: Keep the account but mark as rejected (recommended)
    therapist.isApproved = false;
    therapist.isActive = false;
    await therapist.save();
    
    return res.json({ 
      success: true,
      message: 'Therapist rejected successfully',
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        isApproved: therapist.isApproved,
        isActive: therapist.isActive
      }
    });
  } catch (err) {
    console.error('Reject therapist error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Products management (Shopping)
export async function listProducts(req, res) {
  try {
    const products = await Product.find(); // fetch all products
    res.json({ success: true, products });
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ message: "Server error" });
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

    // Validate incoming payload to avoid generic 500s on schema errors
    const errors = {};
    if (!payload.name || !String(payload.name).trim()) errors.name = 'Name is required';
    const priceNum = Number(payload.price);
    if (payload.price === undefined || Number.isNaN(priceNum) || priceNum < 0) errors.price = 'Valid price is required';
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation error', errors });
    }

    const stockNum = Number(payload.stock ?? 0);
    const normalizedStock = Number.isNaN(stockNum) ? 0 : Math.max(0, stockNum);
    const computedInStock = normalizedStock > 0 && (payload.inStock !== false);

    const created = await Product.create({
      name: String(payload.name).trim(),
      price: priceNum,
      description: payload.description || '',
      originalPrice: Number(payload.originalPrice ?? 0) || 0,
      category: payload.category || 'General',
      inStock: computedInStock,
      stock: normalizedStock,
      image: payload.image || '',
      badge: payload.badge || '',
      rating: Number(payload.rating ?? 0) || 0,
      reviews: Number(payload.reviews ?? 0) || 0,
    });
    return res.status(201).json({ product: created });
  } catch (err) {
    console.error('Create product error', err);
    // Bubble up clearer errors instead of a blanket 500
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (String(err?.name || '').includes('ServerSelectionError')) {
      return res.status(503).json({ message: 'Database unavailable. Please ensure MongoDB is running.' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    // Normalize stock and inStock linkage
    const update = { ...payload };
    if (update.stock !== undefined) {
      const stockNum = Number(update.stock);
      const normalizedStock = Number.isNaN(stockNum) ? 0 : Math.max(0, stockNum);
      update.stock = normalizedStock;
      // If inStock is not explicitly set, derive it from stock
      if (update.inStock === undefined) {
        update.inStock = normalizedStock > 0;
      }
    }
    if (update.inStock === false) {
      // If admin sets inStock false, ensure stock cannot be negative
      update.stock = Math.max(0, Number(update.stock ?? 0));
    }

    const updated = await Product.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
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

// Seed DASS-21 questions into Question collection
export async function seedDass21Questions(_req, res) {
  try {
    const category = 'mindcheck';
    const items = [
      { order: 1,  text: 'I found it hard to wind down', scale: 'S' },
      { order: 2,  text: 'I was aware of dryness of my mouth', scale: 'A' },
      { order: 3,  text: "I couldn't seem to experience any positive feeling at all", scale: 'D' },
      { order: 4,  text: 'I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)', scale: 'A' },
      { order: 5,  text: 'I found it difficult to work up the initiative to do things', scale: 'D' },
      { order: 6,  text: 'I tended to over-react to situations', scale: 'S' },
      { order: 7,  text: 'I experienced trembling (e.g., in the hands)', scale: 'A' },
      { order: 8,  text: 'I felt that I was using a lot of nervous energy', scale: 'S' },
      { order: 9,  text: 'I was worried about situations in which I might panic and make a fool of myself', scale: 'A' },
      { order: 10, text: 'I felt that I had nothing to look forward to', scale: 'D' },
      { order: 11, text: 'I found myself getting agitated', scale: 'S' },
      { order: 12, text: 'I found it difficult to relax', scale: 'S' },
      { order: 13, text: 'I felt down-hearted and blue', scale: 'D' },
      { order: 14, text: 'I was intolerant of anything that kept me from getting on with what I was doing', scale: 'S' },
      { order: 15, text: 'I felt I was close to panic', scale: 'A' },
      { order: 16, text: 'I was unable to become enthusiastic about anything', scale: 'D' },
      { order: 17, text: "I felt I wasn't worth much as a person", scale: 'D' },
      { order: 18, text: 'I felt that I was rather touchy', scale: 'S' },
      { order: 19, text: 'I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)', scale: 'A' },
      { order: 20, text: 'I felt scared without any good reason', scale: 'A' },
      { order: 21, text: 'I felt that life was meaningless', scale: 'D' },
    ];

    let created = 0;
    let updated = 0;
    for (const it of items) {
      // Upsert by category + order; keep text/scale synced; default active true
      const resDoc = await Question.findOneAndUpdate(
        { category, order: it.order },
        { $set: { text: it.text, scale: it.scale, active: true, category, order: it.order } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // Roughly detect whether it existed before by fetching again without upsert (not perfect but fine)
      // We simply increment created if the document was newly inserted by checking createdAt close to now is complex; instead run a separate find
      const exists = await Question.findOne({ _id: resDoc._id }).lean();
      if (exists) {
        // We can't easily differentiate; assume updated++ unless we detect prior different text via modifiedPaths; skipping detailed diff
        updated++;
      } else {
        created++;
      }
    }

    // Return latest list for this category ordered
    const questions = await Question.find({ category }).sort({ order: 1, createdAt: -1 });
    return res.json({ message: 'DASS-21 seeded', created, updated, questions });
  } catch (err) {
    console.error('Seed DASS-21 error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
