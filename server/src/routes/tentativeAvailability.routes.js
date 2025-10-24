import express from "express";
import { 
  setTentativeAvailability, 
  getTentativeAvailability, 
  getTentativeAvailabilityRange,
  removeTentativeAvailability
} from "../controllers/tentativeAvailability.controller.js";

const router = express.Router();

// Set tentative availability for a specific date
router.post("/tentative", setTentativeAvailability);

// Get tentative availability for a specific date
router.get("/tentative", getTentativeAvailability);

// Get tentative availability for a date range
router.get("/tentative-range", getTentativeAvailabilityRange);

// Remove tentative availability
router.delete("/tentative", removeTentativeAvailability);

export default router;