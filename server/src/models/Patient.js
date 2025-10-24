import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    medicalHistory: {
      type: String,
      trim: true
    },
    notes: [{
      date: {
        type: Date,
        default: Date.now
      },
      content: {
        type: String,
        required: true
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    lastAppointment: {
      type: Date
    },
    nextAppointment: {
      type: Date
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    },
    preferences: {
      communication: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      language: {
        type: String,
        default: 'en'
      }
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index to ensure a user can only be added once per therapist
patientSchema.index({ user: 1, therapist: 1 }, { unique: true });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
