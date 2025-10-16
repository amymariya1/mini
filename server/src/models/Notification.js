import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  orderId: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['order_status', 'order_confirmation', 'order_shipped', 'order_delivered', 'order_cancelled'],
    default: 'order_status'
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: true
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Add index for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);