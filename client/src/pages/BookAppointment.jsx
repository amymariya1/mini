import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  listTherapists, 
  bookAppointment, 
  getUserAppointments, 
  getAvailableTimeSlots, 
  sendMessage, 
  getChatHistory 
} from '../services/api';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaComment, 
  FaPlus, 
  FaHistory, 
  FaCalendarCheck,
  FaBookOpen,
  FaVideo,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaChevronRight,
  FaTimes,
  FaCheckCircle,
  FaHeart,
  FaGraduationCap,
  FaAward,
  FaGlobe,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

export default function BookAppointment() {
  const { therapistId } = useParams();
  const [activeTab, setActiveTab] = useState('book');
  const [therapists, setTherapists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    age: '',
    problem: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('mm_user'));
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    setUser(currentUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [therapistsRes, appointmentsRes] = await Promise.all([
        listTherapists(),
        getUserAppointments()
      ]);

      if (therapistsRes.success) {
        setTherapists(therapistsRes.data);
        
        // If therapistId is provided, find that therapist and open booking modal
        if (therapistId) {
          const specificTherapist = therapistsRes.data.find(t => t._id === therapistId);
          if (specificTherapist) {
            setSelectedTherapist(specificTherapist);
            setShowBookingModal(true);
          }
        }
      }
      if (appointmentsRes.success) {
        const normalized = (appointmentsRes.data || []).map(a => ({
          ...a,
          therapist: a.therapist || a.therapistId || null,
          time: a.time || a.timeSlot || ''
        }));
        setAppointments(normalized);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (selectedTherapist && bookingData.date) {
        setLoadingTimeSlots(true);
        setError('');
        try {
          const response = await getAvailableTimeSlots(selectedTherapist._id, bookingData.date);
          if (response.success) {
            setAvailableTimeSlots(response.data);
            // If there's only one time slot, auto-select it
            if (response.data.length === 1 && !bookingData.time) {
              setBookingData(prev => ({ ...prev, time: response.data[0] }));
            }
          } else {
            setError(response.message || 'Failed to fetch available time slots');
            setAvailableTimeSlots([]);
          }
        } catch (err) {
          console.error('Error fetching available time slots:', err);
          setError('Failed to fetch available time slots. Please try again.');
          setAvailableTimeSlots([]);
        } finally {
          setLoadingTimeSlots(false);
        }
      } else {
        setAvailableTimeSlots([]);
      }
    };

    fetchAvailableTimeSlots();
  }, [selectedTherapist, bookingData.date]);

  const handleBookAppointment = (therapist) => {
    setSelectedTherapist(therapist);
    setShowBookingModal(true);
    setBookingData({
      date: '',
      time: '',
      age: '',
      problem: ''
    });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingData.date || !bookingData.time) {
      setError('Please select date and time');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const appointmentData = {
        therapistId: selectedTherapist._id,
        userId: user.id,
        date: bookingData.date,
        timeSlot: bookingData.time,
        age: bookingData.age,
        problem: bookingData.problem
      };

      const response = await bookAppointment(appointmentData);
      if (response.success) {
        alert('Appointment booked successfully!');
        setShowBookingModal(false);
        setBookingData({
          date: '',
          time: '',
          age: '',
          problem: ''
        });
        setAvailableTimeSlots([]); // Clear available time slots
        fetchData(); // Refresh appointments
      } else {
        setError(response.message || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChatWithTherapist = (therapistId) => {
    window.location.href = `/patient-chat/${therapistId}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'rescheduled': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <FaClock />;
      case 'completed': return <FaCheckCircle />;
      case 'cancelled': return <FaTimes />;
      case 'rescheduled': return <FaCalendarAlt />;
      default: return <FaClock />;
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < new Date() || apt.status === 'completed' || apt.status === 'cancelled'
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter and sort therapists
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         therapist.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         therapist.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || therapist.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating': return (b.rating || 4.5) - (a.rating || 4.5);
      case 'experience': return (b.experience || 5) - (a.experience || 5);
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const specialties = [...new Set(therapists.map(t => t.specialization).filter(Boolean))];

  const tabs = [
    { id: 'book', label: 'Find Therapist', icon: <FaSearch /> },
    { id: 'upcoming', label: 'Upcoming', icon: <FaCalendarCheck /> },
    { id: 'past', label: 'History', icon: <FaHistory /> }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ borderTopColor: 'white', marginBottom: '20px' }}></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' 
    }}>
      <Navbar />
      
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '24px',
            padding: '48px 40px',
            marginBottom: '40px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1,
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{ fontSize: '4rem', marginBottom: '24px' }}
            >
              🧠💙
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ 
                fontSize: '3rem', 
                fontWeight: 800, 
                marginBottom: '20px',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              Mental Health Care
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ 
                fontSize: '1.3rem', 
                opacity: 0.95, 
                maxWidth: 800,
                margin: '0 auto 32px auto',
                lineHeight: 1.6
              }}
            >
              Connect with licensed mental health professionals. Schedule sessions, chat securely, and get the support you deserve.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
                flexWrap: 'wrap',
                marginTop: '32px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
                  {therapists.length}+
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.8 }}>Expert Therapists</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
                  {upcomingAppointments.length}
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.8 }}>Upcoming Sessions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
                  24/7
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.8 }}>Chat Support</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: 'flex',
            background: 'white',
            borderRadius: '20px',
            padding: '12px',
            marginBottom: '40px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '20px 28px',
                borderRadius: '16px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748b',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'upcoming' && upcomingAppointments.length > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#ef4444',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  minWidth: '24px',
                  textAlign: 'center',
                  fontWeight: 700
                }}>
                  {upcomingAppointments.length}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1rem'
            }}
          >
            <FaTimes />
            {error}
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'book' && (
              <div>
                {/* Search and Filter Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    marginBottom: '32px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '20px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <FaSearch style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        fontSize: '1.1rem'
                      }} />
                      <input
                        type="text"
                        placeholder="Search therapists by name, specialty, or experience..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '16px 16px 16px 48px',
                          borderRadius: '12px',
                          border: '2px solid #e5e7eb',
                          fontSize: '1rem',
                          background: '#f8fafc',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                    
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        background: 'white',
                        minWidth: '180px'
                      }}
                    >
                      <option value="all">All Specialties</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        background: 'white',
                        minWidth: '140px'
                      }}
                    >
                      <option value="rating">Sort by Rating</option>
                      <option value="experience">Sort by Experience</option>
                      <option value="name">Sort by Name</option>
                    </select>
                  </div>
                </motion.div>

                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#1e293b', 
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <FaUser style={{ color: '#667eea' }} />
                  Available Therapists ({filteredTherapists.length})
                </h2>

                {filteredTherapists.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ 
                      textAlign: 'center', 
                      padding: '80px', 
                      color: '#64748b',
                      background: 'white',
                      borderRadius: '20px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                    }}
                  >
                    <FaUser style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.3rem', marginBottom: '12px' }}>No therapists found</p>
                    <p style={{ fontSize: '1rem', opacity: 0.8 }}>Try adjusting your search criteria</p>
                  </motion.div>
                ) : (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                    gap: '28px' 
                  }}>
                    {filteredTherapists.map((therapist, index) => (
                      <motion.div
                        key={therapist._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ 
                          y: -8, 
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                          scale: 1.02
                        }}
                        style={{
                          background: 'white',
                          borderRadius: '24px',
                          padding: '32px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                          border: '1px solid #e2e8f0',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Therapist Avatar */}
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '2.5rem',
                          marginBottom: '24px',
                          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                        }}>
                          <FaUser />
                        </div>
                        
                        <div>
                          <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ 
                              fontSize: '1.6rem', 
                              fontWeight: 700, 
                              color: '#1e293b', 
                              margin: '0 0 8px 0' 
                            }}>
                              {therapist.name}
                            </h3>
                            <p style={{ 
                              color: '#667eea', 
                              margin: '0 0 12px 0',
                              fontSize: '1.1rem',
                              fontWeight: 600
                            }}>
                              {therapist.specialization || 'Mental Health Therapist'}
                            </p>
                            
                            {/* Rating and Experience */}
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '20px', 
                              marginBottom: '16px',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaStar style={{ color: '#f59e0b', fontSize: '1.1rem' }} />
                                <span style={{ fontWeight: 600, color: '#374151' }}>
                                  {therapist.rating || '4.8'}
                                </span>
                                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>(128 reviews)</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaGraduationCap style={{ color: '#667eea', fontSize: '1.1rem' }} />
                                <span style={{ fontWeight: 600, color: '#374151' }}>
                                  {therapist.experience || '5+'} years
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p style={{ 
                            color: '#64748b', 
                            marginBottom: '24px', 
                            lineHeight: 1.6,
                            fontSize: '1rem'
                          }}>
                            {therapist.bio || 'Experienced therapist specializing in mental health and wellness. Committed to providing compassionate care and evidence-based treatments.'}
                          </p>
                          
                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <motion.button
                              whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)' }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleBookAppointment(therapist)}
                              style={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '16px 24px',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                              }}
                            >
                              <FaCalendarAlt />
                              Book Session
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleChatWithTherapist(therapist._id)}
                              style={{
                                flex: 1,
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '16px 24px',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <FaComment />
                              Chat Now
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming and Past Appointments sections remain the same but with enhanced styling */}
            {activeTab === 'upcoming' && (
              <div>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#1e293b', 
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <FaCalendarCheck style={{ color: '#10b981' }} />
                  Upcoming Sessions ({upcomingAppointments.length})
                </h2>
                
                {upcomingAppointments.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ 
                      textAlign: 'center', 
                      padding: '80px', 
                      color: '#64748b',
                      background: 'white',
                      borderRadius: '20px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                    }}
                  >
                    <FaCalendarCheck style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.3rem', marginBottom: '12px' }}>No upcoming sessions</p>
                    <p style={{ fontSize: '1rem', opacity: 0.8 }}>Book your first appointment to get started</p>
                  </motion.div>
                ) : (
                  <div style={{ display: 'grid', gap: '24px' }}>
                    {upcomingAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          background: 'white',
                          borderRadius: '20px',
                          padding: '32px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                          border: '1px solid #e2e8f0',
                          borderLeft: `6px solid ${getStatusColor(appointment.status)}`,
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
                              {appointment.therapist?.name || 'Therapist'}
                            </h3>
                            <p style={{ color: '#667eea', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600 }}>
                              {appointment.therapist?.specialization || 'Therapy Session'}
                            </p>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 16px',
                            borderRadius: '25px',
                            background: `${getStatusColor(appointment.status)}15`,
                            color: getStatusColor(appointment.status),
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                          gap: '20px', 
                          marginBottom: '24px' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                            <FaCalendarAlt style={{ color: '#667eea', fontSize: '1.2rem' }} />
                            <span style={{ fontWeight: 500 }}>{formatDate(appointment.date)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                            <FaClock style={{ color: '#667eea', fontSize: '1.2rem' }} />
                            <span style={{ fontWeight: 500 }}>{formatTime(appointment.time)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                            <FaVideo style={{ color: '#667eea', fontSize: '1.2rem' }} />
                            <span style={{ fontWeight: 500 }}>{appointment.duration} minutes</span>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 8px 0', fontWeight: 600 }}>Notes:</p>
                            <p style={{ 
                              fontSize: '1rem', 
                              color: '#374151', 
                              background: '#f8fafc', 
                              padding: '16px', 
                              borderRadius: '12px',
                              lineHeight: 1.6
                            }}>
                              {appointment.notes}
                            </p>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleChatWithTherapist(appointment.therapist?._id)}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '12px 24px',
                              borderRadius: '10px',
                              fontSize: '1rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <FaComment />
                            Chat with Therapist
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'past' && (
              <div>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#1e293b', 
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <FaHistory style={{ color: '#6b7280' }} />
                  Session History ({pastAppointments.length})
                </h2>
                
                {pastAppointments.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ 
                      textAlign: 'center', 
                      padding: '80px', 
                      color: '#64748b',
                      background: 'white',
                      borderRadius: '20px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                    }}
                  >
                    <FaHistory style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.5 }} />
                    <p style={{ fontSize: '1.3rem', marginBottom: '12px' }}>No session history</p>
                    <p style={{ fontSize: '1rem', opacity: 0.8 }}>Your completed sessions will appear here</p>
                  </motion.div>
                ) : (
                  <div style={{ display: 'grid', gap: '24px' }}>
                    {pastAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          background: 'white',
                          borderRadius: '20px',
                          padding: '32px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                          border: '1px solid #e2e8f0',
                          borderLeft: `6px solid ${getStatusColor(appointment.status)}`,
                          opacity: appointment.status === 'cancelled' ? 0.8 : 1
                        }}
                      >
                        {/* Similar structure to upcoming appointments but with "Continue Chat" for completed sessions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
                              {appointment.therapist?.name || 'Therapist'}
                            </h3>
                            <p style={{ color: '#667eea', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600 }}>
                              {appointment.therapist?.specialization || 'Therapy Session'}
                            </p>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 16px',
                            borderRadius: '25px',
                            background: `${getStatusColor(appointment.status)}15`,
                            color: getStatusColor(appointment.status),
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                          gap: '20px', 
                          marginBottom: '24px' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                            <FaCalendarAlt style={{ color: '#667eea', fontSize: '1.2rem' }} />
                            <span style={{ fontWeight: 500 }}>{formatDate(appointment.date)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                            <FaClock style={{ color: '#667eea', fontSize: '1.2rem' }} />
                            <span style={{ fontWeight: 500 }}>{formatTime(appointment.time)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                            <FaVideo style={{ color: '#667eea', fontSize: '1.2rem' }} />
                            <span style={{ fontWeight: 500 }}>{appointment.duration} minutes</span>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 8px 0', fontWeight: 600 }}>Notes:</p>
                            <p style={{ 
                              fontSize: '1rem', 
                              color: '#374151', 
                              background: '#f8fafc', 
                              padding: '16px', 
                              borderRadius: '12px',
                              lineHeight: 1.6
                            }}>
                              {appointment.notes}
                            </p>
                          </div>
                        )}
                        
                        {appointment.status === 'completed' && (
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleChatWithTherapist(appointment.therapist?._id)}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <FaComment />
                              Continue Chat
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Booking Modal */}
        <AnimatePresence>
          {showBookingModal && selectedTherapist && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(8px)'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '40px',
                  width: '90%',
                  maxWidth: '700px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                  position: 'relative',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                <button
                  onClick={() => setShowBookingModal(false)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaTimes />
                </button>

                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: 700, 
                    color: '#1e293b', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <FaCalendarAlt style={{ color: '#667eea' }} />
                    Book with {selectedTherapist.name}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    {selectedTherapist.specialization || 'Mental Health Therapist'}
                  </p>
                </div>

                <form onSubmit={handleSubmitBooking} style={{ display: 'grid', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        color: '#374151', 
                        marginBottom: '12px' 
                      }}>
                        📅 Date *
                      </label>
                      <input
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        style={{
                          width: '100%',
                          padding: '16px 20px',
                          borderRadius: '12px',
                          border: '2px solid #e5e7eb',
                          fontSize: '1rem',
                          background: '#f8fafc',
                          transition: 'all 0.3s ease'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        color: '#374151', 
                        marginBottom: '12px' 
                      }}>
                        🕐 Time *
                      </label>
                      {loadingTimeSlots ? (
                        <div style={{
                          width: '100%',
                          padding: '16px 20px',
                          borderRadius: '12px',
                          border: '2px solid #e5e7eb',
                          fontSize: '1rem',
                          background: '#f8fafc',
                          textAlign: 'center',
                          color: '#6b7280'
                        }}>
                          Loading time slots...
                        </div>
                      ) : bookingData.date ? (
                        availableTimeSlots.length > 0 ? (
                          <select
                            value={bookingData.time}
                            onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '16px 20px',
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              fontSize: '1rem',
                              background: '#f8fafc',
                              cursor: 'pointer'
                            }}
                            required
                          >
                            <option value="">Select a time slot</option>
                            {availableTimeSlots.map((slot, index) => (
                              <option key={index} value={slot}>{slot}</option>
                            ))}
                          </select>
                        ) : (
                          <div style={{
                            width: '100%',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            fontSize: '1rem',
                            background: '#f8fafc',
                            textAlign: 'center',
                            color: '#6b7280'
                          }}>
                            No available time slots
                          </div>
                        )
                      ) : (
                        <div style={{
                          width: '100%',
                          padding: '16px 20px',
                          borderRadius: '12px',
                          border: '2px solid #e5e7eb',
                          fontSize: '1rem',
                          background: '#f8fafc',
                          textAlign: 'center',
                          color: '#6b7280'
                        }}>
                          Please select a date first
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      color: '#374151', 
                      marginBottom: '12px' 
                    }}>
                      👤 Age *
                    </label>
                    <input
                      type="number"
                      value={bookingData.age}
                      onChange={(e) => setBookingData({ ...bookingData, age: e.target.value })}
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        background: '#f8fafc'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      color: '#374151', 
                      marginBottom: '12px' 
                    }}>
                      💭 What is the problem? *
                    </label>
                    <textarea
                      value={bookingData.problem}
                      onChange={(e) => setBookingData({ ...bookingData, problem: e.target.value })}
                      placeholder="Please describe what you would like to discuss or any concerns you have..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '1rem',
                        background: '#f8fafc',
                        resize: 'vertical',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '32px' }}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowBookingModal(false)}
                      style={{
                        padding: '16px 32px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        background: 'white',
                        color: '#64748b',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.02 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      style={{
                        padding: '16px 32px',
                        borderRadius: '12px',
                        border: 'none',
                        background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: submitting ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {submitting ? 'Booking...' : 'Book Session'}
                      {!submitting && <FaCalendarAlt />}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}