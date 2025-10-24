import TherapistSchedule from "../models/TherapistSchedule.js";
import Appointment from "../models/Appointment.js";
import mongoose from "mongoose";

// Get or create therapist schedule
export async function getTherapistSchedule(req, res) {
  try {
    const { therapistId } = req.query;
    
    if (!therapistId) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID is required" 
      });
    }
    
    let schedule = await TherapistSchedule.findOne({ therapistId });
    
    // If no schedule exists, create a default one
    if (!schedule) {
      schedule = new TherapistSchedule({
        therapistId,
        weeklySchedule: {
          monday: { isAvailable: false, timeSlots: [] },
          tuesday: { isAvailable: false, timeSlots: [] },
          wednesday: { isAvailable: false, timeSlots: [] },
          thursday: { isAvailable: false, timeSlots: [] },
          friday: { isAvailable: false, timeSlots: [] },
          saturday: { isAvailable: false, timeSlots: [] },
          sunday: { isAvailable: false, timeSlots: [] }
        },
        defaultAvailability: 'none'
      });
      await schedule.save();
    }
    
    res.status(200).json({ 
      success: true, 
      data: schedule
    });
  } catch (error) {
    console.error("Error getting therapist schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get therapist schedule" 
    });
  }
}

// Update therapist schedule
export async function updateTherapistSchedule(req, res) {
  try {
    const { therapistId, weeklySchedule, defaultAvailability } = req.body;
    
    if (!therapistId) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID is required" 
      });
    }
    
    console.log("Updating schedule for therapist:", therapistId);
    console.log("Weekly schedule:", weeklySchedule);
    
    let schedule = await TherapistSchedule.findOne({ therapistId });
    
    if (schedule) {
      // Update existing schedule
      if (weeklySchedule) schedule.weeklySchedule = weeklySchedule;
      if (defaultAvailability) schedule.defaultAvailability = defaultAvailability;
      schedule.updatedAt = Date.now();
      await schedule.save();
    } else {
      // Create new schedule
      schedule = new TherapistSchedule({
        therapistId,
        weeklySchedule: weeklySchedule || {
          monday: { isAvailable: false, timeSlots: [] },
          tuesday: { isAvailable: false, timeSlots: [] },
          wednesday: { isAvailable: false, timeSlots: [] },
          thursday: { isAvailable: false, timeSlots: [] },
          friday: { isAvailable: false, timeSlots: [] },
          saturday: { isAvailable: false, timeSlots: [] },
          sunday: { isAvailable: false, timeSlots: [] }
        },
        defaultAvailability: defaultAvailability || 'none'
      });
      await schedule.save();
    }
    
    console.log("Schedule saved:", schedule);
    
    res.status(200).json({ 
      success: true, 
      message: "Schedule updated successfully",
      data: schedule
    });
  } catch (error) {
    console.error("Error updating therapist schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update therapist schedule" 
    });
  }
}

// Get available time slots for a specific date using the recurring schedule
export async function getAvailableTimeSlotsFromSchedule(req, res) {
  try {
    const { therapistId, date } = req.query;
    
    if (!therapistId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID and date are required" 
      });
    }
    
    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    console.log("Getting slots for:", therapistId, "on", date, "which is", dayName);
    
    // Get therapist's recurring schedule
    const schedule = await TherapistSchedule.findOne({ therapistId });
    
    if (!schedule) {
      console.log("No schedule found for therapist");
      return res.status(200).json({ 
        success: true, 
        data: [] 
      });
    }
    
    const daySchedule = schedule.weeklySchedule[dayName];
    
    if (!daySchedule || !daySchedule.isAvailable || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
      console.log("Day is not available or no time slots set");
      return res.status(200).json({ 
        success: true, 
        data: [] 
      });
    }
    
    console.log("Available time slots for", dayName, ":", daySchedule.timeSlots);
    
    // Check for any date-specific overrides (from Appointment collection)
    const dateOverride = await Appointment.findOne({
      therapistId: new mongoose.Types.ObjectId(therapistId),
      date: new Date(date),
      userId: "000000000000000000000000" // Availability override record
    });
    
    // If there's a date-specific override, use that instead
    if (dateOverride && dateOverride.availabilityType === 'none') {
      console.log("Date has override set to 'none'");
      return res.status(200).json({ 
        success: true, 
        data: [] 
      });
    }
    
    // Get booked appointments for this date
    const bookedAppointments = await Appointment.find({ 
      therapistId: new mongoose.Types.ObjectId(therapistId),
      date: new Date(date),
      status: 'scheduled',
      userId: { $ne: "000000000000000000000000" }
    });
    
    const bookedTimeSlots = bookedAppointments.map(app => app.timeSlot);
    console.log("Booked time slots:", bookedTimeSlots);
    
    // Filter out booked slots
    const availableSlots = daySchedule.timeSlots.filter(slot => !bookedTimeSlots.includes(slot));
    
    console.log("Final available slots:", availableSlots);
    
    res.status(200).json({ 
      success: true, 
      data: availableSlots
    });
  } catch (error) {
    console.error("Error getting available time slots from schedule:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get available time slots" 
    });
  }
}

export default {
  getTherapistSchedule,
  updateTherapistSchedule,
  getAvailableTimeSlotsFromSchedule
};
