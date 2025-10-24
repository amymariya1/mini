import dotenv from "dotenv";
import mongoose from "mongoose";
import Appointment from "./src/models/Appointment.js";

// Load environment variables
dotenv.config();

async function setAvailability() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Set availability for therapist1 on 2025-10-25
    const therapistId = "68efbaddc8cb709b19e5bb1a"; // therapist1
    const date = "2025-10-25";
    
    // Check if an appointment already exists for this date and therapist
    let appointment = await Appointment.findOne({ 
      therapistId: new mongoose.Types.ObjectId(therapistId), 
      date: new Date(date) 
    });
    
    if (appointment) {
      // Update existing appointment
      appointment.availability = 'full_day';
      appointment.updatedAt = Date.now();
      await appointment.save();
      console.log("✅ Updated existing availability");
    } else {
      // Create new appointment
      appointment = new Appointment({
        therapistId: new mongoose.Types.ObjectId(therapistId),
        userId: new mongoose.Types.ObjectId("000000000000000000000000"), // Dummy user ID
        date: new Date(date),
        timeSlot: "00:00-00:00", // Dummy time slot
        availability: 'full_day',
        status: 'scheduled'
      });
      await appointment.save();
      console.log("✅ Created new availability");
    }
    
    console.log(`Availability set for therapist ${therapistId} on ${date}: full_day`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting availability:", error);
    process.exit(1);
  }
}

setAvailability();