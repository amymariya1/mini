import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from './src/models/Appointment.js';
import User from './src/models/User.js';

dotenv.config();

async function setupTherapistAvailability() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all therapists
    const therapists = await User.find({ role: 'therapist' });
    console.log(`Found ${therapists.length} therapists`);

    if (therapists.length === 0) {
      console.log('No therapists found in the database');
      return;
    }

    // Set availability for the next 30 days for each therapist
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const therapist of therapists) {
      console.log(`\nSetting up availability for ${therapist.name}...`);
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Check if availability already exists for this date
        const existingAvailability = await Appointment.findOne({
          therapistId: therapist._id,
          date: date,
          userId: "000000000000000000000000"
        });

        if (!existingAvailability) {
          // Create availability record (full_day by default)
          const availability = new Appointment({
            therapistId: therapist._id,
            userId: "000000000000000000000000", // Dummy user ID for availability
            date: date,
            timeSlot: "00:00-00:00", // Dummy time slot
            availabilityType: 'full_day', // Available all day
            status: 'scheduled'
          });

          await availability.save();
          console.log(`  ✓ Set full_day availability for ${date.toDateString()}`);
        } else {
          console.log(`  - Availability already exists for ${date.toDateString()}`);
        }
      }
    }

    console.log('\n✅ Therapist availability setup complete!');
    console.log('Therapists are now available for the next 30 days.');
    
  } catch (error) {
    console.error('Error setting up therapist availability:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

setupTherapistAvailability();
