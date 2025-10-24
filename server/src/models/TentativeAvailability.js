import mongoose from "mongoose";

const tentativeAvailabilitySchema = new mongoose.Schema({
  therapistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  availability: { 
    type: String, 
    enum: ['full_day', 'morning', 'evening', 'none', 'tentative'], 
    default: 'tentative' 
  },
  reason: { 
    type: String 
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
tentativeAvailabilitySchema.index({ therapistId: 1, date: 1 });

export default mongoose.model("TentativeAvailability", tentativeAvailabilitySchema);