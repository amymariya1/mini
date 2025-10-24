import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  // The item being liked (could be a post, comment, etc.)
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  // The type of item being liked (e.g., 'post', 'comment')
  targetType: {
    type: String,
    required: true,
    enum: ['post', 'comment'],
    index: true
  },
  // User who created the like
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Cached user info for better performance
  userInfo: {
    name: { type: String, required: true },
    profilePicture: { type: String, default: '' }
  },
  // Type of like (for future use, e.g., 'like', 'love', 'laugh', etc.)
  type: {
    type: String,
    default: 'like',
    enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
    index: true
  }
}, {
  timestamps: true
});

// Ensure a user can only like an item once
likeSchema.index(
  { targetId: 1, user: 1, targetType: 1 },
  { unique: true }
);

// Add a pre-save hook to populate userInfo
likeSchema.pre('save', async function(next) {
  if (this.isNew && this.user) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.user).select('name profilePicture');
      if (user) {
        this.userInfo = {
          name: user.name,
          profilePicture: user.profilePicture || ''
        };
      }
    } catch (err) {
      console.error('Error populating userInfo in like:', err);
    }
  }
  next();
});

// Static method to get like counts for multiple items
likeSchema.statics.getLikeCounts = async function(targetIds, targetType) {
  if (!targetIds || !targetIds.length || !targetType) return {};
  
  const results = await this.aggregate([
    {
      $match: {
        targetId: { $in: targetIds },
        targetType: targetType
      }
    },
    {
      $group: {
        _id: '$targetId',
        count: { $sum: 1 },
        // Optionally group by like type if needed
        types: { $push: '$type' }
      }
    }
  ]);

  // Convert array to object with targetId as key
  return results.reduce((acc, { _id, count, types }) => {
    acc[_id.toString()] = { count, types };
    return acc;
  }, {});
};

// Static method to check if users have liked items
likeSchema.statics.getUserLikes = async function(userId, targetIds, targetType) {
  if (!userId || !targetIds || !targetIds.length || !targetType) return {};
  
  const likes = await this.find({
    user: userId,
    targetId: { $in: targetIds },
    targetType: targetType
  });

  // Convert array to object with targetId as key
  return likes.reduce((acc, like) => {
    acc[like.targetId.toString()] = {
      liked: true,
      type: like.type,
      likedAt: like.createdAt
    };
    return acc;
  }, {});
};

export default mongoose.model('Like', likeSchema);
