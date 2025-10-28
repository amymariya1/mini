import express from "express";
import { 
  createCancellation,
  getTherapistCancellations,
  getUserCancellations,
  cancelAppointmentsByCriteria
} from "../controllers/cancellation.controller.js";
import { authenticateJWT, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
// Using protect middleware which can handle both JWT tokens and header-based authentication
router.use(protect);

// Create a new cancellation
router.post("/", createCancellation);

// Get cancellations for a therapist
router.get("/therapist", getTherapistCancellations);

// Get cancellations for a user
router.get("/user", getUserCancellations);

// Cancel multiple appointments by date and availability type
router.post("/bulk", cancelAppointmentsByCriteria);

export default router;