import { Router } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = Router();

// Simple user auth middleware based on headers (same pattern as journal.routes)
async function requireUser(req, res, next) {
  try {
    const email = req.headers['x-user-email'];
    const userIdHeader = req.headers['x-user-id'];

    let user = null;
    if (userIdHeader && mongoose.isValidObjectId(userIdHeader)) {
      user = await User.findById(userIdHeader);
    } else if (email) {
      user = await User.findOne({ email });
      // Auto-provision a minimal user if authenticating via email header and not present in DB
      if (!user) {
        const name = String(email).split('@')[0] || 'User';
        user = await User.create({
          name,
          email,
          passwordHash: 'external',
          age: 18,
        });
      }
    }

    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/posts - list all published posts
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, Math.max(1, parseInt(limit)));
    
    const query = { published: true };
    if (tag) {
      query.tags = { $in: [String(tag).toLowerCase()] };
    }
    
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(100, Math.max(1, parseInt(limit)))),
      Post.countDocuments(query)
    ]);
    
    return res.json({
      posts,
      pagination: {
        total,
        page: Math.max(1, parseInt(page)),
        totalPages: Math.ceil(total / Math.min(100, Math.max(1, parseInt(limit)))),
        limit: Math.min(100, Math.max(1, parseInt(limit)))
      }
    });
  } catch (err) {
    console.error('List posts error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts - submit a new blog post (immediately published)
router.post('/posts', requireUser, async (req, res) => {
  try {
    const { title, content, tags = [], coverImage = '' } = req.body || {};
    if (!title || !String(title).trim() || !content || !String(content).trim()) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const created = await Post.create({
      title: String(title).trim(),
      content: String(content).trim(),
      tags: Array.isArray(tags) ? tags.slice(0, 8) : [],
      coverImage: String(coverImage || ''),
      author: req.user?._id || null,
      status: 'approved',
      published: true,
      // Include author information directly in the post
      authorInfo: {
        name: req.user?.name || 'Anonymous',
        profilePicture: req.user?.profilePicture || ''
      }
    });

    return res.status(201).json({ post: created });
  } catch (err) {
    console.error('Create user post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/my-posts - list the current user's posts (optional helper)
router.get('/my-posts', requireUser, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    return res.json({ posts });
  } catch (err) {
    console.error('List my posts error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:id - delete a post owned by the current user
router.delete('/posts/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await Post.deleteOne({ _id: id });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete user post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/:id/like - toggle like by current user
router.post('/posts/:id/like', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid post id' });
    const post = await Post.findById(id);
    if (!post || !post.published) return res.status(404).json({ message: 'Post not found' });
    const uid = String(req.user._id);
    const liked = (post.likedBy || []).some(u => String(u) === uid);
    if (liked) {
      post.likedBy = post.likedBy.filter(u => String(u) !== uid);
    } else {
      post.likedBy = [...(post.likedBy || []), req.user._id];
    }
    await post.save();
    return res.json({ liked: !liked, likes: post.likedBy.length });
  } catch (err) {
    console.error('Toggle like error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/:id/comments - add a new comment
router.post('/posts/:id/comments', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { text = '' } = req.body || {};
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid post id' });
    if (!text || !String(text).trim()) return res.status(400).json({ message: 'Comment text is required' });
    const post = await Post.findById(id);
    if (!post || !post.published) return res.status(404).json({ message: 'Post not found' });
    const comment = {
      author: req.user?._id || null,
      authorName: req.user?.name || (req.user?.email ? String(req.user.email).split('@')[0] : 'User'),
      text: String(text).trim(),
      createdAt: new Date(),
    };
    post.comments = [...(post.comments || []), comment];
    await post.save();
    return res.status(201).json({ comment });
  } catch (err) {
    console.error('Add comment error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;