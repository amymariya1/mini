import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Leave from "../models/Leave.js";
import TherapistSchedule from "../models/TherapistSchedule.js";
import mongoose from "mongoose";
import { sendBookingConfirmationEmail, sendAppointmentInvoiceEmail } from "../utils/mailer.js";

// Set therapist availability for a specific date
export async function setAvailability(req, res) {
  try {
    const { therapistId, date, availability } = req.body;
    
    // Validate input
    if (!therapistId || !date || !availability) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID, date, and availability are required" 
      });
    }
    
    // Validate availability value
    const validAvailabilities = ['full_day', 'morning', 'evening', 'none'];
    if (!validAvailabilities.includes(availability)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid availability value" 
      });
    }
    
    // Check if an availability record already exists for this date and therapist (look for dummy record only)
    let appointment = await Appointment.findOne({ 
      therapistId, 
      date: new Date(date),
      userId: "000000000000000000000000" // Only look for availability records
    });
    
    console.log("Setting availability for therapist:", therapistId, "date:", date, "availability:", availability);
    
    if (appointment) {
      // Update existing appointment
      console.log("Updating existing availability record");
      appointment.availabilityType = availability; // Fixed: use availabilityType instead of availability
      appointment.updatedAt = Date.now();
      await appointment.save();
    } else {
      // Create new appointment
      console.log("Creating new availability record");
      appointment = new Appointment({
        therapistId,
        userId: "000000000000000000000000", // Dummy user ID for availability records
        date: new Date(date),
        timeSlot: "00:00-00:00", // Dummy time slot for availability records
        availabilityType: availability, // Fixed: use availabilityType instead of availability
        status: "scheduled"
      });
      await appointment.save();
    }
    
    console.log("Availability saved:", appointment);
    
    res.status(200).json({ 
      success: true, 
      message: "Availability set successfully",
      data: appointment
    });
  } catch (error) {
    console.error("Error setting availability:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to set availability" 
    });
  }
}

// Get therapist availability for a specific date
export async function getAvailability(req, res) {
  try {
    const { therapistId, date } = req.query;
    
    // Validate input
    if (!therapistId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID and date are required" 
      });
    }
    
    const appointment = await Appointment.findOne({ 
      therapistId, 
      date: new Date(date) 
    });
    
    res.status(200).json({ 
      success: true, 
      data: appointment || { availability: 'none' }
    });
  } catch (error) {
    console.error("Error getting availability:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get availability" 
    });
  }
}

// Get therapist availability for a date range
export async function getAvailabilityRange(req, res) {
  try {
    const { therapistId, startDate, endDate } = req.query;
    
    // Validate input
    if (!therapistId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID, start date, and end date are required" 
      });
    }
    
    const appointments = await Appointment.find({ 
      therapistId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
    
    res.status(200).json({ 
      success: true, 
      data: appointments
    });
  } catch (error) {
    console.error("Error getting availability range:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get availability range" 
    });
  }
}

