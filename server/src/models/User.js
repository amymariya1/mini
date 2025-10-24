// server/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      min: 0,
      max: 150,
    },

    userType: {
      type: String,
      enum: ["user", "admin", "therapist"],
      default: "user",
    },

    // New field for therapist license
    license: {
      type: String,
      trim: true,
    },

    // Approval status for therapists
    isApproved: {
      type: Boolean,
      default: false,
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    resetPasswordTokenHash: {
      type: String,
      default: null,
      index: true,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // Additional fields for therapists
    specialization: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    experience: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { timestamps: true }
);

// Ensure unique email index in database
userSchema.index({ email: 1 }, { unique: true });

// Export the model
export default mongoose.model("User", userSchema);