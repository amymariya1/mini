import dotenv from "dotenv";
import mongoose from "mongoose";
import Appointment from "./src/models/Appointment.js";

// Load environment variables
dotenv.config();

async function bookAppointment() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Book an appointment for therapist1 on 2025-10-25 at 10:00-11:00
    const therapistId = "68efbaddc8cb709b19e5bb1a"; // therapist1
    const userId = "000000000000000000000001"; // Dummy user ID
    const date = "2025-10-25";
    const timeSlot = "10:00-11:00";
    
    // Create the appointment
    const appointment = new Appointment({
      therapistId: new mongoose.Types.ObjectId(therapistId),
      userId: new mongoose.Types.ObjectId(userId),
      date: new Date(date),
      timeSlot,
      availabilityType: 'full_day',
      status: 'scheduled'
    });
    
    await appointment.save();
    console.log(`✅ Appointment booked for therapist ${therapistId} on ${date} at ${timeSlot}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error booking appointment:", error);
    process.exit(1);
  }
}

bookAppointment();