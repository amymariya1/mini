import React, { useState, useEffect } from "react";
import { getPatient } from "../services/api";

const ConsultationHistory = ({ patient, onClose }) => {
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadConsultationHistory();
  }, [patient._id]);

  const loadConsultationHistory = async () => {
    try {
      setLoading(true);
      const response = await getPatient(patient._id);
      
      if (response.success) {
        // Sort notes by creation date (newest first)
        const sortedNotes = response.data.notes.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setConsultationHistory(sortedNotes);
      } else {
        throw new Error(response.message || "Failed to load consultation history");
      }
    } catch (err) {
      console.error("Error loading consultation history:", err);
      setError(err.message || "Failed to load consultation history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to extract date from note content if it contains session date info
  const extractSessionDate = (content) => {
    const dateMatch = content.match(/\(Session Date: (\d{4}-\d{2}-\d{2})\)/);
    return dateMatch ? dateMatch[1] : null;
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
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>Consultation History</h2>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading consultation history...
          </div>
        ) : consultationHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p>No consultation history found for this patient.</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              Add consultation reviews using the "Consultation Review" button.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {consultationHistory.map((note, index) => {
              // Extract session date if available in the note content
              const sessionDate = extractSessionDate(note.content);
              // If no session date in content, use the note creation date
              const displayDate = sessionDate || note.createdAt;
              
              return (
                <div 
                  key={note._id || index}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#f8fafc'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '12px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>📝</span>
                      <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                        {new Date(displayDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#64748b',
                      background: '#e2e8f0',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      #{consultationHistory.length - index}
                    </span>
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: 'white', 
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      color: '#374151', 
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {sessionDate 
                        ? note.content.replace(` (Session Date: ${sessionDate})`, '') 
                        : note.content}
                    </p>
                  </div>
                  
                  <div style={{ 
                    marginTop: '12px', 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    fontSize: '0.8rem',
                    color: '#94a3b8'
                  }}>
                    Added: {new Date(note.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationHistory;