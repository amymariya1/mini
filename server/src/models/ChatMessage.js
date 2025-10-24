import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    recipient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    message: { 
      type: String, 
      required: true,
      trim: true 
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    readAt: { 
      type: Date, 
      default: null 
    },
    // Chat room identifier (combination of sender and recipient IDs)
    roomId: { 
      type: String, 
      required: true,
      index: true 
    }
  },
  { 
    timestamps: true 
  }
);

// Index for efficient querying of chat history
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1, recipient: 1 });
chatMessageSchema.index({ read: 1 });

// Create roomId from sender and recipient IDs (always consistent order)
chatMessageSchema.pre('save', function(next) {
  if (!this.roomId) {
    const ids = [this.sender.toString(), this.recipient.toString()].sort();
    this.roomId = `${ids[0]}_${ids[1]}`;
  }
  next();
});

export default mongoose.model('ChatMessage', chatMessageSchema);

