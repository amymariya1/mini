import Order from "../models/Order.js";
import Notification from "../models/Notification.js";

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// Get order by ID (admin only)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

// Get order by ID for regular users (with authentication)
export const getUserOrderById = async (req, res) => {
  try {
    // Get userId from request user (set by authentication middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    const order = await Order.findOne({ _id: req.params.id, userId: userId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or access denied" });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    // Add to status history
    order.statusHistory.push({
      status,
      note,
      timestamp: new Date()
    });
    
    // Update current status
    order.status = status;
    
    await order.save();
    
    // Create notification for user
    await createOrderNotification(order.userId, order.userEmail, order.orderId, status, note);
    
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    // Get userId from request user (set by authentication middleware)
    const authenticatedUserId = req.user?.id;
    
    // Verify that the authenticated user is requesting their own orders
    if (authenticatedUserId !== userId) {
      return res.status(403).json({ success: false, message: "Access denied. You can only view your own orders." });
    }
    
    console.log('Fetching orders for userId:', userId);
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    console.log('Found orders:', orders);
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const notifications = await Notification.find({ userEmail }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId, 
      { read: true }, 
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userEmail } = req.body;
    await Notification.updateMany({ userEmail, read: false }, { read: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark all notifications as read" });
  }
};

// Create notification for user
const createOrderNotification = async (userId, userEmail, orderId, status, note) => {
  try {
    // Create a notification message based on status
    let message = '';
    let type = 'order_status';
    
    switch (status) {
      case 'confirmed':
        message = `Your order ${orderId} has been confirmed and is being processed.`;
        type = 'order_confirmation';
        break;
      case 'processing':
        message = `Your order ${orderId} is now being processed.`;
        type = 'order_status';
        break;
      case 'shipped':
        message = `Your order ${orderId} has been shipped.`;
        type = 'order_shipped';
        break;
      case 'delivered':
        message = `Your order ${orderId} has been delivered.`;
        type = 'order_delivered';
        break;
      case 'cancelled':
        message = `Your order ${orderId} has been cancelled.`;
        type = 'order_cancelled';
        break;
      default:
        message = `Your order ${orderId} status has been updated to ${status}.`;
        type = 'order_status';
    }
    
    if (note) {
      message += ` Note: ${note}`;
    }
    
    // Create notification
    const notification = new Notification({
      userId,
      userEmail,
      orderId,
      message,
      type,
      status
    });
    
    await notification.save();
    
    console.log('Order notification created:', message);
  } catch (error) {
    console.error('Error creating order notification:', error);
  }
};