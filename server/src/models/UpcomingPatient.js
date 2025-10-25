import mongoose from "mongoose";

const upcomingPatientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      min: 1,
      max: 120
    },
    observation: {
      type: String,
      trim: true
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'cancelled', 'completed'],
      default: 'scheduled'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying by therapist and appointment date
upcomingPatientSchema.index({ therapist: 1, appointmentDate: 1 });
upcomingPatientSchema.index({ email: 1 });
upcomingPatientSchema.index({ status: 1 });

const UpcomingPatient = mongoose.model('UpcomingPatient', upcomingPatientSchema);

export default UpcomingPatient;