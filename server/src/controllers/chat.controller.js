import User from "../models/User.js";

// In a real implementation, you would store messages in a database
// For now, we'll use an in-memory array to simulate message storage
let chatMessages = [];

// Send a message
export async function sendMessage(req, res) {
  try {
    const { recipientId, message } = req.body;
    const sender = req.user; // From auth middleware

    // Validate input
    if (!recipientId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "recipientId and message are required" 
      });
    }

    // Create message object
    const newMessage = {
      id: chatMessages.length + 1,
      senderId: sender._id.toString(),
      recipientId,
      message,
      timestamp: new Date(),
      read: false
    };

    // Add to messages array
    chatMessages.push(newMessage);

    // In a real implementation, you would:
    // 1. Save the message to a database
    // 2. Notify the recipient (via WebSocket, push notification, etc.)

    res.status(201).json({ 
      success: true, 
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send message" 
    });
  }
}

// Get chat history between two users
export async function getChatHistory(req, res) {
  try {
    const { userId, therapistId } = req.params;
    const currentUser = req.user; // From auth middleware

    // Validate input
    if (!userId || !therapistId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId and therapistId are required" 
      });
    }

    // Security check: ensure current user is either the user or the therapist
    if (currentUser._id.toString() !== userId && currentUser._id.toString() !== therapistId) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied: You can only view your own chat history" 
      });
    }

    // Filter messages between these two users
    const messages = chatMessages.filter(msg => 
      (msg.senderId === userId && msg.recipientId === therapistId) ||
      (msg.senderId === therapistId && msg.recipientId === userId)
    );

    // Sort by timestamp
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.status(200).json({ 
      success: true, 
      data: messages
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch chat history" 
    });
  }
}

// Mark messages as read
export async function markAsRead(req, res) {
  try {
    const { messageId } = req.params;
    const currentUser = req.user; // From auth middleware
    
    // Find the message
    const message = chatMessages.find(msg => msg.id === parseInt(messageId));
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: "Message not found" 
      });
    }
    
    // Security check: ensure current user is the recipient
    if (message.recipientId !== currentUser._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied: You can only mark your own messages as read" 
      });
    }
    
    // Mark as read
    message.read = true;
    
    res.status(200).json({ 
      success: true, 
      message: "Message marked as read"
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark message as read" 
    });
  }
}