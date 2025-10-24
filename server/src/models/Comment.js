import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  // Reference to the post this comment belongs to
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true,
    index: true
  },
  // User who made the comment
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  // Cached author info for better performance
  authorInfo: {
    name: { type: String, required: true },
    profilePicture: { type: String, default: '' }
  },
  // The comment content
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  // Parent comment ID for nested comments (replies)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  // Track if the comment has been edited
  isEdited: {
    type: Boolean,
    default: false
  },
  // Track if the comment is active/hidden
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

// Virtual for replies to this comment
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Add a pre-save hook to populate authorInfo
commentSchema.pre('save', async function(next) {
  if (this.isNew && this.author) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.author).select('name profilePicture');
      if (user) {
        this.authorInfo = {
          name: user.name,
          profilePicture: user.profilePicture || ''
        };
      }
    } catch (err) {
      console.error('Error populating authorInfo in comment:', err);
    }
  }
  next();
});

export default mongoose.model('Comment', commentSchema);
