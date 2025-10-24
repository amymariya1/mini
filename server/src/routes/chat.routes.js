import express from "express";
import { sendMessage, getChatHistory, markAsRead, getConversations } from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Send a message
router.post("/send", sendMessage);

// Get chat history between two users
router.get("/history/:userId/:therapistId", getChatHistory);

// Mark a message as read
router.put("/read/:messageId", markAsRead);

// Get all conversations for current user
router.get("/conversations", getConversations);

export default router;