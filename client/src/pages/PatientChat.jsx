import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { sendMessage, getChatHistory, markMessageAsRead } from "../services/api";

export default function PatientChat() {
  const navigate = useNavigate();
  const { therapistId } = useParams();
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
      } else {
        navigate("/login");
      }
    } catch (_) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user && therapistId) {
      loadChatHistory();
      
      // Start polling for new messages
      const interval = setInterval(() => {
        loadChatHistory();
      }, 3000); // Poll every 3 seconds
      
      setPollingInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [user, therapistId]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const loadChatHistory = async () => {
    if (!user || !therapistId) return;
    
    try {
      setChatLoading(true);
      const response = await getChatHistory(user.id, therapistId);
      if (response.success) {
        setMessages(response.data);
        // Mark messages as read when loading chat
        markUnreadMessagesAsRead(response.data);
        
        // Extract therapist info from messages if not already set
        if (!therapist && response.data.length > 0) {
          const therapistMessage = response.data.find(msg => msg.senderId === therapistId);
          if (therapistMessage) {
            setTherapist({
              id: therapistId,
              name: therapistMessage.senderName || 'Therapist'
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const markUnreadMessagesAsRead = async (messages) => {
    if (!user) return;
    
    const unreadMessages = messages.filter(msg => 
      msg.recipientId === user.id && !msg.read
    );
    
    for (const message of unreadMessages) {
      try {
        await markMessageAsRead(message.id);
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !therapistId || !user || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await sendMessage({
        recipientId: therapistId,
        message: newMessage.trim()
      });

      if (response.success) {
        // Add the new message to the messages list
        setMessages(prev => [...prev, response.data]);
        setNewMessage("");
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="landing-container">
      <Navbar />
      
      {/* Main Content */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
        <motion.div 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.25 }} 
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0 }}>Chat with Therapist</h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>
                {therapist ? `Dr. ${therapist.name}` : 'Loading...'}
              </p>
            </div>
            <button 
              onClick={() => navigate("/book-therapist")}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Back to Therapists
            </button>
          </div>

          {/* Chat Container */}
          <div className="card" style={{ 
            padding: 0, 
            borderRadius: 12, 
            border: "1px solid #e5e7eb", 
            height: '600px', 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            {/* Chat Header */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                {therapist ? `Dr. ${therapist.name}` : 'Therapist'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Professional Therapist
              </p>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {chatLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                  <p>Start a conversation with your therapist</p>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '8px' }}>
                    Ask questions, share concerns, or discuss your mental health journey
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} style={{ 
                    display: 'flex', 
                    justifyContent: message.senderId === user.id ? 'flex-end' : 'flex-start' 
                  }}>
                    <div style={{
                      background: message.senderId === user.id ? '#3b82f6' : '#f1f5f9',
                      color: message.senderId === user.id ? 'white' : '#1e293b',
                      padding: '12px 16px',
                      borderRadius: message.senderId === user.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      maxWidth: '70%',
                      wordWrap: 'break-word'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {message.message}
                      </p>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        opacity: 0.8, 
                        marginTop: '4px', 
                        display: 'block',
                        color: message.senderId === user.id ? 'rgba(255,255,255,0.8)' : '#64748b'
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form 
              onSubmit={handleSendMessage}
              style={{ 
                display: 'flex', 
                gap: '12px', 
                padding: '16px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f8fafc'
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sendingMessage}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: sendingMessage ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  fontWeight: 600,
                  cursor: sendingMessage ? 'not-allowed' : 'pointer',
                  opacity: sendingMessage ? 0.7 : 1
                }}
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

