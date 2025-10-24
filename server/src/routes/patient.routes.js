import express from "express";
import { 
  createPatient,
  getPatients,
  getPatient,
  addConsultationNote,
  updatePatient
} from "../controllers/patient.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Create a new patient
router.post("/", createPatient);

// Get all patients for the authenticated therapist
router.get("/", getPatients);

// Get a specific patient
router.get("/:id", getPatient);

// Add a consultation note to a patient
router.post("/:id/notes", addConsultationNote);

// Update patient information
router.put("/:id", updatePatient);

export default router;