// Get available time slots for a therapist on a specific date
export async function getAvailableTimeSlots(req, res) {
  try {
    const { therapistId, date } = req.query;
    
    // Validate input
    if (!therapistId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID and date are required" 
      });
    }
    
    // Validate that therapistId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid therapist ID format" 
      });
    }
    
    // Define standard time slots (9 AM to 5 PM with 1-hour intervals)
    const allTimeSlots = [
      "09:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "12:00-13:00",
      "13:00-14:00",
      "14:00-15:00",
      "15:00-16:00",
      "16:00-17:00"
    ];
    
    // Define time slots for different availability types
    const morningSlots = [
      "09:00-10:00",
      "10:00-11:00",
      "11:00-12:00"
    ];
    
    const eveningSlots = [
      "13:00-14:00",
      "14:00-15:00",
      "15:00-16:00",
      "16:00-17:00"
    ];
    
    // Check if therapist has leave on this date
    const leaveOnDate = await Leave.findOne({
      therapistId: new mongoose.Types.ObjectId(therapistId),
      startDate: { $lte: new Date(date) },
      endDate: { $gte: new Date(date) }
    });
    
    if (leaveOnDate) {
      return res.status(200).json({ 
        success: true, 
        data: [] // No available slots if therapist is on leave
      });
    }
    
    // First, check for recurring schedule
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    console.log("Checking availability for:", therapistId, "on", date, "which is", dayName);
    
    // Get therapist's recurring schedule
    const schedule = await TherapistSchedule.findOne({ therapistId: new mongoose.Types.ObjectId(therapistId) });
    
    let availableSlots = [];
    
    if (schedule && schedule.weeklySchedule[dayName] && schedule.weeklySchedule[dayName].isAvailable) {
      // Use recurring schedule
      availableSlots = schedule.weeklySchedule[dayName].timeSlots || [];
      console.log("Using recurring schedule. Available slots:", availableSlots);
    } else {
      // Fallback to old system - check for date-specific availability record
      const availability = await Appointment.findOne({ 
        therapistId: new mongoose.Types.ObjectId(therapistId),
        date: new Date(date),
        userId: "000000000000000000000000" // Only look for availability records, not actual appointments
      });
      
      console.log("No recurring schedule, checking date-specific availability:", availability);
      
      // If no availability set or explicitly set to none, return no slots
      if (!availability || availability.availabilityType === 'none') {
        console.log("No availability or availability is 'none'");
        return res.status(200).json({ 
          success: true, 
          data: [] // No available slots if therapist is not available
        });
      }
      
      console.log("Availability type:", availability.availabilityType);
      
      // Determine which time slots are available based on therapist's availability
      switch (availability.availabilityType) {
        case 'full_day':
          availableSlots = [...allTimeSlots];
          break;
        case 'morning':
          availableSlots = [...morningSlots];
          break;
        case 'evening':
          availableSlots = [...eveningSlots];
          break;
        default:
          availableSlots = [];
      }
    }
    
    // Get booked appointments for this date (exclude dummy availability records)
    const bookedAppointments = await Appointment.find({ 
      therapistId: new mongoose.Types.ObjectId(therapistId),
      date: new Date(date),
      status: 'scheduled',
      userId: { $ne: "000000000000000000000000" } // Exclude availability records
    });
    
    console.log("Booked appointments:", bookedAppointments.length);
    
    // Extract booked time slots
    const bookedTimeSlots = bookedAppointments.map(app => app.timeSlot);
    console.log("Booked time slots:", bookedTimeSlots);
    
    // Filter out booked time slots from available slots
    const finalAvailableTimeSlots = availableSlots.filter(slot => !bookedTimeSlots.includes(slot));
    
    console.log("Final available time slots:", finalAvailableTimeSlots);
    
    res.status(200).json({ 
      success: true, 
      data: finalAvailableTimeSlots
    });
  } catch (error) {
    console.error("Error getting available time slots:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get available time slots" 
    });
  }
}

