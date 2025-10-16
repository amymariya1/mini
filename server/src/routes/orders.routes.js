import express from "express";
import { 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  getUserOrders, 
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/orders.controller.js";

const router = express.Router();

// Get all orders (admin only)
router.get("/orders", getAllOrders);

// Get order by ID (admin only)
router.get("/orders/:id", getOrderById);

// Update order status (admin only)
router.patch("/orders/:id/status", updateOrderStatus);

// Get user orders
router.get("/user-orders/:userId", getUserOrders);

// Get user notifications
router.get("/user-notifications/:userEmail", getUserNotifications);

// Mark notification as read
router.patch("/notifications/:notificationId/read", markNotificationAsRead);

// Mark all notifications as read
router.post("/notifications/read-all", markAllNotificationsAsRead);

export default router;