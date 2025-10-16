import express from "express";
import { sendOrderConfirmation } from "../controllers/email.controller.js";

const router = express.Router();

// Send order confirmation email
router.post("/send-order-confirmation", sendOrderConfirmation);

export default router;