// Book an appointment
export async function bookAppointment(req, res) {
  try {
    const { therapistId, userId, date, timeSlot, availabilityType, age, problem } = req.body;
    
    console.log("Booking appointment with data:", { therapistId, userId, date, timeSlot, age, problem });
    
    // Validate input
    if (!therapistId || !userId || !date || !timeSlot) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID, user ID, date, and time slot are required" 
      });
    }
    
    // Check if therapist has leave on this date
    const leaveOnDate = await Leave.findOne({
      therapistId,
      startDate: { $lte: new Date(date) },
      endDate: { $gte: new Date(date) }
    });
    
    if (leaveOnDate) {
      console.log("Therapist has leave on this date");
      return res.status(400).json({ 
        success: false, 
        message: "Therapist is not available on this date due to scheduled leave" 
      });
    }
    
    // Check therapist availability using the same logic as getAvailableTimeSlots
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    console.log("Checking availability for:", therapistId, "on", date, "which is", dayName);
    
    // Get therapist's recurring schedule
    const schedule = await TherapistSchedule.findOne({ therapistId: new mongoose.Types.ObjectId(therapistId) });
    
    let isTherapistAvailable = false;
    let therapistAvailabilityType = 'none'; // Default to 'none'
    
    if (schedule && schedule.weeklySchedule[dayName] && schedule.weeklySchedule[dayName].isAvailable) {
      // Use recurring schedule
      const availableSlots = schedule.weeklySchedule[dayName].timeSlots || [];
      console.log("Using recurring schedule. Available slots:", availableSlots);
      if (availableSlots.includes(timeSlot)) {
        isTherapistAvailable = true;
        // Determine availability type based on time slot
        if (timeSlot.startsWith('09:') || timeSlot.startsWith('10:') || timeSlot.startsWith('11:')) {
          therapistAvailabilityType = 'morning';
        } else if (timeSlot.startsWith('13:') || timeSlot.startsWith('14:') || timeSlot.startsWith('15:') || timeSlot.startsWith('16:')) {
          therapistAvailabilityType = 'evening';
        } else {
          therapistAvailabilityType = 'full_day';
        }
      }
    } else {
      // Fallback to old system - check for date-specific availability record
      const availability = await Appointment.findOne({ 
        therapistId, 
        date: new Date(date),
        userId: "000000000000000000000000" // Only look for availability records
      });
      
      console.log("No recurring schedule, checking date-specific availability:", availability);
      
      // Check if therapist is available on this date
      if (availability && availability.availabilityType !== 'none') {
        console.log("Availability type:", availability.availabilityType);
        
        // Define time slots for different availability types
        const allTimeSlots = [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "12:00-13:00",
          "13:00-14:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00"
        ];
        
        const morningSlots = [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00"
        ];
        
        const eveningSlots = [
          "13:00-14:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00"
        ];
        
        // Determine which time slots are available based on therapist's availability
        let availableSlots = [];
        switch (availability.availabilityType) {
          case 'full_day':
            availableSlots = [...allTimeSlots];
            break;
          case 'morning':
            availableSlots = [...morningSlots];
            break;
          case 'evening':
            availableSlots = [...eveningSlots];
            break;
          default:
            availableSlots = [];
        }
        
        if (availableSlots.includes(timeSlot)) {
          isTherapistAvailable = true;
          therapistAvailabilityType = availability.availabilityType;
        }
      }
    }
    
    if (!isTherapistAvailable) {
      console.log("Therapist is not available on this date or time slot is not available");
      return res.status(400).json({ 
        success: false, 
        message: "Therapist is not available on this date or time slot. Please select a different date or time slot." 
      });
    }
    
    // Check if there's already an appointment at this time slot (exclude dummy availability records)
    const existingAppointment = await Appointment.findOne({ 
      therapistId, 
      date: new Date(date),
      timeSlot,
      status: 'scheduled',
      userId: { $ne: "000000000000000000000000" }
    });
    
    if (existingAppointment) {
      console.log("Time slot already booked");
      return res.status(400).json({ 
        success: false, 
        message: "This time slot is already booked" 
      });
    }
    
    // Create the appointment
    const appointment = new Appointment({
      therapistId,
      userId,
      date: new Date(date),
      timeSlot,
      availabilityType: availabilityType || therapistAvailabilityType, // Use the determined availability type
      status: 'scheduled',
      age: age,
      problem: problem
    });
    
    console.log("Saving appointment:", appointment);
    await appointment.save();
    console.log("Appointment saved successfully");
    
    // Get user details for email
    const user = await User.findById(userId);
    const therapist = await User.findById(therapistId);
    
    // Send booking confirmation email
    if (user && therapist) {
      try {
        const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        await sendBookingConfirmationEmail(user.email, {
          therapistName: therapist.name,
          patientName: user.name,
          patientEmail: user.email,
          patientAge: appointment.age,
          patientPhone: user.phone || 'Not provided',
          date: formattedDate,
          time: appointment.timeSlot,
          duration: '60 minutes',
          issue: appointment.problem || 'General consultation'
        });
        console.log("Booking confirmation email sent successfully to:", user.email);
      } catch (emailError) {
        console.error("Error sending booking confirmation email:", emailError);
      }
    }
    
    res.status(201).json({ 
      success: true, 
      message: "Appointment booked successfully",
      data: appointment
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to book appointment: " + error.message 
    });
  }
}

