import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  setTherapistAvailability, 
  getTherapistAvailability, 
  createLeave, 
  getLeaves,
  setTentativeAvailability,
  getTentativeAvailability,
  removeTentativeAvailability
} from "../services/api";

export default function TherapistCalendar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateForAvailability, setSelectedDateForAvailability] = useState(null);
  const [availabilityOptions, setAvailabilityOptions] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState('none');
  const [tentativeMode, setTentativeMode] = useState(false);
  const [tentativeReason, setTentativeReason] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});
  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [leaves, setLeaves] = useState([]);

  // Calculate year and month from selectedDate
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

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

  // Fetch therapist leaves
  useEffect(() => {
    async function fetchLeaves() {
      if (!user) return;
      
      try {
        const response = await getLeaves(user.id);
        if (response.success) {
          setLeaves(response.data);
        }
      } catch (error) {
        console.error("Error fetching leaves:", error);
      }
    }
    
    fetchLeaves();
  }, [user]);

  // Fetch availability data for the current month
  useEffect(() => {
    async function fetchMonthAvailability() {
      if (!user) return;
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      try {
        const response = await getTherapistAvailability(user.id, firstDay.toISOString().split('T')[0]);
        // Store availability data for the month
        // This is a simplified version - you might want to fetch for the whole month
      } catch (error) {
        console.error("Error fetching month availability:", error);
      }
    }
    
    fetchMonthAvailability();
  }, [user, year, month]);

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

  // Function to set availability for a date
  const handleSetAvailability = async (availability) => {
    try {
      if (!user || !selectedDateForAvailability) return;
      
      const dateStr = selectedDateForAvailability.toISOString().split('T')[0];
      
      if (tentativeMode) {
        // Set tentative availability
        await setTentativeAvailability(user.id, dateStr, availability, tentativeReason);
        setTentativeMode(false);
        setTentativeReason('');
      } else {
        // Set regular availability
        await setTherapistAvailability(user.id, dateStr, availability);
      }
      
      setCurrentAvailability(availability);
      setAvailabilityOptions(false);
      setSelectedDateForAvailability(null);
    } catch (error) {
      console.error("Error setting availability:", error);
    }
  };

  // All available time slots
  const allTimeSlots = [
    "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00",
    "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
  ];

  // Function to show availability options for a date
  const showAvailabilityOptions = async (date) => {
    // Check if this date is during a leave
    const isLeaveDate = leaves.some(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const currentDate = new Date(date);
      return currentDate >= leaveStart && currentDate <= leaveEnd;
    });
    
    if (isLeaveDate) {
      alert("This date is during a leave period. Please manage your leave if you need to make changes.");
      return;
    }
    
    try {
      setSelectedDateForAvailability(date);
      setAvailabilityOptions(true);
      setSelectedTimeSlots([]);
      
      // Get current availability for this date
      if (user) {
        const dateStr = date.toISOString().split('T')[0];
        
        // First check for tentative availability
        const tentativeResponse = await getTentativeAvailability(user.id, dateStr);
        if (tentativeResponse.success && tentativeResponse.data && tentativeResponse.data.availability) {
          setCurrentAvailability(tentativeResponse.data.availability);
          setTentativeMode(true);
          setTentativeReason(tentativeResponse.data.reason || '');
        } else {
          // If no tentative availability, check regular availability
          const response = await getTherapistAvailability(user.id, dateStr);
          if (response.success && response.data) {
            setCurrentAvailability(response.data.availability || 'none');
          } else {
            setCurrentAvailability('none');
          }
          setTentativeMode(false);
          setTentativeReason('');
        }
      }
    } catch (error) {
      console.error("Error getting availability:", error);
      setCurrentAvailability('none');
      setTentativeMode(false);
      setTentativeReason('');
    }
  };

  // Toggle time slot selection
  const toggleTimeSlot = (slot) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot];
      }
    });
  };

  // Apply selected time slots
  const handleApplyTimeSlots = async () => {
    try {
      if (!user || !selectedDateForAvailability) return;
      
      const dateStr = selectedDateForAvailability.toISOString().split('T')[0];
      
      // Determine availability type based on selected slots
      let availabilityType = 'none';
      if (selectedTimeSlots.length > 0) {
        if (selectedTimeSlots.length === allTimeSlots.length) {
          availabilityType = 'full_day';
        } else if (selectedTimeSlots.every(slot => slot < '13:00')) {
          availabilityType = 'morning';
        } else if (selectedTimeSlots.every(slot => slot >= '13:00')) {
          availabilityType = 'evening';
        } else {
          availabilityType = 'full_day'; // Mixed slots
        }
      }
      
      if (tentativeMode) {
        await setTentativeAvailability(user.id, dateStr, availabilityType, tentativeReason);
        setTentativeMode(false);
        setTentativeReason('');
      } else {
        await setTherapistAvailability(user.id, dateStr, availabilityType);
      }
      
      // Update local availability data
      setAvailabilityData(prev => ({
        ...prev,
        [dateStr]: availabilityType
      }));
      
      setCurrentAvailability(availabilityType);
      setAvailabilityOptions(false);
      setSelectedDateForAvailability(null);
      setSelectedTimeSlots([]);
      
      alert('Availability updated successfully!');
    } catch (error) {
      console.error("Error applying time slots:", error);
      alert('Failed to update availability. Please try again.');
    }
  };

  // Handle leave form changes
  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle leave form submission
  const handleLeaveFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await createLeave(
        user.id,
        leaveForm.startDate,
        leaveForm.endDate,
        leaveForm.reason
      );
      
      if (response.success) {
        // Add the new leave to the state
        setLeaves(prev => [...prev, response.data]);
        
        // Close the modal and reset form
        setShowLeaveModal(false);
        setLeaveForm({
          startDate: "",
          endDate: "",
          reason: ""
        });
        
        alert("Leave created successfully. Affected appointments have been cancelled and users notified.");
      } else {
        alert("Failed to create leave: " + response.message);
      }
    } catch (error) {
      console.error("Error creating leave:", error);
      alert("Failed to create leave. Please try again.");
    }
  };

  // Build month matrix for calendar
  const buildMonthMatrix = (year, month) => {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const startWeekday = firstOfMonth.getDay(); // 0=Sun..6=Sat
    const totalDays = lastOfMonth.getDate();

    const cells = [];
    // Leading blanks
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    // Month days
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    // Trailing blanks to complete grid (42 cells = 6 weeks)
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  // Get availability color for a date
  const getAvailabilityColor = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if this date is during a leave
    const isLeaveDate = leaves.some(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const currentDate = new Date(date);
      return currentDate >= leaveStart && currentDate <= leaveEnd;
    });
    
    if (isLeaveDate) {
      return '#ef4444'; // Red for leave
    }
    
    // Check if availability is set for this date
    const availability = availabilityData[dateStr];
    if (availability) {
      switch (availability) {
        case 'full_day':
          return '#10b981'; // Green for full day
        case 'morning':
          return '#60a5fa'; // Blue for morning
        case 'evening':
          return '#f59e0b'; // Orange for evening
        default:
          return '#e5e7eb'; // Gray for none
      }
    }
    
    return '#e5e7eb';
  };

  const monthName = selectedDate.toLocaleString(undefined, { month: "long", year: "numeric" });
  const cells = buildMonthMatrix(year, month);

  const dayKey = (day) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const prevMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="landing-container">
      <div style={{ padding: "20px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Therapist Calendar</h2>
          <button 
            onClick={() => setShowLeaveModal(true)}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            Add Leave
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={prevMonth} style={{ padding: '5px 10px' }}>◀</button>
          <h3>{monthName}</h3>
          <button onClick={nextMonth} style={{ padding: '5px 10px' }}>▶</button>
        </div>

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '10px', backgroundColor: '#10b981', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '0.9rem' }}>Full Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '10px', backgroundColor: '#60a5fa', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '0.9rem' }}>Morning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '0.9rem' }}>Evening</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '10px', backgroundColor: '#ef4444', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '0.9rem' }}>On Leave</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '0.9rem' }}>Not Set</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ backgroundColor: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
              {day}
            </div>
          ))}
          {cells.map((day, index) => {
            if (day === null) {
              return <div key={index} style={{ backgroundColor: 'white', height: '100px' }}></div>;
            }
            
            const date = new Date(year, month, day);
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <div 
                key={index} 
                onClick={() => showAvailabilityOptions(date)}
                style={{ 
                  backgroundColor: 'white', 
                  height: '100px', 
                  padding: '5px', 
                  border: isToday ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{day}</div>
                <div style={{ 
                  width: '100%', 
                  height: '10px', 
                  backgroundColor: getAvailabilityColor(date),
                  borderRadius: '5px'
                }}></div>
              </div>
            );
          })}
        </div>

        {availabilityOptions && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '10px', 
              width: '400px'
            }}>
              <h3>Set Availability for {selectedDateForAvailability?.toLocaleDateString()}</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={tentativeMode}
                    onChange={(e) => setTentativeMode(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Mark as tentative
                </label>
              </div>
              
              {tentativeMode && (
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Reason for tentative availability:
                    <textarea
                      value={tentativeReason}
                      onChange={(e) => setTentativeReason(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        marginTop: '5px', 
                        borderRadius: '5px', 
                        border: '1px solid #d1d5db' 
                      }}
                      placeholder="Briefly explain why this availability is tentative"
                    />
                  </label>
                </div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Select Available Time Slots:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                  {allTimeSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => toggleTimeSlot(slot)}
                      style={{
                        padding: '12px',
                        backgroundColor: selectedTimeSlots.includes(slot) ? '#10b981' : '#f3f4f6',
                        color: selectedTimeSlots.includes(slot) ? 'white' : '#374151',
                        border: selectedTimeSlots.includes(slot) ? '2px solid #059669' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: selectedTimeSlots.includes(slot) ? '600' : 'normal',
                        transition: 'all 0.2s'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                <button 
                  onClick={() => setSelectedTimeSlots(allTimeSlots)}
                  style={{ 
                    padding: '10px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white',
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Select All (Full Day)
                </button>
                <button 
                  onClick={() => setSelectedTimeSlots([])}
                  style={{ 
                    padding: '10px', 
                    backgroundColor: '#ef4444', 
                    color: 'white',
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' }}>
                <button 
                  onClick={() => {
                    setAvailabilityOptions(false);
                    setSelectedTimeSlots([]);
                  }}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#6b7280', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApplyTimeSlots}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: 1
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {showLeaveModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '10px', 
              width: '400px'
            }}>
              <h3>Add Leave</h3>
              <form onSubmit={handleLeaveFormSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Start Date:
                    <input
                      type="date"
                      name="startDate"
                      value={leaveForm.startDate}
                      onChange={handleLeaveFormChange}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        marginTop: '5px', 
                        borderRadius: '5px', 
                        border: '1px solid #d1d5db' 
                      }}
                      required
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    End Date:
                    <input
                      type="date"
                      name="endDate"
                      value={leaveForm.endDate}
                      onChange={handleLeaveFormChange}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        marginTop: '5px', 
                        borderRadius: '5px', 
                        border: '1px solid #d1d5db' 
                      }}
                      required
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Reason:
                    <textarea
                      name="reason"
                      value={leaveForm.reason}
                      onChange={handleLeaveFormChange}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        marginTop: '5px', 
                        borderRadius: '5px', 
                        border: '1px solid #d1d5db' 
                      }}
                      placeholder="Reason for leave"
                    />
                  </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button 
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#6b7280', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Leave
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}