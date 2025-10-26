import express from "express";
import { 
  createCancellation,
  getTherapistCancellations,
  getUserCancellations,
  cancelAppointmentsByCriteria
} from "../controllers/cancellation.controller.js";

const router = express.Router();

// Create a new cancellation
router.post("/", createCancellation);

// Get cancellations for a therapist
router.get("/therapist", getTherapistCancellations);

// Get cancellations for a user
router.get("/user", getUserCancellations);

// Cancel multiple appointments by date and availability type
router.post("/bulk", cancelAppointmentsByCriteria);

export default router;