// Book an appointment with payment
export async function bookAppointmentWithPayment(req, res) {
  try {
    const { therapistId, userId, date, timeSlot, age, problem, paymentId, amount } = req.body;
    
    console.log("Booking appointment with payment data:", { therapistId, userId, date, timeSlot, age, problem, paymentId, amount });
    
    // Validate input
    if (!therapistId || !userId || !date || !timeSlot || !paymentId || !amount) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID, user ID, date, time slot, payment ID, and amount are required" 
      });
    }
    
    // Check if therapist has leave on this date
    const leaveOnDate = await Leave.findOne({
      therapistId,
      startDate: { $lte: new Date(date) },
      endDate: { $gte: new Date(date) }
    });
    
    if (leaveOnDate) {
      console.log("Therapist has leave on this date");
      return res.status(400).json({ 
        success: false, 
        message: "Therapist is not available on this date due to scheduled leave" 
      });
    }
    
    // Check therapist availability using the same logic as getAvailableTimeSlots
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    console.log("Checking availability for:", therapistId, "on", date, "which is", dayName);
    
    // Get therapist's recurring schedule
    const schedule = await TherapistSchedule.findOne({ therapistId: new mongoose.Types.ObjectId(therapistId) });
    
    let isTherapistAvailable = false;
    let therapistAvailabilityType = 'none'; // Default to 'none'
    
    if (schedule && schedule.weeklySchedule[dayName] && schedule.weeklySchedule[dayName].isAvailable) {
      // Use recurring schedule
      const availableSlots = schedule.weeklySchedule[dayName].timeSlots || [];
      console.log("Using recurring schedule. Available slots:", availableSlots);
      if (availableSlots.includes(timeSlot)) {
        isTherapistAvailable = true;
        // Determine availability type based on time slot
        if (timeSlot.startsWith('09:') || timeSlot.startsWith('10:') || timeSlot.startsWith('11:')) {
          therapistAvailabilityType = 'morning';
        } else if (timeSlot.startsWith('13:') || timeSlot.startsWith('14:') || timeSlot.startsWith('15:') || timeSlot.startsWith('16:')) {
          therapistAvailabilityType = 'evening';
        } else {
          therapistAvailabilityType = 'full_day';
        }
      }
    } else {
      // Fallback to old system - check for date-specific availability record
      const availability = await Appointment.findOne({ 
        therapistId, 
        date: new Date(date),
        userId: "000000000000000000000000" // Only look for availability records
      });
      
      console.log("No recurring schedule, checking date-specific availability:", availability);
      
      // Check if therapist is available on this date
      if (availability && availability.availabilityType !== 'none') {
        console.log("Availability type:", availability.availabilityType);
        
        // Define time slots for different availability types
        const allTimeSlots = [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "12:00-13:00",
          "13:00-14:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00"
        ];
        
        const morningSlots = [
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00"
        ];
        
        const eveningSlots = [
          "13:00-14:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00"
        ];
        
        // Determine which time slots are available based on therapist's availability
        let availableSlots = [];
        switch (availability.availabilityType) {
          case 'full_day':
            availableSlots = [...allTimeSlots];
            break;
          case 'morning':
            availableSlots = [...morningSlots];
            break;
          case 'evening':
            availableSlots = [...eveningSlots];
            break;
          default:
            availableSlots = [];
        }
        
        if (availableSlots.includes(timeSlot)) {
          isTherapistAvailable = true;
          therapistAvailabilityType = availability.availabilityType;
        }
      }
    }
    
    if (!isTherapistAvailable) {
      console.log("Therapist is not available on this date or time slot is not available");
      return res.status(400).json({ 
        success: false, 
        message: "Therapist is not available on this date or time slot. Please select a different date or time slot." 
      });
    }
    
    // Check if there's already an appointment at this time slot (exclude dummy availability records)
    const existingAppointment = await Appointment.findOne({ 
      therapistId, 
      date: new Date(date),
      timeSlot,
      status: 'scheduled',
      userId: { $ne: "000000000000000000000000" }
    });
    
    if (existingAppointment) {
      console.log("Time slot already booked");
      return res.status(400).json({ 
        success: false, 
        message: "This time slot is already booked" 
      });
    }
    
    // Create the appointment
    const appointment = new Appointment({
      therapistId,
      userId,
      date: new Date(date),
      timeSlot,
      availabilityType: availabilityType || therapistAvailabilityType, // Use the determined availability type
      status: 'scheduled',
      age: age,
      problem: problem,
      paymentId: paymentId, // Store payment ID
      amount: amount // Store amount
    });
    
    console.log("Saving appointment:", appointment);
    await appointment.save();
    console.log("Appointment saved successfully");
    
    // Get user details for email
    const user = await User.findById(userId);
    const therapist = await User.findById(therapistId);
    
    // Send appointment invoice email
    if (user && therapist) {
      try {
        const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Generate a unique invoice ID
        const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        await sendAppointmentInvoiceEmail(user.email, {
          invoiceId: invoiceId,
          patientName: user.name,
          patientEmail: user.email,
          therapistName: therapist.name,
          therapistSpecialization: therapist.specialization || 'Mental Health Therapist',
          appointmentDate: formattedDate,
          appointmentTime: appointment.timeSlot,
          amount: amount
        });
        console.log("Appointment invoice email sent successfully to:", user.email);
      } catch (emailError) {
        console.error("Error sending appointment invoice email:", emailError);
      }
    }
    
    res.status(201).json({ 
      success: true, 
      message: "Appointment booked successfully with payment",
      data: appointment
    });
  } catch (error) {
    console.error("Error booking appointment with payment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to book appointment: " + error.message 
    });
  }
}

