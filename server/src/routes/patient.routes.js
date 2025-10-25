import express from "express";
import { 
  createPatient,
  getPatients,
  getPatient,
  addConsultationNote,
  updatePatient,
  referPatient
} from "../controllers/patient.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new patient
router.post("/", protect, createPatient);

// Refer a patient (this should be public, so no authentication required)
router.post("/refer", referPatient);

// Apply authentication middleware to remaining routes
router.use(protect);

// Get all patients for the authenticated therapist
router.get("/", getPatients);

// Get a specific patient
router.get("/:id", getPatient);

// Add a consultation note to a patient
router.post("/:id/notes", addConsultationNote);

// Update patient information
router.put("/:id", updatePatient);

export default router;