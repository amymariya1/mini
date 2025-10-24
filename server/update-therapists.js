import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User.js";

// Load environment variables
dotenv.config();

async function updateTherapists() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find all therapists
    const therapists = await User.find({ userType: "therapist" });
    console.log(`Found ${therapists.length} therapists`);

    // Update each therapist with default values for new fields
    for (const therapist of therapists) {
      let updated = false;
      
      if (!therapist.specialization) {
        therapist.specialization = "Mental Health Therapist";
        updated = true;
      }
      
      if (!therapist.bio) {
        therapist.bio = "Experienced therapist specializing in mental health and wellness. Committed to providing compassionate care and evidence-based treatments.";
        updated = true;
      }
      
      if (therapist.rating === undefined || therapist.rating === null) {
        therapist.rating = 0;
        updated = true;
      }
      
      if (therapist.experience === undefined || therapist.experience === null) {
        therapist.experience = 0;
        updated = true;
      }
      
      if (updated) {
        await therapist.save();
        console.log(`Updated therapist: ${therapist.name}`);
      }
    }
    
    console.log("✅ All therapists updated with default values for new fields");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating therapists:", error);
    process.exit(1);
  }
}

updateTherapists();