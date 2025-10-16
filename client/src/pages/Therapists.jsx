import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { listTherapists, sendMessage, getChatHistory } from "../services/api";

export default function Therapists() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("therapists"); // Default to therapists listing
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [nearbyTherapists, setNearbyTherapists] = useState([]);
  const [findingLocation, setFindingLocation] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    issue: ""
  });
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Try to get user from localStorage
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
        // Pre-fill patient data from user info if available
        setPatientData(prev => ({
          ...prev,
          name: userData.name || "",
          age: userData.age || "",
          phone: userData.phone || "",
          email: userData.email || ""
        }));
        
        // If user is a therapist, redirect to therapist dashboard
        if (userData.userType === "therapist") {
          navigate("/therapist-dashboard");
        }
      }
    } catch (_) {
      // Ignore errors
    }
    
    async function loadTherapists() {
      try {
        setLoading(true);
        const data = await listTherapists();
        setTherapists(data.therapists || []);
      } catch (err) {
        setError(err.message || "Failed to load therapists");
      } finally {
        setLoading(false);
      }
    }
    
    loadTherapists();
  }, [navigate]);

  // Get user's current location
  const getLocation = () => {
    setFindingLocation(true);
    setLocationError("");
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setFindingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        findNearbyTherapists(latitude, longitude);
      },
      (error) => {
        setLocationError("Unable to retrieve your location. Please enable location services and try again.");
        setFindingLocation(false);
      }
    );
  };

  // Find nearby therapists based on location
  const findNearbyTherapists = async (lat, lon) => {
    try {
      // In a real implementation, this would call an API to find nearby therapists
      // For now, we'll use the existing therapists list and simulate distance calculation
      const therapistsWithDistance = therapists.map(therapist => {
        // Simulate distance calculation (in a real app, this would use actual coordinates)
        const distance = Math.random() * 20; // Random distance between 0-20 km
        return { ...therapist, distance: distance.toFixed(1) };
      });
      
      // Sort by distance
      therapistsWithDistance.sort((a, b) => a.distance - b.distance);
      
      // Take the first 5 nearest therapists
      setNearbyTherapists(therapistsWithDistance.slice(0, 5));
      setFindingLocation(false);
    } catch (err) {
      setLocationError("Failed to find nearby therapists. Please try again.");
      setFindingLocation(false);
    }
  };

  // Generate sample time slots for a therapist
  const generateTimeSlots = () => {
    const slots = [];
    const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday'];
    
    for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
      const day = days[dayIndex];
      const times = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM'];
      
      times.forEach(time => {
        slots.push({
          id: `${dayIndex}-${time}`,
          day,
          time,
          duration: '60 min',
          available: Math.random() > 0.3 // 70% chance of being available
        });
      });
    }
    
    return slots;
  };

  // Handle booking session
  const handleBookSession = (therapist) => {
    setSelectedTherapist(therapist);
    setShowTimeSlots(true);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setShowTimeSlots(false);
      setShowPatientForm(true);
    }
  };

  // Handle patient form input changes
  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle patient form submission
  const handlePatientFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real implementation, this would submit the data to the backend
      console.log("Patient data submitted:", { 
        patientData, 
        therapist: selectedTherapist, 
        slot: selectedSlot 
      });
      
      // Send booking confirmation email
      const bookingDetails = {
        therapistName: selectedTherapist.name,
        date: selectedSlot.day,
        time: selectedSlot.time,
        duration: selectedSlot.duration,
        patientName: patientData.name,
        patientAge: patientData.age,
        patientPhone: patientData.phone,
        patientEmail: patientData.email,
        issue: patientData.issue
      };
      
      const response = await fetch('/api/booking/send-booking-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: patientData.email,
          bookingDetails
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show confirmation
        alert(`Booking confirmed!

Therapist: ${selectedTherapist.name}
Date: ${selectedSlot.day}
Time: ${selectedSlot.time}

A confirmation email has been sent to ${patientData.email}.`);
      } else {
        // Show confirmation even if email fails
        console.error("Failed to send email:", result.message);
        alert(`Booking confirmed!

Therapist: ${selectedTherapist.name}
Date: ${selectedSlot.day}
Time: ${selectedSlot.time}

Thank you for providing your details.`);
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      // Show confirmation even if email fails
      alert(`Booking confirmed!

Therapist: ${selectedTherapist.name}
Date: ${selectedSlot.day}
Time: ${selectedSlot.time}

Thank you for providing your details.`);
    }
    
    // Reset and close form
    setShowPatientForm(false);
    setSelectedTherapist(null);
    setSelectedSlot(null);
    setPatientData({
      name: "",
      age: "",
      phone: "",
      email: "",
      issue: ""
    });
  };

  // Load chat history when chat tab is opened
  useEffect(() => {
    if (activeTab === "chat" && user) {
      loadChatHistory();
    }
  }, [activeTab, user]);

  const loadChatHistory = async () => {
    setChatLoading(true);
    setChatError("");
    
    try {
      // In a real implementation, you would get the therapist ID from the selected therapist
      // For now, we'll use a dummy therapist ID
      const therapistId = "dummy-therapist-id";
      const data = await getChatHistory(user.id, therapistId);
      
      if (data.success) {
        // Convert API response to component format
        const formattedMessages = data.data.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.senderId === user.id ? "user" : "therapist",
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(formattedMessages);
      } else {
        setChatError(data.message || "Failed to load chat history");
      }
    } catch (error) {
      setChatError("Failed to load chat history: " + error.message);
      // Load sample messages as fallback
      setMessages([
        {
          id: 1,
          text: "Hello! How can I help you today?",
          sender: "therapist",
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 2,
          text: "Hi Dr. Johnson, I wanted to discuss my anxiety issues.",
          sender: "user",
          timestamp: new Date(Date.now() - 1800000)
        },
        {
          id: 3,
          text: "I'm here to help. Can you tell me more about what's been bothering you?",
          sender: "therapist",
          timestamp: new Date(Date.now() - 1200000)
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !user) return;
    
    // Define tempMessage outside try block so it's accessible in catch block
    let tempMessage = null;
    
    try {
      // Add message to UI immediately
      tempMessage = {
        id: Date.now(), // Temporary ID
        text: newMessage,
        sender: "user",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      
      // In a real implementation, you would get the therapist ID from the selected therapist
      // For now, we'll use a dummy therapist ID
      const therapistId = "dummy-therapist-id";
      
      // Send message to backend
      const payload = {
        recipientId: therapistId,
        message: newMessage
      };
      
      const response = await sendMessage(payload);
      
      if (response.success) {
        // Update message with real ID
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, id: response.data.id } 
              : msg
          )
        );
        
        // Simulate therapist response after a delay
        setTimeout(() => {
          const responses = [
            "I understand. Can you tell me more about that?",
            "That sounds challenging. How long have you been feeling this way?",
            "Thank you for sharing. Let's explore this further.",
            "I appreciate your openness. What do you think might be contributing to this?",
            "That's an important insight. How does this affect your daily life?"
          ];
          
          const therapistMessage = {
            id: Date.now() + 1,
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: "therapist",
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, therapistMessage]);
        }, 1000);
      } else {
        // Remove the temporary message if sending failed
        if (tempMessage) {
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        }
        setChatError(response.message || "Failed to send message");
      }
    } catch (error) {
      // Remove the temporary message if sending failed
      if (tempMessage) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }
      setChatError("Failed to send message: " + error.message);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sample data for past appointments
  const pastAppointments = [
    {
      id: 1,
      therapist: "Dr. Sarah Johnson",
      date: "2023-05-15",
      time: "10:00 AM",
      duration: "60 min",
      status: "Completed"
    },
    {
      id: 2,
      therapist: "Dr. Michael Chen",
      date: "2023-05-08",
      time: "2:30 PM",
      duration: "45 min",
      status: "Completed"
    }
  ];

  // Sample data for post appointments
  const postAppointments = [
    {
      id: 1,
      title: "Mood Tracking",
      description: "Track your mood daily for the next week",
      dueDate: "2023-05-22"
    },
    {
      id: 2,
      title: "Journal Entry",
      description: "Write about your experience from today's session",
      dueDate: "2023-05-16"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.25 }} 
      style={{ 
        backgroundColor: '#ffffff', 
        minHeight: '100vh',
        display: 'flex',
        padding: 0,
        margin: 0
      }}
    >
      {/* Sidebar Menu */}
      <div style={{
        width: 200,
        minWidth: 200,
        background: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        padding: '12px 0',
      }}>
        <div style={{
          padding: '0 12px 12px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: 12
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#1e293b'
          }}>
            Dashboard
          </h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={() => setActiveTab("therapists")}
            style={{
              background: activeTab === "therapists" ? '#3b82f6' : 'transparent',
              color: activeTab === "therapists" ? 'white' : '#334155',
              border: 'none',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: activeTab === "therapists" ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => {
              if (activeTab !== "therapists") {
                e.target.style.background = '#f1f5f9';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "therapists") {
                e.target.style.background = 'transparent';
              }
            }}
            onMouseDown={(e) => {
              e.target.style.color = '#1e293b'; // Black text on click
            }}
            onMouseUp={(e) => {
              e.target.style.color = activeTab === "therapists" ? 'white' : '#334155';
            }}
          >
            <span style={{ 
              display: 'inline-block',
              minWidth: '20px'
            }}>📋</span>
            <span>Book Therapist</span>
          </button>
          
          <button
            onClick={() => setActiveTab("nearme")}
            style={{
              background: activeTab === "nearme" ? '#3b82f6' : 'transparent',
              color: activeTab === "nearme" ? 'white' : '#334155',
              border: 'none',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: activeTab === "nearme" ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => {
              if (activeTab !== "nearme") {
                e.target.style.background = '#f1f5f9';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "nearme") {
                e.target.style.background = 'transparent';
              }
            }}
            onMouseDown={(e) => {
              e.target.style.color = '#1e293b'; // Black text on click
            }}
            onMouseUp={(e) => {
              e.target.style.color = activeTab === "nearme" ? 'white' : '#334155';
            }}
          >
            <span style={{ 
              display: 'inline-block',
              minWidth: '20px'
            }}>📍</span>
            <span>Therapists Near Me</span>
          </button>
          
          <button
            onClick={() => setActiveTab("chat")}
            style={{
              background: activeTab === "chat" ? '#3b82f6' : 'transparent',
              color: activeTab === "chat" ? 'white' : '#334155',
              border: 'none',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: activeTab === "chat" ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => {
              if (activeTab !== "chat") {
                e.target.style.background = '#f1f5f9';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "chat") {
                e.target.style.background = 'transparent';
              }
            }}
            onMouseDown={(e) => {
              e.target.style.color = '#1e293b'; // Black text on click
            }}
            onMouseUp={(e) => {
              e.target.style.color = activeTab === "chat" ? 'white' : '#334155';
            }}
          >
            <span style={{ 
              display: 'inline-block',
              minWidth: '20px'
            }}>💬</span>
            <span>Chat with Therapist</span>
          </button>
          
          <button
            onClick={() => setActiveTab("past")}
            style={{
              background: activeTab === "past" ? '#3b82f6' : 'transparent',
              color: activeTab === "past" ? 'white' : '#334155',
              border: 'none',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: activeTab === "past" ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => {
              if (activeTab !== "past") {
                e.target.style.background = '#f1f5f9';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "past") {
                e.target.style.background = 'transparent';
              }
            }}
            onMouseDown={(e) => {
              e.target.style.color = '#1e293b'; // Black text on click
            }}
            onMouseUp={(e) => {
              e.target.style.color = activeTab === "past" ? 'white' : '#334155';
            }}
          >
            <span style={{ 
              display: 'inline-block',
              minWidth: '20px'
            }}>📅</span>
            <span>Past Appointments</span>
          </button>
          
          <button
            onClick={() => setActiveTab("post")}
            style={{
              background: activeTab === "post" ? '#3b82f6' : 'transparent',
              color: activeTab === "post" ? 'white' : '#334155',
              border: 'none',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: activeTab === "post" ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => {
              if (activeTab !== "post") {
                e.target.style.background = '#f1f5f9';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "post") {
                e.target.style.background = 'transparent';
              }
            }}
            onMouseDown={(e) => {
              e.target.style.color = '#1e293b'; // Black text on click
            }}
            onMouseUp={(e) => {
              e.target.style.color = activeTab === "post" ? 'white' : '#334155';
            }}
          >
            <span style={{ 
              display: 'inline-block',
              minWidth: '20px'
            }}>📝</span>
            <span>Post Appointment</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '12px' }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: 16,
          paddingBottom: "12px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: 1.2
            }}>
              {activeTab === "therapists" && "Book a Session"}
              {activeTab === "nearme" && "Therapists Near Me"}
              {activeTab === "chat" && "Chat with Therapist"}
              {activeTab === "past" && "Past Appointments"}
              {activeTab === "post" && "Post Appointment"}
            </h1>
            <p style={{ 
              margin: "4px 0 0 0",
              fontSize: '0.9rem',
              color: '#6b7280',
              lineHeight: 1.4
            }}>
              {activeTab === "therapists" && "Connect with our qualified mental health professionals"}
              {activeTab === "nearme" && "Find therapists near your current location"}
              {activeTab === "chat" && "Communicate with your therapist in real-time"}
              {activeTab === "past" && "View your previous therapy sessions"}
              {activeTab === "post" && "Complete follow-up tasks after your session"}
            </p>
          </div>
          <button 
            onClick={() => navigate("/home")}
            className="cta-btn"
            style={{ 
              padding: "8px 12px",
              fontSize: "0.85rem",
              fontWeight: 600,
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.transform = "translateY(0)";
            }}
            onMouseDown={(e) => {
              e.target.style.color = '#1e293b'; // Black text on click
            }}
            onMouseUp={(e) => {
              e.target.style.color = '#374151';
            }}
          >
            ← Back
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "therapists" && (
          <>
            {error && (
              <div style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 16,
                border: "1px solid #fecaca",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
              }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "30px 12px" }}>
                <div style={{ 
                  width: 28,
                  height: 28,
                  border: "3px solid #e5e7eb", 
                  borderTop: "3px solid #3b82f6", 
                  borderRadius: "50%", 
                  margin: "0 auto 12px",
                  animation: "spin 1s linear infinite"
                }}></div>
                <p style={{ 
                  color: "#6b7280", 
                  fontSize: "0.9rem"
                }}>
                  Loading therapists...
                </p>
              </div>
            ) : therapists.length === 0 ? (
              <div className="card" style={{ 
                textAlign: "center", 
                padding: "30px 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{ 
                  width: 50,
                  height: 50,
                  borderRadius: "50%", 
                  background: "#f3f4f6",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem"
                }}>
                  👩‍⚕️
                </div>
                <h3 style={{ 
                  margin: "0 0 8px 0",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#1f2937"
                }}>
                  No therapists available
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: "#6b7280", 
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  maxWidth: 400,
                  marginLeft: "auto",
                  marginRight: "auto"
                }}>
                  We're working on expanding our team of qualified mental health professionals. Please check back later.
                </p>
              </div>
            ) : (
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
                padding: "12px"
              }}>
                {therapists.map(therapist => (
                  <div key={therapist.id} style={{ 
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    overflow: "hidden"
                  }}
                  onClick={() => handleBookSession(therapist)}
                  onMouseOver={(e) => {
                    e.target.style.background = "#f9fafb";
                    e.target.style.transform = "translateY(-4px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "white";
                    e.target.style.transform = "translateY(0)";
                  }}
                  >
                    <div style={{ 
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      borderBottom: "1px solid #e5e7eb"
                    }}>
                      <div style={{ 
                        width: 80,
                        height: 80,
                        borderRadius: "50%", 
                        background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: "#1d4ed8",
                        marginBottom: "16px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                      }}>
                        {therapist.name ? therapist.name.charAt(0) : '👩‍⚕️'}
                      </div>
                      <h3 style={{ 
                        margin: "0 0 8px 0",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "#1f2937"
                      }}>
                        {therapist.name || 'Unknown Therapist'}
                      </h3>
                      <p style={{ 
                        margin: "0 0 12px 0",
                        color: "#3b82f6", 
                        fontSize: "0.95rem",
                        fontWeight: 600
                      }}>
                        {therapist.specialization || 'Mental Health Specialist'}
                      </p>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        marginBottom: "12px"
                      }}>
                        <span style={{
                          color: "#f59e0b",
                          fontSize: "1rem"
                        }}>★</span>
                        <span style={{
                          color: "#4b5563",
                          fontSize: "0.9rem",
                          fontWeight: 500
                        }}>
                          {therapist.rating ? therapist.rating.toFixed(1) : '4.8'}
                        </span>
                        <span style={{
                          color: "#9ca3af",
                          fontSize: "0.9rem"
                        }}>
                          ({therapist.reviewCount || Math.floor(Math.random() * 50 + 10)} reviews)
                        </span>
                      </div>
                    </div>
                    <div style={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <p style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            fontWeight: 500
                          }}>
                            Experience
                          </p>
                          <p style={{
                            margin: "2px 0 0 0",
                            fontSize: "0.95rem",
                            color: "#1f2937",
                            fontWeight: 600
                          }}>
                            {therapist.experience || Math.floor(Math.random() * 15 + 5)} years
                          </p>
                        </div>
                        <div>
                          <p style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            fontWeight: 500
                          }}>
                            Sessions
                          </p>
                          <p style={{
                            margin: "2px 0 0 0",
                            fontSize: "0.95rem",
                            color: "#1f2937",
                            fontWeight: 600
                          }}>
                            {therapist.sessionCount || Math.floor(Math.random() * 500 + 100)}+
                          </p>
                        </div>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px"
                      }}>
                        <div>
                          <p style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            fontWeight: 500
                          }}>
                            Next Available
                          </p>
                          <p style={{
                            margin: "2px 0 0 0",
                            fontSize: "0.95rem",
                            color: "#10b981",
                            fontWeight: 600
                          }}>
                            {therapist.nextAvailable || 'Today'}
                          </p>
                        </div>
                        <button 
                          className="cta-btn"
                          style={{ 
                            padding: "8px 16px",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            borderRadius: "8px",
                            border: "1px solid #3b82f6",
                            background: "#3b82f6",
                            color: "white",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)"
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#2563eb";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#3b82f6";
                            e.target.style.transform = "translateY(0)";
                          }}
                          onMouseDown={(e) => {
                            e.target.style.backgroundColor = "#1d4ed8";
                          }}
                          onMouseUp={(e) => {
                            e.target.style.backgroundColor = "#2563eb";
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "nearme" && (
          <>
            {locationError && (
              <div style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 16,
                border: "1px solid #fecaca",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
              }}>
                {locationError}
              </div>
            )}

            {findingLocation ? (
              <div style={{ textAlign: "center", padding: "30px 12px" }}>
                <div style={{ 
                  width: 28,
                  height: 28,
                  border: "3px solid #e5e7eb", 
                  borderTop: "3px solid #3b82f6", 
                  borderRadius: "50%", 
                  margin: "0 auto 12px",
                  animation: "spin 1s linear infinite"
                }}></div>
                <p style={{ 
                  color: "#6b7280", 
                  fontSize: "0.9rem"
                }}>
                  Finding your location...
                </p>
              </div>
            ) : location ? (
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
                padding: "12px"
              }}>
                {nearbyTherapists.map(therapist => (
                  <div key={therapist.id} style={{ 
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    overflow: "hidden"
                  }}
                  onClick={() => handleBookSession(therapist)}
                  onMouseOver={(e) => {
                    e.target.style.background = "#f9fafb";
                    e.target.style.transform = "translateY(-4px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "white";
                    e.target.style.transform = "translateY(0)";
                  }}
                  >
                    <div style={{ 
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      borderBottom: "1px solid #e5e7eb"
                    }}>
                      <div style={{ 
                        width: 80,
                        height: 80,
                        borderRadius: "50%", 
                        background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: "#1d4ed8",
                        marginBottom: "16px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                      }}>
                        {therapist.name ? therapist.name.charAt(0) : '👩‍⚕️'}
                      </div>
                      <h3 style={{ 
                        margin: "0 0 8px 0",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "#1f2937"
                      }}>
                        {therapist.name || 'Unknown Therapist'}
                      </h3>
                      <p style={{ 
                        margin: "0 0 12px 0",
                        color: "#3b82f6", 
                        fontSize: "0.95rem",
                        fontWeight: 600
                      }}>
                        {therapist.specialization || 'Mental Health Specialist'}
                      </p>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        marginBottom: "12px"
                      }}>
                        <span style={{
                          color: "#f59e0b",
                          fontSize: "1rem"
                        }}>★</span>
                        <span style={{
                          color: "#4b5563",
                          fontSize: "0.9rem",
                          fontWeight: 500
                        }}>
                          {therapist.rating ? therapist.rating.toFixed(1) : '4.8'}
                        </span>
                        <span style={{
                          color: "#9ca3af",
                          fontSize: "0.9rem"
                        }}>
                          ({therapist.reviewCount || Math.floor(Math.random() * 50 + 10)} reviews)
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        background: "#eff6ff",
                        borderRadius: "20px",
                        marginTop: "8px"
                      }}>
                        <span style={{
                          color: "#3b82f6",
                          fontSize: "0.9rem",
                          fontWeight: 600
                        }}>
                          📍 {therapist.distance} km away
                        </span>
                      </div>
                    </div>
                    <div style={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div>
                          <p style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            fontWeight: 500
                          }}>
                            Experience
                          </p>
                          <p style={{
                            margin: "2px 0 0 0",
                            fontSize: "0.95rem",
                            color: "#1f2937",
                            fontWeight: 600
                          }}>
                            {therapist.experience || Math.floor(Math.random() * 15 + 5)} years
                          </p>
                        </div>
                        <div>
                          <p style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            fontWeight: 500
                          }}>
                            Sessions
                          </p>
                          <p style={{
                            margin: "2px 0 0 0",
                            fontSize: "0.95rem",
                            color: "#1f2937",
                            fontWeight: 600
                          }}>
                            {therapist.sessionCount || Math.floor(Math.random() * 500 + 100)}+
                          </p>
                        </div>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px"
                      }}>
                        <div>
                          <p style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            fontWeight: 500
                          }}>
                            Next Available
                          </p>
                          <p style={{
                            margin: "2px 0 0 0",
                            fontSize: "0.95rem",
                            color: "#10b981",
                            fontWeight: 600
                          }}>
                            {therapist.nextAvailable || 'Today'}
                          </p>
                        </div>
                        <button 
                          className="cta-btn"
                          style={{ 
                            padding: "8px 16px",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            borderRadius: "8px",
                            border: "1px solid #3b82f6",
                            background: "#3b82f6",
                            color: "white",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)"
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#2563eb";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#3b82f6";
                            e.target.style.transform = "translateY(0)";
                          }}
                          onMouseDown={(e) => {
                            e.target.style.backgroundColor = "#1d4ed8";
                          }}
                          onMouseUp={(e) => {
                            e.target.style.backgroundColor = "#2563eb";
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ 
                textAlign: "center", 
                padding: "30px 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{ 
                  width: 50,
                  height: 50,
                  borderRadius: "50%", 
                  background: "#f3f4f6",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem"
                }}>
                  📍
                </div>
                <h3 style={{ 
                  margin: "0 0 8px 0",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#1f2937"
                }}>
                  Find therapists near you
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: "#6b7280", 
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  maxWidth: 400,
                  marginLeft: "auto",
                  marginRight: "auto"
                }}>
                  Enable location services to find therapists near your current location.
                </p>
                <button 
                  className="cta-btn"
                  style={{ 
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "white";
                    e.target.style.transform = "translateY(0)";
                  }}
                  onMouseDown={(e) => {
                    e.target.style.color = '#1e293b'; // Black text on click
                  }}
                  onMouseUp={(e) => {
                    e.target.style.color = '#374151';
                  }}
                  onClick={getLocation}
                >
                  Enable Location
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "chat" && (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "calc(100vh - 100px)",
            background: "#f0f4f8",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            overflow: "hidden"
          }}>
            {/* Chat Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
              background: "white",
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: "bold",
                color: "#1d4ed8",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}>
                D
              </div>
              <div>
                <h3 style={{ 
                  margin: "0 0 2px 0",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#1e293b"
                }}>
                  Dr. Sarah Johnson
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: "#10b981", 
                  fontSize: "0.85rem",
                  fontWeight: 500
                }}>
                  Online
                </p>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}>
              {chatLoading ? (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  height: "100%" 
                }}>
                  <div style={{ 
                    width: 28,
                    height: 28,
                    border: "3px solid #e5e7eb", 
                    borderTop: "3px solid #3b82f6", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite"
                  }}></div>
                </div>
              ) : chatError ? (
                <div style={{
                  background: "#fef2f2",
                  color: "#b91c1c",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #fecaca",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
                }}>
                  {chatError}
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    style={{ 
                      display: "flex",
                      justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "80%"
                    }}
                  >
                    <div style={{
                      background: message.sender === "user" ? "#3b82f6" : "white",
                      padding: "12px 16px",
                      borderRadius: message.sender === "user" 
                        ? "18px 18px 4px 18px" 
                        : "18px 18px 18px 4px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                      fontSize: "0.9rem",
                      color: message.sender === "user" ? "white" : "#374151",
                      position: "relative"
                    }}>
                      <div>{message.text}</div>
                      <div style={{
                        fontSize: "0.7rem",
                        color: message.sender === "user" ? "rgba(255, 255, 255, 0.8)" : "#94a3b8",
                        textAlign: "right",
                        marginTop: "4px"
                      }}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div style={{
              padding: "12px 16px",
              borderTop: "1px solid #e5e7eb",
              background: "white",
              display: "flex",
              gap: 8
            }}>
              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8, width: "100%" }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "24px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
                <button 
                  type="submit"
                  disabled={newMessage.trim() === ""}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "24px",
                    border: "none",
                    background: newMessage.trim() === "" ? "#9ca3af" : "#3b82f6",
                    color: "white",
                    cursor: newMessage.trim() === "" ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    transition: "background 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    if (newMessage.trim() !== "") {
                      e.target.style.background = "#2563eb";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (newMessage.trim() !== "") {
                      e.target.style.background = "#3b82f6";
                    }
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "past" && (
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            padding: "12px"
          }}>
            {pastAppointments.map(appointment => (
              <div key={appointment.id} style={{ 
                display: "flex",
                flexDirection: "column",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                overflow: "hidden"
              }}
              onClick={() => handleBookSession(appointment)}
              onMouseOver={(e) => {
                e.target.style.background = "#f9fafb";
                e.target.style.transform = "translateY(-4px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "translateY(0)";
              }}
              >
                <div style={{ 
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <div style={{ 
                    width: 80,
                    height: 80,
                    borderRadius: "50%", 
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#1d4ed8",
                    marginBottom: "16px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}>
                    {appointment.therapist ? appointment.therapist.charAt(0) : '👩‍⚕️'}
                  </div>
                  <h3 style={{ 
                    margin: "0 0 8px 0",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1f2937"
                  }}>
                    {appointment.therapist || 'Unknown Therapist'}
                  </h3>
                  <p style={{ 
                    margin: "0 0 12px 0",
                    color: "#3b82f6", 
                    fontSize: "0.95rem",
                    fontWeight: 600
                  }}>
                    Completed Session
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "12px"
                  }}>
                    <span style={{
                      color: "#10b981",
                      fontSize: "1rem",
                      fontWeight: 600
                    }}>
                      ✓ Completed
                    </span>
                  </div>
                </div>
                <div style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        fontWeight: 500
                      }}>
                        Date
                      </p>
                      <p style={{
                        margin: "2px 0 0 0",
                        fontSize: "0.95rem",
                        color: "#1f2937",
                        fontWeight: 600
                      }}>
                        {appointment.date}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        fontWeight: 500
                      }}>
                        Time
                      </p>
                      <p style={{
                        margin: "2px 0 0 0",
                        fontSize: "0.95rem",
                        color: "#1f2937",
                        fontWeight: 600
                      }}>
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px"
                  }}>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        fontWeight: 500
                      }}>
                        Duration
                      </p>
                      <p style={{
                        margin: "2px 0 0 0",
                        fontSize: "0.95rem",
                        color: "#1f2937",
                        fontWeight: 600
                      }}>
                        {appointment.duration}
                      </p>
                    </div>
                    <button 
                      className="cta-btn"
                      style={{ 
                        padding: "8px 16px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "1px solid #3b82f6",
                        background: "#3b82f6",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#2563eb";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#3b82f6";
                        e.target.style.transform = "translateY(0)";
                      }}
                      onMouseDown={(e) => {
                        e.target.style.backgroundColor = "#1d4ed8";
                      }}
                      onMouseUp={(e) => {
                        e.target.style.backgroundColor = "#2563eb";
                      }}
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "post" && (
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            padding: "12px"
          }}>
            {postAppointments.map(appointment => (
              <div key={appointment.id} style={{ 
                display: "flex",
                flexDirection: "column",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                overflow: "hidden"
              }}
              onClick={() => handleBookSession(appointment)}
              onMouseOver={(e) => {
                e.target.style.background = "#f9fafb";
                e.target.style.transform = "translateY(-4px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "translateY(0)";
              }}
              >
                <div style={{ 
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <div style={{ 
                    width: 80,
                    height: 80,
                    borderRadius: "50%", 
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#1d4ed8",
                    marginBottom: "16px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}>
                    📝
                  </div>
                  <h3 style={{ 
                    margin: "0 0 8px 0",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1f2937"
                  }}>
                    {appointment.title}
                  </h3>
                  <p style={{ 
                    margin: "0 0 12px 0",
                    color: "#3b82f6", 
                    fontSize: "0.95rem",
                    fontWeight: 600
                  }}>
                    Post-Session Task
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "12px"
                  }}>
                    <span style={{
                      color: "#f59e0b",
                      fontSize: "1rem",
                      fontWeight: 600
                    }}>
                      Due: {appointment.dueDate}
                    </span>
                  </div>
                </div>
                <div style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        fontWeight: 500
                      }}>
                        Description
                      </p>
                      <p style={{
                        margin: "2px 0 0 0",
                        fontSize: "0.95rem",
                        color: "#1f2937",
                        fontWeight: 600
                      }}>
                        {appointment.description}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "8px"
                  }}>
                    <button 
                      className="cta-btn"
                      style={{ 
                        padding: "8px 16px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "1px solid #3b82f6",
                        background: "#3b82f6",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#2563eb";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#3b82f6";
                        e.target.style.transform = "translateY(0)";
                      }}
                      onMouseDown={(e) => {
                        e.target.style.backgroundColor = "#1d4ed8";
                      }}
                      onMouseUp={(e) => {
                        e.target.style.backgroundColor = "#2563eb";
                      }}
                    >
                      Complete Task
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showTimeSlots && (
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            padding: "12px"
          }}>
            <div style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              marginBottom: "20px"
            }}>
              <h3 style={{ 
                margin: "0 0 8px 0",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1f2937"
              }}>
                Select a Time Slot
              </h3>
              <p style={{ 
                margin: 0, 
                color: "#6b7280", 
                fontSize: "1rem",
                lineHeight: 1.4
              }}>
                Choose a time that works best for you.
              </p>
            </div>
            {generateTimeSlots().map(slot => (
              <div key={slot.id} style={{ 
                display: "flex",
                flexDirection: "column",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                cursor: slot.available ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                overflow: "hidden",
                opacity: slot.available ? 1 : 0.6
              }}
              onClick={() => slot.available && handleTimeSlotSelect(slot)}
              onMouseOver={(e) => {
                if (slot.available) {
                  e.target.style.background = "#f9fafb";
                  e.target.style.transform = "translateY(-4px)";
                }
              }}
              onMouseOut={(e) => {
                if (slot.available) {
                  e.target.style.background = "white";
                  e.target.style.transform = "translateY(0)";
                }
              }}
              >
                <div style={{ 
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <div style={{ 
                    width: 80,
                    height: 80,
                    borderRadius: "50%", 
                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#1d4ed8",
                    marginBottom: "16px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                  }}>
                    🕒
                  </div>
                  <h3 style={{ 
                    margin: "0 0 8px 0",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1f2937"
                  }}>
                    {slot.day}
                  </h3>
                  <p style={{ 
                    margin: "0 0 12px 0",
                    color: "#3b82f6", 
                    fontSize: "1.1rem",
                    fontWeight: 700
                  }}>
                    {slot.time}
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "12px"
                  }}>
                    <span style={{
                      color: slot.available ? "#10b981" : "#b91c1c",
                      fontSize: "1rem",
                      fontWeight: 600
                    }}>
                      {slot.available ? "✓ Available" : "✗ Not Available"}
                    </span>
                  </div>
                </div>
                <div style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <p style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        fontWeight: 500
                      }}>
                        Duration
                      </p>
                      <p style={{
                        margin: "2px 0 0 0",
                        fontSize: "0.95rem",
                        color: "#1f2937",
                        fontWeight: 600
                      }}>
                        {slot.duration}
                      </p>
                    </div>
                    {slot.available && (
                      <button 
                        className="cta-btn"
                        style={{ 
                          padding: "8px 16px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          borderRadius: "8px",
                          border: "1px solid #3b82f6",
                          background: "#3b82f6",
                          color: "white",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = "#2563eb";
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = "#3b82f6";
                          e.target.style.transform = "translateY(0)";
                        }}
                        onMouseDown={(e) => {
                          e.target.style.backgroundColor = "#1d4ed8";
                        }}
                        onMouseUp={(e) => {
                          e.target.style.backgroundColor = "#2563eb";
                        }}
                      >
                        Select Slot
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showPatientForm && (
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            padding: "12px",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            <div style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              marginBottom: "20px"
            }}>
              <h3 style={{ 
                margin: "0 0 8px 0",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1f2937"
              }}>
                Enter Your Details
              </h3>
              <p style={{ 
                margin: 0, 
                color: "#6b7280", 
                fontSize: "1rem",
                lineHeight: 1.4
              }}>
              Provide your contact information for the booking.
              </p>
            </div>
            <div style={{
              gridColumn: "1 / -1",
              background: "white",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              padding: "24px"
            }}>
              <form onSubmit={handlePatientFormSubmit}>
                <div style={{ 
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px"
                }}>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 8
                  }}>
                    <label style={{ 
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#1f2937"
                    }}>
                      Name
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={patientData.name} 
                      onChange={handlePatientFormChange} 
                      style={{ 
                        padding: "12px 16px",
                        fontSize: "1rem",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        background: "white",
                        color: "#374151",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 8
                  }}>
                    <label style={{ 
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#1f2937"
                    }}>
                      Age
                    </label>
                    <input 
                      type="number" 
                      name="age" 
                      value={patientData.age} 
                      onChange={handlePatientFormChange} 
                      style={{ 
                        padding: "12px 16px",
                        fontSize: "1rem",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        background: "white",
                        color: "#374151",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 8
                  }}>
                    <label style={{ 
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#1f2937"
                    }}>
                      Phone
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={patientData.phone} 
                      onChange={handlePatientFormChange} 
                      style={{ 
                        padding: "12px 16px",
                        fontSize: "1rem",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        background: "white",
                        color: "#374151",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 8
                  }}>
                    <label style={{ 
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#1f2937"
                    }}>
                      Email
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      value={patientData.email} 
                      onChange={handlePatientFormChange} 
                      style={{ 
                        padding: "12px 16px",
                        fontSize: "1rem",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        background: "white",
                        color: "#374151",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
                      }}
                    />
                  </div>
                </div>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 8,
                  marginTop: "20px"
                }}>
                  <label style={{ 
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1f2937"
                  }}>
                    Describe Your Issues
                  </label>
                  <textarea 
                    name="issue" 
                    value={patientData.issue} 
                    onChange={handlePatientFormChange} 
                    rows="4"
                    style={{ 
                      padding: "12px 16px",
                      fontSize: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      color: "#374151",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      resize: "vertical"
                    }}
                  />
                </div>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "flex-end", 
                  gap: 12,
                  marginTop: 24
                }}>
                  <button 
                    type="button"
                    onClick={() => setShowPatientForm(false)}
                    style={{ 
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      color: "#374151",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#f9fafb";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "white";
                      e.target.style.transform = "translateY(0)";
                    }}
                    onMouseDown={(e) => {
                      e.target.style.color = '#1e293b'; // Black text on click
                    }}
                    onMouseUp={(e) => {
                      e.target.style.color = '#374151';
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ 
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: "8px",
                      border: "1px solid #3b82f6",
                      background: "#3b82f6",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#2563eb";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#3b82f6";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Time Slot Selection Modal */}
      {showTimeSlots && selectedTherapist && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(to right, #f8fafc, #f1f5f9)'
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: 12
              }}>
                <h2 style={{ 
                  margin: 0,
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#1f2937'
                }}>
                  Book Session
                </h2>
                <button
                  onClick={() => setShowTimeSlots(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#1d4ed8",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}>
                  {selectedTherapist.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ 
                    margin: "0 0 2px 0",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1e293b"
                  }}>
                    {selectedTherapist.name}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: "#64748b", 
                    fontSize: "0.9rem",
                    fontWeight: 500
                  }}>
                    Licensed Therapist
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              flex: 1
            }}>
              <h3 style={{ 
                margin: "0 0 16px 0",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#1f2937"
              }}>
                Select a Time Slot
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 12
              }}>
                {generateTimeSlots().map((slot) => (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => handleTimeSlotSelect(slot)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: slot.available ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                      background: slot.available ? 'white' : '#f9fafb',
                      color: slot.available ? '#374151' : '#9ca3af',
                      cursor: slot.available ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      fontWeight: 500,
                      fontSize: '0.85rem'
                    }}
                    onMouseOver={(e) => {
                      if (slot.available) {
                        e.target.style.background = '#f9fafb';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (slot.available) {
                        e.target.style.background = 'white';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{ 
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      marginBottom: '4px'
                    }}>
                      {slot.day}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem',
                      marginBottom: '2px'
                    }}>
                      {slot.time}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {slot.duration}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowTimeSlots(false)}
                style={{
                  padding: '10px 16px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Patient Details Form Modal */}
      {showPatientForm && selectedTherapist && selectedSlot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              maxWidth: 600,
              width: '90%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(to right, #f8fafc, #f1f5f9)'
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: 12
              }}>
                <h2 style={{ 
                  margin: 0,
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#1f2937'
                }}>
                  Patient Details
                </h2>
                <button
                  onClick={() => setShowPatientForm(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#1d4ed8",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}>
                  {selectedTherapist.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ 
                    margin: "0 0 2px 0",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1e293b"
                  }}>
                    {selectedTherapist.name}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: "#64748b", 
                    fontSize: "0.9rem",
                    fontWeight: 500
                  }}>
                    {selectedSlot.day} at {selectedSlot.time} ({selectedSlot.duration})
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              flex: 1
            }}>
              <form onSubmit={handlePatientFormSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600, 
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={patientData.name}
                    onChange={handlePatientFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 600, 
                      color: '#374151',
                      fontSize: '0.9rem'
                    }}>
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={patientData.age}
                      onChange={handlePatientFormChange}
                      required
                      min="1"
                      max="120"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter your age"
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 600, 
                      color: '#374151',
                      fontSize: '0.9rem'
                    }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={patientData.phone}
                      onChange={handlePatientFormChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600, 
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={patientData.email}
                    onChange={handlePatientFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600, 
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    What issues are you facing? *
                  </label>
                  <textarea
                    name="issue"
                    value={patientData.issue}
                    onChange={handlePatientFormChange}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                    placeholder="Please describe the mental health issues or concerns you're experiencing..."
                  />
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '12px',
                  marginTop: '24px'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowPatientForm(false)}
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      background: 'white',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'white';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                    }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Custom styles for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}