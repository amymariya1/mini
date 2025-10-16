import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Create a new order
router.post("/orders", async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.orderId || !orderData.userId || !orderData.userEmail || !orderData.items || !orderData.shippingAddress) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required order information" 
      });
    }
    
    // Create status history with initial status
    const statusHistory = [{
      status: orderData.status || "pending",
      timestamp: new Date(),
      note: "Order created"
    }];
    
    // Create the order
    const order = new Order({
      ...orderData,
      statusHistory
    });
    
    const savedOrder = await order.save();
    
    // Send notification to user
    sendOrderNotification(order.userEmail, order.orderId, order.status, "Your order has been confirmed");
    
    res.status(201).json({ 
      success: true, 
      order: savedOrder,
      message: "Order created successfully"
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create order",
      error: error.message
    });
  }
});

// Send notification to user (simplified version)
const sendOrderNotification = (userEmail, orderId, status, message) => {
  // In a real implementation, you would send an actual notification
  // For now, we'll just log it
  console.log(`Notification sent to ${userEmail}: Order ${orderId} status updated to ${status} - ${message}`);
};

export default router;