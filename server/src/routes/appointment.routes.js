import express from "express";
import { 
  setAvailability, 
  getAvailability, 
  getAvailabilityRange,
  getAvailableTimeSlots, // Add this import
  bookAppointment,
  getUserAppointments,
  getTherapistAppointments,
  cancelAppointment
} from "../controllers/appointment.controller.js";

const router = express.Router();

// Set therapist availability for a specific date
router.post("/availability", setAvailability);

// Get therapist availability for a specific date
router.get("/availability", getAvailability);

// Get therapist availability for a date range
router.get("/availability-range", getAvailabilityRange);

// Get available time slots for a therapist on a specific date
router.get("/available-time-slots", getAvailableTimeSlots); // Add this route

// Book an appointment
router.post("/book", bookAppointment);

// Get appointments for a user
router.get("/user-appointments", getUserAppointments);

// Get appointments for a therapist
router.get("/therapist-appointments", getTherapistAppointments);

// Cancel an appointment
router.put("/cancel/:id", cancelAppointment);

export default router;