import express from "express";
import { 
  createUpcomingPatient,
  getUpcomingPatients,
  getUpcomingPatient,
  updateUpcomingPatient,
  deleteUpcomingPatient
} from "../controllers/upcomingPatient.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Create a new upcoming patient
router.post("/", createUpcomingPatient);

// Get all upcoming patients for the authenticated therapist
router.get("/", getUpcomingPatients);

// Get a specific upcoming patient
router.get("/:id", getUpcomingPatient);

// Update an upcoming patient
router.put("/:id", updateUpcomingPatient);

// Delete an upcoming patient
router.delete("/:id", deleteUpcomingPatient);

export default router;