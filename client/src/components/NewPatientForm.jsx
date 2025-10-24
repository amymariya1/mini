import React, { useState } from "react";
import { createPatient } from "../services/api";

const NewPatientForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientAge: "",
    consultationNotes: "",
    medicalHistory: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patientName || !formData.patientEmail || !formData.consultationNotes) {
      setError("Please fill in all required fields (Name, Email, and Consultation Notes)");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await createPatient(formData);
      
      if (response.success) {
        onSubmit(formData);
        onClose();
      } else {
        setError(response.message || "Failed to create patient");
      }
    } catch (err) {
      console.error("Error creating patient:", err);
      setError(err.message || "Failed to create patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>New Patient & Consultation</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1e40af' }}>Patient Information</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label 
                htmlFor="patientName" 
                style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
              >
                Full Name *
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label 
                  htmlFor="patientEmail" 
                  style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="patientEmail"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="patientPhone" 
                  style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="patientPhone"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label 
                htmlFor="patientAge" 
                style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
              >
                Age
              </label>
              <input
                type="number"
                id="patientAge"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleChange}
                min="1"
                max="120"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem'
                  }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1e40af' }}>Consultation Details</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label 
                htmlFor="consultationNotes" 
                style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
              >
                Consultation Notes *
              </label>
              <textarea
                id="consultationNotes"
                name="consultationNotes"
                value={formData.consultationNotes}
                onChange={handleChange}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label 
                htmlFor="medicalHistory" 
                style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
              >
                Medical History
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1e40af' }}>Emergency Contact</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label 
                htmlFor="emergencyContactName" 
                style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
              >
                Full Name
              </label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label 
                  htmlFor="emergencyContactPhone" 
                  style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="emergencyContactRelationship" 
                  style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
                >
                  Relationship
                </label>
                <input
                  type="text"
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Saving..." : "Save Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientForm;