import { Router } from 'express';
import Product from '../models/Product.js';
import Post from '../models/Post.js';
import Message from '../models/Message.js';

const router = Router();

// Public Products
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category) query.category = category;
    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.json({ products });
  } catch (err) {
    console.error('Public list products error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    console.error('Public get product error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Public Posts (published only)
router.get('/posts', async (_req, res) => {
  try {
    const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
    return res.json({ posts });
  } catch (err) {
    console.error('Public list posts error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post || !post.published) return res.status(404).json({ message: 'Post not found' });
    return res.json({ post });
  } catch (err) {
    console.error('Public get post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Public Messages (chat)
router.get('/messages', async (req, res) => {
  try {
    const { room = 'global', limit = 100 } = req.query;
    const messages = await Message.find({ room }).sort({ createdAt: -1 }).limit(Number(limit));
    return res.json({ messages });
  } catch (err) {
    console.error('Public list messages error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { text, room = 'global', senderName = '' } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ message: 'Text is required' });
    const created = await Message.create({ text: String(text).trim(), room, senderName, isSystem: false });
    return res.status(201).json({ message: created });
  } catch (err) {
    console.error('Public create message error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;