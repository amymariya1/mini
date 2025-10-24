import mongoose from "mongoose";

const therapistScheduleSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // Each therapist has one schedule
  },
  // Weekly recurring schedule
  weeklySchedule: {
    monday: {
      isAvailable: { type: Boolean, default: false },
      timeSlots: [String] // Array of time slots like ["09:00-10:00", "10:00-11:00"]
    },
    tuesday: {
      isAvailable: { type: Boolean, default: false },
      timeSlots: [String]
    },
    wednesday: {
      isAvailable: { type: Boolean, default: false },
      timeSlots: [String]
    },
    thursday: {
      isAvailable: { type: Boolean, default: false },
      timeSlots: [String]
    },
    friday: {
      isAvailable: { type: Boolean, default: false },
      timeSlots: [String]
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      timeSlots: [String]
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      timeSlots: [String]
    }
  },
  // Default availability type for quick setup
  defaultAvailability: {
    type: String,
    enum: ['full_day', 'morning', 'evening', 'custom', 'none'],
    default: 'none'
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
therapistScheduleSchema.index({ therapistId: 1 });

export default mongoose.model("TherapistSchedule", therapistScheduleSchema);
