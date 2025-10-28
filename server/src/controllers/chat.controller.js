import User from "../models/User.js";
import ChatMessage from "../models/ChatMessage.js";

// Send a message
export async function sendMessage(req, res) {
  try {
    console.log("Chat controller: sendMessage called");
    console.log("Request body:", req.body);
    console.log("Request user:", req.user);
    
    const { recipientId, message } = req.body;
    const sender = req.user; // From auth middleware

    // Validate input
    if (!recipientId || !message) {
      console.log("Chat controller: Missing recipientId or message");
      return res.status(400).json({ 
        success: false, 
        message: "recipientId and message are required" 
      });
    }

    console.log("Chat controller: Validating recipient");
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.log("Chat controller: Recipient not found");
      return res.status(404).json({
        success: false,
        message: "Recipient not found"
      });
    }

    console.log("Chat controller: Creating message");
    // Generate roomId from sender and recipient IDs
    const ids = [sender._id.toString(), recipientId].sort();
    const roomId = `${ids[0]}_${ids[1]}`;
    console.log("Chat controller: Generated roomId:", roomId);
    
    // Create and save message to database
    const newMessage = new ChatMessage({
      sender: sender._id,
      recipient: recipientId,
      message: message.trim(),
      roomId: roomId  // Explicitly set roomId
    });

    console.log("Chat controller: Saving message");
    await newMessage.save();

    console.log("Chat controller: Populating sender");
    // Populate sender information for response
    await newMessage.populate('sender', 'name email');

    console.log("Chat controller: Sending success response");
    res.status(201).json({ 
      success: true, 
      message: "Message sent successfully",
      data: {
        id: newMessage._id,
        senderId: newMessage.sender._id.toString(),
        recipientId: newMessage.recipient.toString(),
        message: newMessage.message,
        timestamp: newMessage.createdAt,
        read: newMessage.read,
        senderName: newMessage.sender.name
      }
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

    // Create room ID for consistent querying
    const ids = [userId, therapistId].sort();
    const roomId = `${ids[0]}_${ids[1]}`;

    // Get messages from database
    const messages = await ChatMessage.find({ roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 }); // Sort by creation time ascending

    // Format messages for response
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.sender._id.toString(),
      recipientId: msg.recipient.toString(),
      message: msg.message,
      timestamp: msg.createdAt,
      read: msg.read,
      senderName: msg.sender.name
    }));

    res.status(200).json({ 
      success: true, 
      data: formattedMessages
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

    // Validate input
    if (!messageId) {
      return res.status(400).json({ 
        success: false, 
        message: "messageId is required" 
      });
    }

    // Find the message in the database
    const message = await ChatMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: "Message not found" 
      });
    }

    // Security check: only the recipient can mark as read
    if (message.recipient.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied: Only the recipient can mark messages as read" 
      });
    }

    // Mark as read
    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.status(200).json({ 
      success: true, 
      message: "Message marked as read",
      data: {
        id: message._id,
        read: message.read,
        readAt: message.readAt
      }
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark message as read" 
    });
  }
}

// Get all conversations for a user (therapist or patient)
export async function getConversations(req, res) {
  try {
    const currentUser = req.user;
    const userType = req.query.type; // 'therapist' or 'patient'

    // Get all conversations where current user is either sender or recipient
    const conversations = await ChatMessage.find({
      $or: [
        { sender: currentUser._id },
        { recipient: currentUser._id }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: -1 });

    // Group messages by conversation partner
    const conversationMap = new Map();

    conversations.forEach(msg => {
      const partner = msg.sender._id.toString() === currentUser._id.toString() 
        ? msg.recipient 
        : msg.sender;
      
      const partnerId = partner._id.toString();
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          partnerEmail: partner.email,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          isTherapist: partner.role === 'therapist'
        });
      }

      // Count unread messages (only count messages sent TO current user)
      if (msg.recipient.toString() === currentUser._id.toString() && !msg.read) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    // Convert to array and sort by last message time
    const conversationList = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.status(200).json({
      success: true,
      data: conversationList
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations"
    });
  }
}