import express from "express";
import { 
  getTherapistSchedule,
  updateTherapistSchedule,
  getAvailableTimeSlotsFromSchedule
} from "../controllers/therapistSchedule.controller.js";

const router = express.Router();

// Get therapist's recurring schedule
router.get("/schedule", getTherapistSchedule);

// Update therapist's recurring schedule
router.post("/schedule", updateTherapistSchedule);

// Get available time slots for a specific date based on recurring schedule
router.get("/schedule/available-slots", getAvailableTimeSlotsFromSchedule);

export default router;
