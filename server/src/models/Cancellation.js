import mongoose from "mongoose";

const cancellationSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },
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
  timeSlot: {
    type: String,
    required: true
  },
  availabilityType: {
    type: String,
    enum: ['full_day', 'morning', 'evening'],
    required: true
  },
  reason: {
    type: String,
    default: "Cancelled by therapist"
  },
  cancelledBy: {
    type: String,
    enum: ['therapist', 'admin', 'system'],
    default: 'therapist'
  },
  cancellationDate: {
    type: Date,
    default: Date.now
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
cancellationSchema.index({ therapistId: 1, date: 1 });
cancellationSchema.index({ userId: 1, date: 1 });
cancellationSchema.index({ appointmentId: 1 });

export default mongoose.model("Cancellation", cancellationSchema);