import mongoose from 'mongoose';

const meditationVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    duration: {
      type: Number, // in seconds
      required: true
    },
    category: {
      type: String,
      enum: ['meditation', 'breathing', 'mindfulness', 'relaxation', 'sleep', 'anxiety-relief'],
      default: 'meditation'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    tags: [{
      type: String,
      trim: true
    }],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    featured: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

// Index for better query performance
meditationVideoSchema.index({ category: 1, isActive: 1 });
meditationVideoSchema.index({ featured: 1, isActive: 1 });
meditationVideoSchema.index({ createdAt: -1 });

export default mongoose.model('MeditationVideo', meditationVideoSchema);

