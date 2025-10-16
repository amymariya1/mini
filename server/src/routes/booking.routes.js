import express from "express";
import { sendBookingConfirmation } from "../controllers/booking.controller.js";

const router = express.Router();

// Send booking confirmation email
router.post("/send-booking-confirmation", sendBookingConfirmation);

export default router;