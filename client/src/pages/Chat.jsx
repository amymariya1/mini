import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

// Sample messages for the shared chat room
const SAMPLE_MESSAGES = [
  {
    id: 1,
    text: "Welcome to our wellness community chat! 🌟",
    sender: "WellnessBot",
    timestamp: "2:00 PM",
    isSystem: true
  },
  {
    id: 2,
    text: "Feel free to share your experiences, ask questions, or support others on their wellness journey",
    sender: "WellnessBot",
    timestamp: "2:01 PM",
    isSystem: true
  },
  {
    id: 3,
    text: "Hi everyone! I'm new here and looking for some meditation tips",
    sender: "Alex",
    timestamp: "2:15 PM",
    isSystem: false
  },
  {
    id: 4,
    text: "Welcome Alex! I'd recommend starting with 5-minute breathing exercises",
    sender: "Sarah",
    timestamp: "2:17 PM",
    isSystem: false
  },
  {
    id: 5,
    text: "The 4-7-8 breathing technique works great for me before bed 😴",
    sender: "Mike",
    timestamp: "2:20 PM",
    isSystem: false
  },
  {
    id: 6,
    text: "Thanks for the suggestions! I'll try them tonight",
    sender: "Alex",
    timestamp: "2:22 PM",
    isSystem: false
  }
];

const QUICK_REPLIES = [
  "Hello everyone! 👋",
  "I'm feeling good today",
  "I need some support",
  "Thanks for sharing!",
  "I'm having a difficult time",
  "Any meditation tips?",
  "Great advice! 👍",
  "How is everyone doing?"
];

// Online users simulation
const ONLINE_USERS = [
  { name: "Alex", avatar: "👨", status: "online" },
  { name: "Sarah", avatar: "👩", status: "online" },
  { name: "Mike", avatar: "👨‍💼", status: "away" },
  { name: "Emma", avatar: "👩‍🎓", status: "online" },
  { name: "David", avatar: "👨‍🔬", status: "online" }
];

export default function Chat() {
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(ONLINE_USERS);
  const messagesEndRef = useRef(null);
  const [user] = useState(JSON.parse(localStorage.getItem("mm_user")) || { name: "User" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: user.name || "User",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (reply) => {
    setNewMessage(reply);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'away': return '#f59e0b';
      case 'offline': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const getOnlineCount = () => {
    return onlineUsers.filter(user => user.status === 'online').length;
  };

  return (
    <div className="chat-page">
      <Navbar />
      
      <div className="chat-container">
        {/* Sidebar - Online Users */}
        <div className="chat-sidebar">
          {/* Header */}
          <div className="chat-header">
            <div className="user-info">
              <div className="user-avatar">
                <span className="avatar-emoji">👤</span>
              </div>
              <div className="user-details">
                <h3>{user.name || 'User'}</h3>
                <p className="user-status">Online</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="action-btn">⚙️</button>
            </div>
          </div>

          {/* Online Users */}
          <div className="online-users-section">
            <h4 className="section-title">
              Online Users ({getOnlineCount()})
            </h4>
            <div className="online-users-list">
              {onlineUsers.map((onlineUser, index) => (
                <motion.div
                  key={index}
                  className="online-user-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="user-avatar">
                    <span className="avatar-emoji">{onlineUser.avatar}</span>
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(onlineUser.status) }}
                    />
                  </div>
                  <div className="user-details">
                    <span className="user-name">{onlineUser.name}</span>
                    <span className="user-status-text">
                      {onlineUser.status === 'online' ? 'Online' : 
                       onlineUser.status === 'away' ? 'Away' : 'Offline'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Rules */}
          <div className="chat-rules">
            <h4 className="section-title">Community Guidelines</h4>
            <ul className="rules-list">
              <li>Be respectful and kind</li>
              <li>Share your wellness journey</li>
              <li>Support others positively</li>
              <li>Keep conversations helpful</li>
            </ul>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {/* Chat Header */}
          <div className="chat-main-header">
            <div className="chat-info">
              <div className="chat-avatar">
                <span className="avatar-emoji">👥</span>
              </div>
              <div className="chat-details">
                <h3>Wellness Community Chat</h3>
                <p className="chat-status">
                  {getOnlineCount()} members online
                </p>
              </div>
            </div>
            <div className="chat-actions">
              <button className="action-btn">📎</button>
              <button className="action-btn">⋮</button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            <div className="messages-list">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.sender === (user.name || 'User') ? 'me' : 'other'} ${message.isSystem ? 'system' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {!message.isSystem && message.sender !== (user.name || 'User') && (
                    <div className="message-sender">{message.sender}</div>
                  )}
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="quick-replies">
              <p>Quick replies:</p>
              <div className="quick-reply-buttons">
                {QUICK_REPLIES.map((reply, index) => (
                  <button
                    key={index}
                    className="quick-reply-btn"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="message-input-container">
            <div className="message-input">
              <button 
                className="emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😊
              </button>
              <input
                type="text"
                placeholder="Type a message to the community..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="message-text-input"
              />
              <button className="attach-btn">📎</button>
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            className="emoji-picker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="emoji-grid">
              {['😊', '😢', '😴', '😌', '🤗', '💪', '🌟', '❤️', '🙏', '🎉', '😅', '😔'].map((emoji, index) => (
                <button
                  key={index}
                  className="emoji-btn"
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
