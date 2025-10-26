import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Time slot information
  timeSlot: {
    type: String, // e.g., "09:00-10:00", "14:00-15:00"
    required: true
  },
  // Availability types: 'full_day', 'morning', 'evening', 'none'
  availabilityType: {
    type: String,
    enum: ['full_day', 'morning', 'evening', 'none'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  // Patient information
  age: {
    type: Number,
    min: 1,
    max: 120
  },
  problem: {
    type: String
  },
  // Payment information
  paymentId: {
    type: String
  },
  amount: {
    type: Number
  },
  // Reference to leave if appointment was affected by a leave
  leaveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Leave"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
appointmentSchema.index({ therapistId: 1, date: 1 });
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ paymentId: 1 });

export default mongoose.model("Appointment", appointmentSchema);