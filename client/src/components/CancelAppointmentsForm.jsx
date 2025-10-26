import React, { useState } from "react";
import { FaCalendarAlt, FaClock, FaUser, FaSun, FaMoon, FaBusinessTime } from 'react-icons/fa';
import { cancelAppointmentsByCriteria } from '../services/api';

const CancelAppointmentsForm = ({ therapistId, appointments, onCancel, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAppointments, setSelectedAppointments] = useState([]);

  // Get unique dates from appointments with appointment details
  const getAppointmentsByDate = () => {
    const dateMap = {};
    appointments.forEach(apt => {
      const dateKey = new Date(apt.date).toISOString().split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = [];
      }
      dateMap[dateKey].push(apt);
    });
    return dateMap;
  };

  const appointmentsByDate = getAppointmentsByDate();

  // Calendar functions
  const buildMonthMatrix = (year, month) => {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const startWeekday = firstOfMonth.getDay();
    const totalDays = lastOfMonth.getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateSelect = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedAppointments(appointmentsByDate[dateStr] || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter appointments based on selected date and availability type
      let appointmentsToCancel = selectedAppointments;

      if (selectedAvailability) {
        appointmentsToCancel = appointmentsToCancel.filter(apt => 
          apt.availabilityType === selectedAvailability
        );
      }

      if (appointmentsToCancel.length === 0) {
        alert("No appointments match the selected criteria.");
        return;
      }

      // Confirm with user
      const availabilityText = selectedAvailability === 'full_day' ? 'Full Day' : 
                              selectedAvailability === 'morning' ? 'Morning' : 
                              selectedAvailability === 'evening' ? 'Evening' : 'all';
      
      const confirmMessage = `Are you sure you want to cancel ${appointmentsToCancel.length} appointment(s) for ${new Date(selectedDate).toLocaleDateString()} (${availabilityText})? This action cannot be undone and cancellation emails will be sent to patients.`;
      if (!window.confirm(confirmMessage)) {
        return;
      }

      // Call the API to cancel appointments by criteria
      const criteria = {
        date: selectedDate,
        availabilityType: selectedAvailability || undefined
      };

      const response = await cancelAppointmentsByCriteria(criteria);
      
      if (response.success) {
        alert(response.message);
        // Call the onCancel function to refresh the appointments list
        await onCancel();
        onClose();
      } else {
        throw new Error(response.message || "Failed to cancel appointments");
      }
    } catch (error) {
      console.error("Error cancelling appointments:", error);
      alert("Failed to cancel appointments. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar rendering
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString(undefined, { month: "long", year: "numeric" });
  const cells = buildMonthMatrix(year, month);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.5rem' }}>Cancel Appointments</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Calendar Section */}
            <div>
              <div style={{ 
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '20px' 
                }}>
                  <button
                    onClick={() => navigateMonth(-1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '8px'
                    }}
                  >
                    ←
                  </button>
                  <h4 style={{ margin: 0, color: '#1e3a8a' }}>{monthName}</h4>
                  <button
                    onClick={() => navigateMonth(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '8px'
                    }}
                  >
                    →
                  </button>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  {weekdays.map(day => (
                    <div 
                      key={day} 
                      style={{ 
                        textAlign: 'center', 
                        padding: '8px 0',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: '#64748b'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '4px'
                }}>
                  {cells.map((day, index) => {
                    if (day === null) {
                      return <div key={index} style={{ padding: '10px 0' }}></div>;
                    }
                    
                    const date = new Date(year, month, day);
                    const dateStr = date.toISOString().split('T')[0];
                    const hasAppointments = appointmentsByDate[dateStr] && appointmentsByDate[dateStr].length > 0;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        style={{
                          padding: '10px 0',
                          border: 'none',
                          background: selectedDate === dateStr ? '#3b82f6' : 
                                   hasAppointments ? '#dbeafe' : 'transparent',
                          color: selectedDate === dateStr ? 'white' : 
                                 hasAppointments ? '#1e3a8a' : '#64748b',
                          borderRadius: '6px',
                          cursor: hasAppointments ? 'pointer' : 'default',
                          fontWeight: hasAppointments ? '600' : 'normal',
                          position: 'relative'
                        }}
                        disabled={!hasAppointments}
                      >
                        {day}
                        {hasAppointments && (
                          <span style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%'
                          }}></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instructions */}
              <div style={{ 
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.85rem', 
                  color: '#1e40af',
                  textAlign: 'center'
                }}>
                  <strong>Instructions:</strong> Click on any date with a blue dot to select it. 
                  Only dates with appointments are selectable.
                </p>
              </div>

              {selectedDate && (
                <div style={{ 
                  marginTop: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>
                    Appointments on {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedAppointments.map((apt, index) => (
                      <div 
                        key={index}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          background: 'white'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <FaClock style={{ color: '#3b82f6' }} />
                              <span style={{ fontWeight: '600' }}>{apt.timeSlot}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaUser style={{ color: '#10b981' }} />
                              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                {apt.userId?.name || 'Patient'}
                              </span>
                            </div>
                          </div>
                          <div style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: '#10b981',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {apt.availabilityType === 'full_day' ? 'Full Day' : 
                             apt.availabilityType === 'morning' ? 'Morning' : 
                             apt.availabilityType === 'evening' ? 'Evening' : 'Scheduled'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Section */}
            <div>
              <form onSubmit={handleSubmit}>
                {selectedDate ? (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '12px', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        <FaBusinessTime style={{ marginRight: '8px' }} />
                        Select Availability Type to Cancel
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedAvailability === 'full_day' ? '#dbeafe' : 'white'
                        }}>
                          <input
                            type="radio"
                            name="availability"
                            value="full_day"
                            checked={selectedAvailability === 'full_day'}
                            onChange={(e) => setSelectedAvailability(e.target.value)}
                            style={{ marginRight: '10px' }}
                          />
                          <FaSun style={{ color: '#f59e0b', marginRight: '8px' }} />
                          <span>Full Day Appointments</span>
                        </label>
                        
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedAvailability === 'morning' ? '#dbeafe' : 'white'
                        }}>
                          <input
                            type="radio"
                            name="availability"
                            value="morning"
                            checked={selectedAvailability === 'morning'}
                            onChange={(e) => setSelectedAvailability(e.target.value)}
                            style={{ marginRight: '10px' }}
                          />
                          <FaSun style={{ color: '#f59e0b', marginRight: '8px' }} />
                          <span>Morning Appointments</span>
                        </label>
                        
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedAvailability === 'evening' ? '#dbeafe' : 'white'
                        }}>
                          <input
                            type="radio"
                            name="availability"
                            value="evening"
                            checked={selectedAvailability === 'evening'}
                            onChange={(e) => setSelectedAvailability(e.target.value)}
                            style={{ marginRight: '10px' }}
                          />
                          <FaMoon style={{ color: '#6366f1', marginRight: '8px' }} />
                          <span>Evening Appointments</span>
                        </label>
                        
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: selectedAvailability === '' ? '#dbeafe' : 'white'
                        }}>
                          <input
                            type="radio"
                            name="availability"
                            value=""
                            checked={selectedAvailability === ''}
                            onChange={(e) => setSelectedAvailability(e.target.value)}
                            style={{ marginRight: '10px' }}
                          />
                          <FaBusinessTime style={{ color: '#10b981', marginRight: '8px' }} />
                          <span>All Appointments on this Date</span>
                        </label>
                      </div>
                    </div>

                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#f0f9ff', 
                      borderRadius: '8px', 
                      marginBottom: '20px' 
                    }}>
                      <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem' }}>
                        <strong>{selectedAppointments.filter(apt => 
                          selectedAvailability ? apt.availabilityType === selectedAvailability : true
                        ).length}</strong> appointment(s) will be cancelled for{' '}
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {selectedAvailability && (
                          <span> ({selectedAvailability === 'full_day' ? 'Full Day' : 
                                  selectedAvailability === 'morning' ? 'Morning' : 'Evening'})
                          </span>
                        )}
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    border: '1px dashed #d1d5db'
                  }}>
                    <FaCalendarAlt style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '15px' }} />
                    <p style={{ margin: '0 0 15px 0', color: '#64748b' }}>
                      Please select a date with appointments from the calendar
                    </p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                      Only dates with appointments (marked with blue dots) are selectable
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      background: 'white',
                      color: '#374151',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '1rem'
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedDate || isSubmitting}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '1px solid #ef4444',
                      background: '#ef4444',
                      color: 'white',
                      cursor: selectedDate ? 'pointer' : 'not-allowed',
                      fontWeight: '500',
                      fontSize: '1rem',
                      opacity: selectedDate ? 1 : 0.5
                    }}
                  >
                    {isSubmitting ? 'Cancelling...' : 'Cancel Appointments'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointmentsForm;