import dotenv from "dotenv";
import mongoose from "mongoose";
import Appointment from "./src/models/Appointment.js";

// Load environment variables
dotenv.config();

async function checkTimeSlots() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Count appointments
    const appointmentCount = await Appointment.countDocuments();
    console.log(`Total appointments: ${appointmentCount}`);
    
    if (appointmentCount > 0) {
      // Get distinct time slots
      const timeSlots = await Appointment.distinct("timeSlot");
      console.log("Existing time slots:", timeSlots);
      
      // Get sample appointments
      const appointments = await Appointment.find().limit(5);
      console.log("\nSample appointments:");
      appointments.forEach(app => {
        console.log(`- Date: ${app.date.toISOString().split('T')[0]}, Time Slot: ${app.timeSlot}, Therapist: ${app.therapistId}, User: ${app.userId}`);
      });
    } else {
      console.log("No appointments found in database");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking time slots:", error);
    process.exit(1);
  }
}

checkTimeSlots();