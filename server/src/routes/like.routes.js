import { Router } from 'express';
import mongoose from 'mongoose';
import Like from '../models/Like.js';
import Post from '../models/Post.js';
import { protect as requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Toggle like on a post
router.post('/posts/:postId/like', requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const existingLike = await Like.findOne({
      targetId: postId,
      user: userId,
      targetType: 'post'
    });

    if (existingLike) {
      // Unlike the post
      await Like.deleteOne({ _id: existingLike._id });
      
      // Decrement like count in post (optional, can be calculated on the fly)
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
      
      return res.json({ 
        liked: false,
        likeCount: Math.max(0, (post.likeCount || 0) - 1)
      });
    } else {
      // Like the post
      const like = new Like({
        targetId: postId,
        targetType: 'post',
        user: userId,
        type: 'like' // Default like type, can be extended for other reactions
      });
      
      await like.save();
      
      // Increment like count in post (optional)
      await Post.findByIdAndUpdate(postId, { 
        $inc: { likeCount: 1 },
        // Add to likedBy array if needed for quick lookup
        $addToSet: { likedBy: userId }
      });
      
      return res.json({ 
        liked: true,
        likeCount: (post.likeCount || 0) + 1
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get like status for current user on multiple posts
router.get('/posts/likes/status', requireAuth, async (req, res) => {
  try {
    const { postIds } = req.query;
    
    if (!postIds || !Array.isArray(postIds)) {
      return res.status(400).json({ message: 'postIds array is required' });
    }
    
    const validPostIds = postIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    const likes = await Like.find({
      targetId: { $in: validPostIds },
      user: req.user._id,
      targetType: 'post'
    });
    
    // Convert to a map of postId -> like status
    const likeStatus = likes.reduce((acc, like) => {
      acc[like.targetId.toString()] = {
        liked: true,
        type: like.type,
        likedAt: like.createdAt
      };
      return acc;
    }, {});
    
    return res.json({ likeStatus });
  } catch (error) {
    console.error('Error getting like status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get users who liked a post
router.get('/posts/:postId/likes', async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 20, skip = 0 } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    const likes = await Like.find({ 
      targetId: postId,
      targetType: 'post'
    })
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate('user', 'name profilePicture')
    .lean();
    
    // Format response
    const formattedLikes = likes.map(like => ({
      _id: like._id,
      user: like.userInfo || {
        _id: like.user?._id,
        name: like.user?.name,
        profilePicture: like.user?.profilePicture
      },
      type: like.type,
      createdAt: like.createdAt
    }));
    
    return res.json({ likes: formattedLikes });
  } catch (error) {
    console.error('Error getting post likes:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
