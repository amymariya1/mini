import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    // User who submitted the blog (optional in case of anonymous/public submission)
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    tags: [{ type: String, index: true }],
    // Publication flag used by public endpoints
    published: { type: Boolean, default: false, index: true },
    coverImage: { type: String, default: '' },
    // Moderation workflow
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
    // Social
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        authorName: { type: String, default: '' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);