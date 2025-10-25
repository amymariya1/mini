import React, { useState } from "react";
import { addPatientNote } from "../services/api";

const ConsultationReviewForm = ({ patient, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    content: "",
    date: new Date().toISOString().split('T')[0] // Default to today's date
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
    if (!formData.content || !formData.date) {
      setError("Please fill in all required fields (Review and Date)");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Add the consultation note to the patient
      const noteData = {
        content: `${formData.content} (Session Date: ${formData.date})`
      };
      
      const response = await addPatientNote(patient._id, noteData);
      
      if (response.success) {
        // Call the onSubmit callback with the form data
        await onSubmit({ ...formData, patientId: patient._id });
        onClose();
      } else {
        throw new Error(response.message || "Failed to save consultation review");
      }
    } catch (err) {
      console.error("Error saving consultation review:", err);
      setError(err.message || "Failed to save consultation review. Please try again.");
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
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>Consultation Review</h2>
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

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>
                {patient.user?.name || 'Patient'}
              </h3>
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
            <div style={{ marginBottom: '15px' }}>
              <label 
                htmlFor="content" 
                style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
              >
                Therapy Review *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={5}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Write your therapy review here..."
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label 
                htmlFor="date" 
                style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}
              >
                Session Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
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
              {loading ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationReviewForm;