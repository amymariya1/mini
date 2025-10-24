import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  setTherapistAvailability, 
  getTherapistAvailability
} from "../services/api";

export default function TherapistTimeSlots() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentAvailability, setCurrentAvailability] = useState('none');
  const [showApplyButton, setShowApplyButton] = useState(false);

  useEffect(() => {
    // Try to get user from localStorage
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) {
        const userData = JSON.parse(raw);
        setUser(userData);
        
        // Redirect if not a therapist
        if (userData.userType !== 'therapist') {
          navigate('/');
          return;
        }
      } else {
        // If there's no user, redirect to login
        navigate("/login");
        return;
      }
    } catch (_) {
      // If there's no user, redirect to login
      navigate("/login");
      return;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Load availability when date or user changes
  useEffect(() => {
    const loadAvailability = async () => {
      if (!user || !selectedDate) return;
      
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
      
        // Get current availability for this date
        const response = await getTherapistAvailability(user.id, dateStr);
        if (response.success && response.data) {
          setCurrentAvailability(response.data.availability || 'none');
        } else {
          setCurrentAvailability('none');
        }
      } catch (error) {
        console.error("Error loading availability:", error);
        setCurrentAvailability('none');
      }
    };
    
    loadAvailability();
  }, [user, selectedDate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="landing-container">
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If there's no user, don't render anything (redirecting)
  if (!user) {
    return null;
  }

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
    setShowApplyButton(false);
  };

  // Handle availability change
  const handleAvailabilityChange = (availability) => {
    setCurrentAvailability(availability);
    setShowApplyButton(true);
  };

  // Apply changes
  const handleApply = async () => {
    try {
      if (!user || !selectedDate) return;
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Debug logging
      console.log("Updating availability with:", {
        therapistId: user.id,
        userId: user.id,
        date: dateStr,
        availability: currentAvailability,
        user: user
      });
      
      // Check if we have the required data
      if (!user.id) {
        console.error("Missing therapistId:", user);
        alert("Error: Therapist ID not found. Please refresh the page and try again.");
        return;
      }
      
      if (!dateStr) {
        console.error("Missing date");
        alert("Error: Date not found. Please select a date and try again.");
        return;
      }
      
      if (!currentAvailability) {
        console.error("Missing availability");
        alert("Error: Availability not selected. Please select an availability option and try again.");
        return;
      }
      
      // Set availability
      const response = await setTherapistAvailability(user.id, dateStr, currentAvailability);
      
      if (response.success) {
        alert("Availability updated successfully!");
        setShowApplyButton(false);
      } else {
        alert("Failed to update availability: " + response.message);
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Failed to update availability. Please try again.");
    }
  };

  // Format date for input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="landing-container">
      <div style={{ padding: "20px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Manage Availability</h2>
        </div>

        <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
          <h3>Select Date</h3>
          <input
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #d1d5db',
              width: '100%',
              maxWidth: '300px'
            }}
          />
        </div>

        <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
          <h3>Set Availability</h3>
          <p>Choose your availability for the selected date:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            <button 
              onClick={() => handleAvailabilityChange('full_day')}
              style={{ 
                padding: '15px', 
                backgroundColor: currentAvailability === 'full_day' ? '#3b82f6' : '#e5e7eb', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: currentAvailability === 'full_day' ? 'bold' : 'normal',
                color: currentAvailability === 'full_day' ? 'white' : 'black'
              }}
            >
              Full Day (9 AM - 5 PM)
            </button>
            <button 
              onClick={() => handleAvailabilityChange('morning')}
              style={{ 
                padding: '15px', 
                backgroundColor: currentAvailability === 'morning' ? '#60a5fa' : '#e5e7eb', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: currentAvailability === 'morning' ? 'bold' : 'normal',
                color: currentAvailability === 'morning' ? 'white' : 'black'
              }}
            >
              Morning Only (9 AM - 12 PM)
            </button>
            <button 
              onClick={() => handleAvailabilityChange('evening')}
              style={{ 
                padding: '15px', 
                backgroundColor: currentAvailability === 'evening' ? '#93c5fd' : '#e5e7eb', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: currentAvailability === 'evening' ? 'bold' : 'normal',
                color: currentAvailability === 'evening' ? 'white' : 'black'
              }}
            >
              Evening Only (1 PM - 5 PM)
            </button>
            <button 
              onClick={() => handleAvailabilityChange('none')}
              style={{ 
                padding: '15px', 
                backgroundColor: currentAvailability === 'none' ? '#ef4444' : '#e5e7eb', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: currentAvailability === 'none' ? 'bold' : 'normal',
                color: currentAvailability === 'none' ? 'white' : 'black'
              }}
            >
              No Availability
            </button>
          </div>
        </div>

        {showApplyButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApply}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Apply Changes
          </motion.button>
        )}
      </div>
    </div>
  );
}