import React, { useState } from "react";
import { FaCalendarAlt, FaClock, FaUser, FaSun, FaMoon, FaBusinessTime, FaTrash, FaRedo } from 'react-icons/fa';
import { cancelAppointmentsByCriteria } from '../services/api';

const CancelAppointmentsForm = ({ therapistId, appointments, onCancel, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]); // For individual time slot selection
  const [shouldReschedule, setShouldReschedule] = useState(false); // New state for rescheduling option

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateKey = (dateKey) => {
    if (!dateKey) {
      return new Date(NaN);
    }
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const extractDateKey = (value) => {
    if (!value) {
      return '';
    }
    if (value instanceof Date) {
      return formatDateKey(value);
    }
    if (typeof value === 'string') {
      const [datePart] = value.split('T');
      if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart;
      }
      return formatDateKey(new Date(value));
    }
    return '';
  };

  const getAppointmentsByDate = () => {
    const dateMap = {};
    appointments.forEach(apt => {
      const dateKey = extractDateKey(apt.date);
      if (!dateKey) {
        return;
      }
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

  const handleDateSelect = (day) => {
    if (!day) return;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = formatDateKey(date);
    setSelectedDate(dateStr);
    setSelectedAppointments(appointmentsByDate[dateStr] || []);
    setSelectedAvailability('');
    setSelectedTimeSlots([]); // Reset time slot selection
  };

  // Handle individual time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(timeSlot)) {
        return prev.filter(slot => slot !== timeSlot);
      } else {
        return [...prev, timeSlot];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let appointmentsToCancel = [];

      // If specific time slots are selected, filter by those
      if (selectedTimeSlots.length > 0) {
        appointmentsToCancel = selectedAppointments.filter(apt => 
          selectedTimeSlots.includes(apt.timeSlot)
        );
      } 
      // If availability type is selected, filter by that
      else if (selectedAvailability) {
        appointmentsToCancel = selectedAppointments.filter(apt => 
          apt.availabilityType === selectedAvailability
        );
      } 
      // Otherwise, cancel all appointments for the date
      else {
        appointmentsToCancel = selectedAppointments;
      }

      // Check if there are appointments to cancel
      if (appointmentsToCancel.length === 0) {
        // If no appointments match criteria, check if any appointments exist for the date
        if (selectedAppointments.length === 0) {
          // No appointments for this date at all
          alert("There are no appointments scheduled for the selected date.");
          return;
        } else {
          // Appointments exist but none match the selected criteria
          alert("No appointments match the selected criteria for this date.");
          return;
        }
      }

      // Confirm with user
      let confirmMessage = "";
      if (selectedTimeSlots.length > 0) {
        confirmMessage = `Are you sure you want to ${shouldReschedule ? 'reschedule' : 'cancel'} ${appointmentsToCancel.length} appointment(s) for the selected time slots on ${parseDateKey(selectedDate).toLocaleDateString()}? ${shouldReschedule ? 'The appointments will be moved to the next available slot and patients will be notified.' : 'This action cannot be undone and cancellation emails will be sent to patients.'}`;
      } else if (selectedAvailability) {
        const availabilityText = selectedAvailability === 'full_day' ? 'Full Day' : 
                                selectedAvailability === 'morning' ? 'Morning' : 
                                selectedAvailability === 'evening' ? 'Evening' : 'all';
        confirmMessage = `Are you sure you want to ${shouldReschedule ? 'reschedule' : 'cancel'} ${appointmentsToCancel.length} appointment(s) for ${parseDateKey(selectedDate).toLocaleDateString()} (${availabilityText})? ${shouldReschedule ? 'The appointments will be moved to the next available slot and patients will be notified.' : 'This action cannot be undone and cancellation emails will be sent to patients.'}`;
      } else {
        confirmMessage = `Are you sure you want to ${shouldReschedule ? 'reschedule' : 'cancel'} all ${appointmentsToCancel.length} appointment(s) for ${parseDateKey(selectedDate).toLocaleDateString()}? ${shouldReschedule ? 'The appointments will be moved to the next available slot and patients will be notified.' : 'This action cannot be undone and cancellation emails will be sent to patients.'}`;
      }

      if (!window.confirm(confirmMessage)) {
        return;
      }

      // Call the API to cancel appointments by criteria
      const criteria = {
        date: selectedDate,
        availabilityType: selectedAvailability || undefined,
        timeSlots: selectedTimeSlots.length > 0 ? selectedTimeSlots : undefined,
        reason: "Cancelled by therapist",
        shouldReschedule: shouldReschedule
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
      alert(`Failed to ${shouldReschedule ? 'reschedule' : 'cancel'} appointments. Please try again. Error: ${error.message}`);
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

  // Group appointments by availability type and status
  const groupAppointmentsByAvailability = () => {
    const grouped = {
      morning: [],
      evening: [],
      full_day: [],
      scheduled: []
    };

    selectedAppointments.forEach(apt => {
      // Show both scheduled and rescheduled appointments for cancellation/rescheduling
      if (apt.status === 'scheduled' || apt.status === 'rescheduled') {
        switch (apt.availabilityType) {
          case 'morning':
            grouped.morning.push(apt);
            break;
          case 'evening':
            grouped.evening.push(apt);
            break;
          case 'full_day':
            grouped.full_day.push(apt);
            break;
          default:
            grouped.scheduled.push(apt);
        }
      }
    });

    return grouped;
  };

  const groupedAppointments = groupAppointmentsByAvailability();

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
        maxWidth: '1000px',
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
                    
                    const dateStr = formatDateKey(new Date(year, month, day));
                    const hasAppointments = appointmentsByDate[dateStr] && appointmentsByDate[dateStr].length > 0;
                    const isSelected = selectedDate === dateStr;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(day)}
                        style={{
                          padding: '10px 0',
                          border: 'none',
                          background: isSelected ? '#3b82f6' : 
                                   hasAppointments ? '#dbeafe' : 'transparent',
                          color: isSelected ? 'white' : 
                                 hasAppointments ? '#1e3a8a' : '#64748b',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: hasAppointments ? '600' : 'normal',
                          position: 'relative'
                        }}
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
                  <strong>Instructions:</strong> Click on any date to select it. 
                  Dates with appointments are highlighted with a blue dot.
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
                    Appointments on {parseDateKey(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  
                  {selectedAppointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {/* Show warning if there are rescheduled appointments */}
                      {selectedAppointments.some(apt => apt.status === 'rescheduled') && (
                        <div style={{ 
                          padding: '12px', 
                          backgroundColor: '#fffbeb', 
                          borderRadius: '8px', 
                          border: '1px solid #f59e0b',
                          marginBottom: '15px'
                        }}>
                          <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
                            <strong>Note:</strong> Some appointments on this date have already been rescheduled. You can cancel or reschedule them again if needed.
                          </p>
                        </div>
                      )}
                      
                      {/* Morning Appointments */}
                      {groupedAppointments.morning.length > 0 && (
                        <div style={{ 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px',
                          background: 'white'
                        }}>
                          <div style={{ 
                            padding: '10px 15px',
                            borderBottom: '1px solid #d1d5db',
                            background: '#fffbeb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FaSun style={{ color: '#f59e0b' }} />
                            <span style={{ fontWeight: '600', color: '#92400e' }}>Morning Appointments</span>
                          </div>
                          <div style={{ padding: '10px' }}>
                            {groupedAppointments.morning.map((apt, index) => (
                              <div 
                                key={index}
                                onClick={() => handleTimeSlotSelect(apt.timeSlot)}
                                style={{
                                  padding: '8px',
                                  borderRadius: '6px',
                                  border: selectedTimeSlots.includes(apt.timeSlot) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  background: selectedTimeSlots.includes(apt.timeSlot) ? '#dbeafe' : 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '5px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FaClock style={{ color: '#3b82f6' }} />
                                  <span style={{ fontWeight: '500' }}>{apt.timeSlot}</span>
                                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {apt.userId?.name || 'Patient'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {selectedTimeSlots.includes(apt.timeSlot) && (
                                    <span style={{ 
                                      fontSize: '0.7rem', 
                                      background: '#3b82f6', 
                                      color: 'white', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px' 
                                    }}>
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evening Appointments */}
                      {groupedAppointments.evening.length > 0 && (
                        <div style={{ 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px',
                          background: 'white'
                        }}>
                          <div style={{ 
                            padding: '10px 15px',
                            borderBottom: '1px solid #d1d5db',
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FaMoon style={{ color: '#0ea5e9' }} />
                            <span style={{ fontWeight: '600', color: '#0c4a6e' }}>Evening Appointments</span>
                          </div>
                          <div style={{ padding: '10px' }}>
                            {groupedAppointments.evening.map((apt, index) => (
                              <div 
                                key={index}
                                onClick={() => handleTimeSlotSelect(apt.timeSlot)}
                                style={{
                                  padding: '8px',
                                  borderRadius: '6px',
                                  border: selectedTimeSlots.includes(apt.timeSlot) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  background: selectedTimeSlots.includes(apt.timeSlot) ? '#dbeafe' : 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '5px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FaClock style={{ color: '#3b82f6' }} />
                                  <span style={{ fontWeight: '500' }}>{apt.timeSlot}</span>
                                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {apt.userId?.name || 'Patient'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {selectedTimeSlots.includes(apt.timeSlot) && (
                                    <span style={{ 
                                      fontSize: '0.7rem', 
                                      background: '#3b82f6', 
                                      color: 'white', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px' 
                                    }}>
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full Day Appointments */}
                      {groupedAppointments.full_day.length > 0 && (
                        <div style={{ 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px',
                          background: 'white'
                        }}>
                          <div style={{ 
                            padding: '10px 15px',
                            borderBottom: '1px solid #d1d5db',
                            background: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FaBusinessTime style={{ color: '#22c55e' }} />
                            <span style={{ fontWeight: '600', color: '#14532d' }}>Full Day Appointments</span>
                          </div>
                          <div style={{ padding: '10px' }}>
                            {groupedAppointments.full_day.map((apt, index) => (
                              <div 
                                key={index}
                                onClick={() => handleTimeSlotSelect(apt.timeSlot)}
                                style={{
                                  padding: '8px',
                                  borderRadius: '6px',
                                  border: selectedTimeSlots.includes(apt.timeSlot) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  background: selectedTimeSlots.includes(apt.timeSlot) ? '#dbeafe' : 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '5px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FaClock style={{ color: '#3b82f6' }} />
                                  <span style={{ fontWeight: '500' }}>{apt.timeSlot}</span>
                                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {apt.userId?.name || 'Patient'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {selectedTimeSlots.includes(apt.timeSlot) && (
                                    <span style={{ 
                                      fontSize: '0.7rem', 
                                      background: '#3b82f6', 
                                      color: 'white', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px' 
                                    }}>
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Scheduled Appointments */}
                      {groupedAppointments.scheduled.length > 0 && (
                        <div style={{ 
                          border: '1px solid #d1d5db', 
                          borderRadius: '8px',
                          background: 'white'
                        }}>
                          <div style={{ 
                            padding: '10px 15px',
                            borderBottom: '1px solid #d1d5db',
                            background: '#f3e8ff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FaClock style={{ color: '#a855f7' }} />
                            <span style={{ fontWeight: '600', color: '#581c87' }}>Scheduled Appointments</span>
                          </div>
                          <div style={{ padding: '10px' }}>
                            {groupedAppointments.scheduled.map((apt, index) => (
                              <div 
                                key={index}
                                onClick={() => handleTimeSlotSelect(apt.timeSlot)}
                                style={{
                                  padding: '8px',
                                  borderRadius: '6px',
                                  border: selectedTimeSlots.includes(apt.timeSlot) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                  background: selectedTimeSlots.includes(apt.timeSlot) ? '#dbeafe' : 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '5px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FaClock style={{ color: '#3b82f6' }} />
                                  <span style={{ fontWeight: '500' }}>{apt.timeSlot}</span>
                                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {apt.userId?.name || 'Patient'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {selectedTimeSlots.includes(apt.timeSlot) && (
                                    <span style={{ 
                                      fontSize: '0.7rem', 
                                      background: '#3b82f6', 
                                      color: 'white', 
                                      padding: '2px 6px', 
                                      borderRadius: '4px' 
                                    }}>
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '20px', 
                      backgroundColor: '#fffbeb', 
                      borderRadius: '8px',
                      border: '1px dashed #f59e0b'
                    }}>
                      <p style={{ margin: 0, color: '#92400e' }}>
                        No appointments scheduled for this date.
                      </p>
                    </div>
                  )}
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
                            onChange={(e) => {
                              setSelectedAvailability(e.target.value);
                              setSelectedTimeSlots([]); // Reset time slot selection
                            }}
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
                            onChange={(e) => {
                              setSelectedAvailability(e.target.value);
                              setSelectedTimeSlots([]); // Reset time slot selection
                            }}
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
                            onChange={(e) => {
                              setSelectedAvailability(e.target.value);
                              setSelectedTimeSlots([]); // Reset time slot selection
                            }}
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
                            onChange={(e) => {
                              setSelectedAvailability(e.target.value);
                              setSelectedTimeSlots([]); // Reset time slot selection
                            }}
                            style={{ marginRight: '10px' }}
                          />
                          <FaBusinessTime style={{ color: '#10b981', marginRight: '8px' }} />
                          <span>All Appointments on this Date</span>
                        </label>
                      </div>
                    </div>

                    {/* Rescheduling Option */}
                    <div style={{ 
                      marginBottom: '20px',
                      padding: '15px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={shouldReschedule}
                          onChange={(e) => setShouldReschedule(e.target.checked)}
                          style={{ marginRight: '10px' }}
                        />
                        <FaRedo style={{ color: '#0ea5e9', marginRight: '8px' }} />
                        <span style={{ fontWeight: '500', color: '#0c4a6e' }}>
                          Automatically reschedule to next available slot
                        </span>
                      </label>
                      <p style={{ 
                        margin: '8px 0 0 28px', 
                        fontSize: '0.85rem', 
                        color: '#0c4a6e' 
                      }}>
                        {shouldReschedule 
                          ? "Appointments will be moved to the next available slot and patients will be notified via email." 
                          : "Check this box to automatically reschedule appointments to the next available slot instead of cancelling them."}
                      </p>
                    </div>

                    {/* Individual Time Slot Selection Info */}
                    {selectedTimeSlots.length > 0 && (
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#eff6ff', 
                        borderRadius: '8px', 
                        marginBottom: '15px',
                        border: '1px solid #93c5fd'
                      }}>
                        <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem' }}>
                          <strong>{selectedTimeSlots.length}</strong> individual time slot(s) selected for {shouldReschedule ? 'rescheduling' : 'cancellation'}.
                          These will be processed instead of the availability type selection above.
                        </p>
                      </div>
                    )}

                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#f0f9ff', 
                      borderRadius: '8px', 
                      marginBottom: '20px' 
                    }}>
                      <p style={{ margin: 0, color: '#0369a1', fontSize: '0.9rem' }}>
                        {selectedAppointments.length > 0 ? (
                          <>
                            {selectedTimeSlots.length > 0 ? (
                              <>
                                <strong>{selectedTimeSlots.length}</strong> time slot(s) will be {shouldReschedule ? 'rescheduled' : 'cancelled'} for{' '}
                                {parseDateKey(selectedDate).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </>
                            ) : selectedAvailability ? (
                              <>
                                <strong>{selectedAppointments.filter(apt => 
                                  selectedAvailability ? apt.availabilityType === selectedAvailability : true
                                ).length}</strong> appointment(s) will be {shouldReschedule ? 'rescheduled' : 'cancelled'} for{' '}
                                {parseDateKey(selectedDate).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                                <span> ({selectedAvailability === 'full_day' ? 'Full Day' : 
                                        selectedAvailability === 'morning' ? 'Morning' : 'Evening'})
                                </span>
                              </>
                            ) : (
                              <>
                                <strong>{selectedAppointments.length}</strong> appointment(s) will be {shouldReschedule ? 'rescheduled' : 'cancelled'} for{' '}
                                {parseDateKey(selectedDate).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </>
                            )}
                          </>
                        ) : (
                          <>No appointments scheduled for {parseDateKey(selectedDate).toLocaleDateString()}.</>
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
                      Please select a date from the calendar
                    </p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                      You can select any date, even those without appointments
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
                    {isSubmitting ? (shouldReschedule ? 'Rescheduling...' : 'Cancelling...') : (shouldReschedule ? 'Reschedule Appointments' : 'Cancel Appointments')}
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