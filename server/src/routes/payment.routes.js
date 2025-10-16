import express from "express";
import { createOrder } from "../controllers/payment.controller.js";

const router = express.Router();

// Create a new Razorpay order
router.post("/payment/order", createOrder);

export default router;