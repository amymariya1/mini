import React, { useState, useEffect } from "react";
import { getUpcomingPatients, updateUpcomingPatient, deleteUpcomingPatient } from "../services/api";

const UpcomingPatientsList = ({ therapistId }) => {
  const [upcomingPatients, setUpcomingPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadUpcomingPatients();
  }, [therapistId]);

  const loadUpcomingPatients = async () => {
    try {
      setLoading(true);
      const response = await getUpcomingPatients();
      
      if (response.success) {
        setUpcomingPatients(response.data);
      } else {
        throw new Error(response.message || "Failed to load upcoming patients");
      }
    } catch (err) {
      console.error("Error loading upcoming patients:", err);
      setError(err.message || "Failed to load upcoming patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient._id);
    setEditForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone || "",
      age: patient.age || "",
      observation: patient.observation || "",
      appointmentDate: patient.appointmentDate ? 
        new Date(patient.appointmentDate).toISOString().slice(0, 16) : "",
      status: patient.status || "scheduled"
    });
  };

  const handleSaveEdit = async (patientId) => {
    try {
      const updateData = {
        ...editForm,
        age: editForm.age ? parseInt(editForm.age) : undefined
      };
      
      const response = await updateUpcomingPatient(patientId, updateData);
      
      if (response.success) {
        // Update the patient in the list
        const updatedPatients = upcomingPatients.map(patient => 
          patient._id === patientId ? response.data : patient
        );
        setUpcomingPatients(updatedPatients);
        setEditingPatient(null);
        setEditForm({});
      } else {
        throw new Error(response.message || "Failed to update patient");
      }
    } catch (err) {
      console.error("Error updating patient:", err);
      alert(err.message || "Failed to update patient. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingPatient(null);
    setEditForm({});
  };

  const handleDelete = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this upcoming patient?")) {
      return;
    }
    
    try {
      const response = await deleteUpcomingPatient(patientId);
      
      if (response.success) {
        // Remove the patient from the list
        const updatedPatients = upcomingPatients.filter(patient => 
          patient._id !== patientId
        );
        setUpcomingPatients(updatedPatients);
      } else {
        throw new Error(response.message || "Failed to delete patient");
      }
    } catch (err) {
      console.error("Error deleting patient:", err);
      alert(err.message || "Failed to delete patient. Please try again.");
    }
  };

  const handleStatusChange = async (patientId, newStatus) => {
    try {
      const response = await updateUpcomingPatient(patientId, { status: newStatus });
      
      if (response.success) {
        // Update the patient in the list
        const updatedPatients = upcomingPatients.map(patient => 
          patient._id === patientId ? response.data : patient
        );
        setUpcomingPatients(updatedPatients);
      } else {
        throw new Error(response.message || "Failed to update patient status");
      }
    } catch (err) {
      console.error("Error updating patient status:", err);
      alert(err.message || "Failed to update patient status. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'confirmed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'completed': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        Loading upcoming patients...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        padding: '20px',
        borderRadius: '6px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  if (upcomingPatients.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <p>No upcoming patients found.</p>
        <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
          Add upcoming patients using the "Add Upcoming Patient" button.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {upcomingPatients.map((patient) => (
        <div
          key={patient._id}
          style={{
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#f8fafc'
          }}
        >
          {editingPatient === patient._id ? (
            // Edit mode
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                    <div>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '5px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#1e3a8a'
                        }}
                      />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '3px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          color: '#64748b',
                          marginTop: '4px'
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: getStatusColor(editForm.status),
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}
                >
                  {editForm.status}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📞</span>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      style={{
                        padding: '3px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        color: '#3b82f6'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📅</span>
                    <input
                      type="datetime-local"
                      value={editForm.appointmentDate}
                      onChange={(e) => setEditForm({...editForm, appointmentDate: e.target.value})}
                      style={{
                        padding: '3px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        color: '#1e3a8a'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👤</span>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                      min="1"
                      max="120"
                      style={{
                        padding: '3px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        color: '#1e3a8a',
                        width: '60px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      style={{
                        padding: '3px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        color: getStatusColor(editForm.status),
                        background: 'white'
                      }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label 
                  style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}
                >
                  Observation:
                </label>
                <textarea
                  value={editForm.observation}
                  onChange={(e) => setEditForm({...editForm, observation: e.target.value})}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '10px',
                marginTop: '16px'
              }}>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(patient._id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#10b981',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>
                        {patient.name}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        {patient.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: getStatusColor(patient.status),
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}
                >
                  {patient.status}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📞</span>
                    <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                      {patient.phone || 'Not provided'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📅</span>
                    <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                      {new Date(patient.appointmentDate).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.2rem' }}>👤</span>
                    <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                      {patient.age ? `Age: ${patient.age}` : 'Age not provided'}
                    </span>
                  </div>
                </div>
              </div>
              
              {patient.observation && (
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
                      <strong style={{ color: '#374151', fontSize: '0.9rem' }}>Observation:</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {patient.observation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '10px',
                marginTop: '16px'
              }}>
                <button
                  onClick={() => handleStatusChange(patient._id, 
                    patient.status === 'scheduled' ? 'confirmed' : 
                    patient.status === 'confirmed' ? 'completed' : 'scheduled')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #10b981',
                    background: 'white',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  {patient.status === 'scheduled' ? 'Confirm' : 
                   patient.status === 'confirmed' ? 'Complete' : 'Reschedule'}
                </button>
                <button
                  onClick={() => handleEdit(patient)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #3b82f6',
                    background: 'white',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(patient._id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ef4444',
                    background: 'white',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UpcomingPatientsList;