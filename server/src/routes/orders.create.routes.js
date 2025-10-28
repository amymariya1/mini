import express from "express";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get all orders (for testing only)
router.get("/orders-all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});

// Create a new order
router.post("/orders", async (req, res) => {
  try {
    const orderData = req.body;
    
    console.log('Creating order with data:', orderData);
    
    // Validate required fields
    if (!orderData.orderId || !orderData.userId || !orderData.userEmail || !orderData.items || !orderData.shippingAddress) {
      console.log('Missing required fields:', {
        orderId: !!orderData.orderId,
        userId: !!orderData.userId,
        userEmail: !!orderData.userEmail,
        items: !!orderData.items,
        shippingAddress: !!orderData.shippingAddress
      });
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
    
    console.log('Saving order to database');
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder);
    
    // Create notification for user
    await createOrderNotification(order.userId, order.userEmail, order.orderId, order.status, "Your order has been confirmed");
    
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

// Create notification for user
const createOrderNotification = async (userId, userEmail, orderId, status, message) => {
  try {
    // Create a notification message based on status
    let notificationMessage = '';
    let type = 'order_status';
    
    switch (status) {
      case 'confirmed':
        notificationMessage = `Your order ${orderId} has been confirmed and is being processed.`;
        type = 'order_confirmation';
        break;
      case 'processing':
        notificationMessage = `Your order ${orderId} is now being processed.`;
        type = 'order_status';
        break;
      case 'shipped':
        notificationMessage = `Your order ${orderId} has been shipped.`;
        type = 'order_shipped';
        break;
      case 'delivered':
        notificationMessage = `Your order ${orderId} has been delivered.`;
        type = 'order_delivered';
        break;
      case 'cancelled':
        notificationMessage = `Your order ${orderId} has been cancelled.`;
        type = 'order_cancelled';
        break;
      default:
        notificationMessage = message || `Your order ${orderId} status has been updated to ${status}.`;
        type = 'order_status';
    }
    
    // Create notification
    const notification = new Notification({
      userId,
      userEmail,
      orderId,
      message: notificationMessage,
      type,
      status
    });
    
    await notification.save();
    
    console.log('Order notification created:', notificationMessage);
  } catch (error) {
    console.error('Error creating order notification:', error);
  }
};

export default router;