// Get appointments for a user
export async function getUserAppointments(req, res) {
  try {
    const { userId } = req.query;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }
    
    const appointments = await Appointment.find({ 
      userId,
      status: 'scheduled'
    }).populate('therapistId', 'name email');
    
    res.status(200).json({ 
      success: true, 
      data: appointments
    });
  } catch (error) {
    console.error("Error getting user appointments:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get user appointments" 
    });
  }
}

// Get appointments for a therapist
export async function getTherapistAppointments(req, res) {
  try {
    const { therapistId } = req.query;
    
    // Validate input
    if (!therapistId) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID is required" 
      });
    }
    
    // Exclude dummy availability records (userId: "000000000000000000000000")
    // Only include appointments that have been paid for (have paymentId)
    const appointments = await Appointment.find({ 
      therapistId,
      status: 'scheduled',
      userId: { $ne: "000000000000000000000000" },
      paymentId: { $exists: true, $ne: null } // Only include appointments with paymentId
    }).populate('userId', 'name email').sort({ date: 1, timeSlot: 1 });
    
    res.status(200).json({ 
      success: true, 
      data: appointments
    });
  } catch (error) {
    console.error("Error getting therapist appointments:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get therapist appointments" 
    });
  }
}

// Cancel an appointment
export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }
    
    appointment.status = 'cancelled';
    appointment.updatedAt = Date.now();
    
    await appointment.save();
    
    res.status(200).json({ 
      success: true, 
      message: "Appointment cancelled successfully",
      data: appointment
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to cancel appointment" 
    });
  }
}