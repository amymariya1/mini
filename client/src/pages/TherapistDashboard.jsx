import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { sendMessage, getChatHistory, getConversations, markMessageAsRead, getTherapistAppointments, getPatients, createPatient, cancelAppointment } from "../services/api";
import TherapistTimeSlots from "./TherapistTimeSlots";
import NewPatientForm from "../components/NewPatientForm";
import SimplePatientForm from "../components/SimplePatientForm";
import ConsultationReviewForm from "../components/ConsultationReviewForm";
import ConsultationHistory from "../components/ConsultationHistory";
import CancelAppointmentsForm from "../components/CancelAppointmentsForm";

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // Default to upcoming appointments
  
  // Chat states
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // New patient form state
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [showSimplePatientForm, setShowSimplePatientForm] = useState(false);

  // Consultation review form state
  const [showConsultationReviewForm, setShowConsultationReviewForm] = useState(false);
  const [selectedPatientForReview, setSelectedPatientForReview] = useState(null);

  // Consultation history state
  const [showConsultationHistory, setShowConsultationHistory] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Patient list states
  const [patientsList, setPatientsList] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Cancel appointments form state
  const [showCancelAppointmentsForm, setShowCancelAppointmentsForm] = useState(false);

  useEffect(() => {
    // Try to get user from localStorage
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
      }
    } catch (_) {
      // If there's no user, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  // Load conversations when chat tab is active
  useEffect(() => {
    if (activeTab === "chat" && user) {
      loadConversations();
    }
  }, [activeTab, user]);

  // Load appointments when upcoming tab is active
  useEffect(() => {
    if (activeTab === "upcoming" && user) {
      loadAppointments();
    }
  }, [activeTab, user]);

  // Load patients when patient list tab is active
  useEffect(() => {
    if (activeTab === "patientList" && user) {
      loadPatients();
    }
  }, [activeTab, user]);

  // Load messages when a patient is selected
  useEffect(() => {
    if (selectedPatient && user) {
      loadChatHistory();
      
      // Start polling for new messages
      const interval = setInterval(() => {
        loadChatHistory();
        loadConversations(); // Also refresh conversations to update unread counts
      }, 3000); // Poll every 3 seconds
      
      setPollingInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [selectedPatient, user]);

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const response = await getConversations();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setPatients([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!user) return;
    try {
      setAppointmentsLoading(true);
      const response = await getTherapistAppointments(user.id);
      if (response.success) {
        // Filter appointments to only show those with paymentId (paid appointments)
        // Include both scheduled and rescheduled appointments
        const relevantAppointments = response.data.filter(appointment => 
          appointment.paymentId && 
          (appointment.status === 'scheduled' || appointment.status === 'rescheduled')
        );
        setAppointments(relevantAppointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const loadPatients = async () => {
    if (!user) return;
    try {
      setPatientsLoading(true);
      const response = await getPatients();
      if (response.success) {
        setPatientsList(response.data);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatientsList([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const loadChatHistory = async () => {
    if (!selectedPatient || !user) return;
    
    try {
      setChatLoading(true);
      const response = await getChatHistory(user.id, selectedPatient.partnerId);
      if (response.success) {
        setMessages(response.data);
        // Mark messages as read when loading chat
        markUnreadMessagesAsRead(response.data);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const markUnreadMessagesAsRead = async (messages) => {
    if (!user || !selectedPatient) return;
    
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
    if (!newMessage.trim() || !selectedPatient || !user) return;

    try {
      const response = await sendMessage({
        recipientId: selectedPatient.partnerId,
        message: newMessage.trim()
      });

      if (response.success) {
        // Add the new message to the messages list
        setMessages(prev => [...prev, response.data]);
        setNewMessage("");
        
        // Refresh conversations to update last message
        loadConversations();
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Handle new patient form submission
  const handleNewPatientSubmit = (formData) => {
    // Refresh conversations to show the new patient
    loadConversations();
    // Refresh patients list to show the new patient
    loadPatients();
    alert("Patient saved successfully!");
  };

  // Handle simple patient form submission
  const handleSimplePatientSubmit = async (formData) => {
    try {
      // Convert the simple form data to the format expected by the backend
      const patientData = {
        patientName: formData.name,
        patientEmail: `${formData.name.replace(/\s+/g, '.')}@example.com`, // Generate a placeholder email
        patientPhone: formData.phone,
        patientAge: formData.age,
        consultationNotes: formData.observation
      };
      
      const response = await createPatient(patientData);
      
      if (response.success) {
        // Refresh the patient list
        loadPatients();
        alert("Patient record saved successfully!");
        return Promise.resolve();
      } else {
        throw new Error(response.message || "Failed to save patient");
      }
    } catch (err) {
      console.error("Error saving patient:", err);
      alert(err.message || "Failed to save patient. Please try again.");
      return Promise.reject(err);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    
    try {
      const response = await cancelAppointment(appointmentId);
      
      if (response.success) {
        // Refresh the appointments list
        await loadAppointments();
        alert("Appointment cancelled successfully!");
      } else {
        throw new Error(response.message || "Failed to cancel appointment");
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert(err.message || "Failed to cancel appointment. Please try again.");
    }
  };

  // Handle cancellation of appointments
  const handleCancelAppointments = async () => {
    try {
      // Refresh the appointments list
      await loadAppointments();
      alert("Appointments cancelled successfully and emails sent to patients!");
    } catch (err) {
      console.error("Error refreshing appointments after cancellation:", err);
      alert("Appointments cancelled but failed to refresh list. Please refresh the page manually.");
    }
  };

  // Handle cancellation of all appointments
  const handleCancelAllAppointments = async () => {
    if (!window.confirm("Are you sure you want to cancel all upcoming appointments? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Cancel all appointments one by one
      const cancelPromises = appointments.map(appointment => 
        cancelAppointment(appointment._id)
      );
      
      // Wait for all cancellations to complete
      const results = await Promise.all(cancelPromises);
      
      // Check if all cancellations were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        // Refresh the appointments list
        await loadAppointments();
        alert("All appointments cancelled successfully!");
      } else {
        // Some cancellations failed
        await loadAppointments(); // Refresh to show which appointments were cancelled
        alert("Some appointments could not be cancelled. Please check the list and try again for failed appointments.");
      }
    } catch (err) {
      console.error("Error cancelling appointments:", err);
      alert(err.message || "Failed to cancel appointments. Please try again.");
    }
  };

  // Handle consultation review submission
  const handleConsultationReviewSubmit = async (formData) => {
    try {
      // Refresh the patient list to show the new note
      await loadPatients();
      alert("Consultation review saved successfully!");
      return Promise.resolve();
    } catch (err) {
      console.error("Error refreshing patients after review submission:", err);
      alert("Consultation review saved but failed to refresh list.");
      return Promise.reject(err);
    }
  };

  // Function to open consultation review form
  const openConsultationReview = (patient) => {
    setSelectedPatientForReview(patient);
    setShowConsultationReviewForm(true);
  };

  // Function to open consultation history
  const openConsultationHistory = (patient) => {
    setSelectedPatientForHistory(patient);
    setShowConsultationHistory(true);
  };

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // If there's no user, don't render anything (redirecting)
  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex' }}>
      {/* Left Sidebar Menu - Calendar Only */}
      <div style={{
        width: '80px',
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 50
      }}>
        {/* Calendar Icon */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/therapist-calendar")}
          style={{
            background: 'rgba(30, 58, 138, 0.1)',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: '#1e3a8a',
            marginTop: '20px',
            width: '48px',
            height: '48px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          title="Calendar"
        >
          📅
        </motion.button>
        
        {/* Time Slots Icon */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("timeSlots")}
          style={{
            background: activeTab === "timeSlots" ? 'rgba(30, 58, 138, 0.2)' : 'rgba(30, 58, 138, 0.1)',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: '#1e3a8a',
            marginTop: '20px',
            width: '48px',
            height: '48px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          title="Time Slots"
        >
          🕐
        </motion.button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '80px' }}>
        {/* Top Navbar */}
        <header className="navbar" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div className="navbar-content" style={{ padding: '0 24px' }}>
            <div 
              className="navbar-brand" 
              onClick={() => navigate("/")} 
              style={{ cursor: "pointer", fontWeight: '700', fontSize: '1.5rem' }}
            >
              MindMirror
            </div>
            <nav className="navbar-nav">
              <motion.span whileHover={{ y: -1, opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
                <button 
                  className="nav-link"
                  onClick={() => setActiveTab("upcoming")}
                  style={{ 
                    background: activeTab === "upcoming" ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: activeTab === "upcoming" ? '600' : 'normal'
                  }}
                >
                  Upcoming Appointments
                </button>
              </motion.span>
              <motion.span whileHover={{ y: -1, opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
                <button 
                  className="nav-link"
                  onClick={() => setActiveTab("chat")}
                  style={{ 
                    background: activeTab === "chat" ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: activeTab === "chat" ? '600' : 'normal'
                  }}
                >
                  💬 Patient Chats
                </button>
              </motion.span>
              <motion.span whileHover={{ y: -1, opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
                <button 
                  className="nav-link"
                  onClick={() => setActiveTab("post")}
                  style={{ 
                    background: activeTab === "post" ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: activeTab === "post" ? '600' : 'normal'
                  }}
                >
                  Post Appointments
                </button>
              </motion.span>
              <motion.span whileHover={{ y: -1, opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
                <button 
                  className="nav-link"
                  onClick={() => setActiveTab("patientList")}
                  style={{ 
                    background: activeTab === "patientList" ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: activeTab === "patientList" ? '600' : 'normal'
                  }}
                >
                  👥 Patient List
                </button>
              </motion.span>
              <motion.span whileHover={{ y: -1, opacity: 0.9 }} whileTap={{ scale: 0.98 }}>
                <button 
                  className="nav-link"
                  onClick={() => {
                    localStorage.removeItem("mm_user");
                    navigate("/");
                  }}
                  style={{ 
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </motion.span>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: "24px" }}>
        <motion.div 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.25 }} 
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ margin: 0 }}>Therapist Dashboard</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#64748b" }}>Welcome, {user.name}</span>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "upcoming" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, color: "#1e3a8a" }}>Upcoming Appointments</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => setShowSimplePatientForm(true)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      + New
                    </button>
                    {appointments.length > 0 && (
                      <button
                        onClick={() => setShowCancelAppointmentsForm(true)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: '1px solid #ef4444',
                          background: 'white',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Cancel Appointments
                      </button>
                    )}
                  </div>
                </div>
                {appointmentsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Loading appointments...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                      You have no upcoming appointments scheduled.
                    </p>
                    <p style={{ color: "#94a3b8", marginTop: "10px" }}>
                      Appointments will appear here once clients book sessions with you.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {appointments.map((appointment) => {
                      // Determine status color and text
                      let statusColor = '#10b981'; // green for scheduled
                      let statusText = 'Scheduled';
                      
                      switch (appointment.status) {
                        case 'scheduled':
                          statusColor = '#10b981';
                          statusText = 'Scheduled';
                          break;
                        case 'rescheduled':
                          statusColor = '#f59e0b';
                          statusText = 'Rescheduled';
                          break;
                        case 'cancelled':
                          statusColor = '#ef4444';
                          statusText = 'Cancelled';
                          break;
                        case 'completed':
                          statusColor = '#8b5cf6';
                          statusText = 'Completed';
                          break;
                        default:
                          statusColor = '#10b981';
                          statusText = 'Scheduled';
                      }
                      
                      return (
                        <div
                          key={appointment._id}
                          style={{
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            background: '#f8fafc'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.5rem' }}>👤</span>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>
                                    {appointment.userId?.name || 'Patient'}
                                  </h4>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    {appointment.userId?.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                background: statusColor,
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '0.85rem'
                              }}
                            >
                              {statusText}
                            </div>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📅</span>
                                <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                                  {new Date(appointment.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🕐</span>
                                <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                                  {appointment.timeSlot}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              {appointment.age && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '1.2rem' }}>👤</span>
                                  <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                                    Age: {appointment.age}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {appointment.problem && (
                            <div style={{ 
                              marginTop: '12px', 
                              padding: '12px', 
                              background: '#fff', 
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>💭</span>
                                <div style={{ flex: 1 }}>
                                  <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Problem:</strong>
                                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    {appointment.problem}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "timeSlots" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TherapistTimeSlots />
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ padding: 24, borderRadius: 12, border: "1px solid #e5e7eb", height: '600px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1e3a8a" }}>Patient Chats</h3>
                
                <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                  {/* Patient List */}
                  <div style={{ 
                    width: '250px', 
                    borderRight: '1px solid #e5e7eb', 
                    paddingRight: '20px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: '0', fontSize: '0.95rem', color: '#64748b' }}>Your Patients</h4>
                      <button
                        onClick={() => setShowNewPatientForm(true)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#3b82f6',
                          color: 'white',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        + New Patient
                      </button>
                    </div>
                    {conversationsLoading ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                        Loading conversations...
                      </div>
                    ) : patients.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                        No conversations yet
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {patients.map(patient => (
                          <div
                            key={patient.partnerId}
                            onClick={() => setSelectedPatient(patient)}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              background: selectedPatient?.partnerId === patient.partnerId ? '#eff6ff' : 'transparent',
                              border: `1px solid ${selectedPatient?.partnerId === patient.partnerId ? '#3b82f6' : '#e5e7eb'}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '0.9rem' }}>{patient.partnerName}</strong>
                              {patient.unreadCount > 0 && (
                                <span style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  borderRadius: '10px',
                                  padding: '2px 6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600
                                }}>
                                  {patient.unreadCount}
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {patient.lastMessage}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                              {new Date(patient.lastMessageTime).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chat Area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {selectedPatient ? (
                      <>
                        {/* Chat Header */}
                        <div style={{ 
                          padding: '12px', 
                          borderBottom: '1px solid #e5e7eb',
                          marginBottom: '16px'
                        }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedPatient.partnerName}</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Patient</p>
                        </div>

                        {/* Messages */}
                        <div style={{ 
                          flex: 1, 
                          overflowY: 'auto', 
                          padding: '0 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          {chatLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                              Loading messages...
                            </div>
                          ) : messages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                              No messages yet. Start a conversation!
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
                                  padding: '10px 14px',
                                  borderRadius: message.senderId === user.id ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                  maxWidth: '70%'
                                }}>
                                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{message.message}</p>
                                  <span style={{ 
                                    fontSize: '0.7rem', 
                                    opacity: 0.8, 
                                    marginTop: '4px', 
                                    display: 'block',
                                    color: message.senderId === user.id ? 'rgba(255,255,255,0.8)' : '#64748b'
                                  }}>
                                    {new Date(message.timestamp).toLocaleTimeString()}
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
                            padding: '16px 12px 0',
                            borderTop: '1px solid #e5e7eb'
                          }}
                        >
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                              fontSize: '0.9rem'
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              padding: '10px 20px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#3b82f6',
                              color: 'white',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#94a3b8'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                          <p>Select a patient to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "post" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1e3a8a" }}>Post Appointments</h3>
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                    No completed appointments yet.
                  </p>
                  <p style={{ color: "#94a3b8", marginTop: "10px" }}>
                    Completed sessions and follow-ups will appear here.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "patientList" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card" style={{ padding: 24, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: "#1e3a8a" }}>Patient List</h3>
                  <button
                    onClick={() => setShowSimplePatientForm(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#3b82f6',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    + New Patient
                  </button>
                </div>
                
                {patientsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Loading patients...</p>
                  </div>
                ) : patientsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                      You have no patients in your records yet.
                    </p>
                    <p style={{ color: "#94a3b8", marginTop: "10px" }}>
                      Add your first patient using the "New Patient" button above.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {patientsList.map((patient) => (
                      <div
                        key={patient._id}
                        style={{
                          padding: '20px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          background: '#f8fafc'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '1.5rem' }}>👤</span>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>
                                  {patient.user?.name || 'Patient'}
                                </h4>
                                {patient.user?.age ? (
                                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    Age: {patient.user.age}
                                  </p>
                                ) : (
                                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    Age not provided
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              background: '#10b981',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '0.85rem'
                            }}
                          >
                            Active
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '1.2rem' }}>📅</span>
                              <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                                Created: {new Date(patient.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            {patient.user?.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>📞</span>
                                <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                                  {patient.user.phone}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            {patient.user?.age && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '1.2rem' }}>👤</span>
                                <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                                  Age: {patient.user.age}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {patient.notes && patient.notes.length > 0 && (
                          <div style={{ 
                            marginTop: '12px', 
                            padding: '12px', 
                            background: '#fff', 
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ fontSize: '1.2rem' }}>📝</span>
                              <div style={{ flex: 1 }}>
                                <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Last Note:</strong>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                  {patient.notes[patient.notes.length - 1].content}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Consultation Review Button */}
                        <div style={{ 
                          marginTop: '16px', 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          gap: '10px'
                        }}>
                          <button
                            onClick={() => openConsultationHistory(patient)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: '1px solid #10b981',
                              background: 'white',
                              color: '#10b981',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '0.9rem'
                            }}
                          >
                            Consultation History
                          </button>
                          <button
                            onClick={() => openConsultationReview(patient)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: '1px solid #3b82f6',
                              background: 'white',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '0.9rem'
                            }}
                          >
                            + Consultation Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
        </main>

        {/* New Patient Form Modal */}
        {showNewPatientForm && (
          <NewPatientForm
            onClose={() => setShowNewPatientForm(false)}
            onSubmit={handleNewPatientSubmit}
          />
        )}
        
        {/* Simple Patient Form Modal */}
        {showSimplePatientForm && (
          <SimplePatientForm
            onClose={() => setShowSimplePatientForm(false)}
            onSubmit={handleSimplePatientSubmit}
          />
        )}

        {/* Consultation Review Form Modal */}
        {showConsultationReviewForm && (
          <ConsultationReviewForm
            patient={selectedPatientForReview}
            onClose={() => setShowConsultationReviewForm(false)}
            onSubmit={handleConsultationReviewSubmit}
          />
        )}

        {/* Consultation History Modal */}
        {showConsultationHistory && (
          <ConsultationHistory
            patient={selectedPatientForHistory}
            onClose={() => setShowConsultationHistory(false)}
          />
        )}

        {/* Cancel Appointments Form Modal */}
        {showCancelAppointmentsForm && (
          <CancelAppointmentsForm
            therapistId={user.id}
            appointments={appointments}
            onCancel={handleCancelAppointments}
            onClose={() => setShowCancelAppointmentsForm(false)}
          />
        )}
      </div>
    </div>
  );
}