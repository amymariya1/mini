import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { listTherapists } from "../services/api";

export default function BookTherapist() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTherapists() {
      try {
        setLoading(true);
        const response = await listTherapists();
        setTherapists(response.therapists || []);
      } catch (err) {
        console.error("Error fetching therapists:", err);
        setError("Failed to load therapists. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchTherapists();
  }, []);

  const handleBookAppointment = (therapistId) => {
    navigate(`/book-appointment/${therapistId}`);
  };

  const handleChatWithTherapist = (therapistId) => {
    navigate(`/patient-chat/${therapistId}`);
  };

  return (
    <div className="landing-container">
      <Navbar />
      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 18px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Find a Therapist</h2>
        </div>

        {error && (
          <div className="alert error" style={{ marginBottom: 24, padding: 16, borderRadius: 8 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p>Loading therapists...</p>
          </div>
        ) : (
          <div>
            {therapists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p>No therapists available at the moment.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {therapists.map((therapist) => (
                  <div key={therapist._id} className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 8 }}>{therapist.name}</h3>
                    <p style={{ marginBottom: 16, color: '#6b7280' }}>
                      <strong>License:</strong> {therapist.license}
                    </p>
                    <p style={{ marginBottom: 16, color: '#6b7280' }}>
                      <strong>Age:</strong> {therapist.age}
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleBookAppointment(therapist._id)}
                        className="cta-btn"
                        style={{ 
                          flex: 1,
                          background: '#4f46e5', 
                          color: 'white', 
                          border: 'none', 
                          padding: '12px 24px', 
                          borderRadius: 8, 
                          fontSize: 16,
                          cursor: 'pointer'
                        }}
                      >
                        Book Appointment
                      </button>
                      <button
                        onClick={() => handleChatWithTherapist(therapist._id)}
                        style={{ 
                          flex: 1,
                          background: '#10b981', 
                          color: 'white', 
                          border: 'none', 
                          padding: '12px 24px', 
                          borderRadius: 8, 
                          fontSize: 16,
                          cursor: 'pointer'
                        }}
                      >
                        💬 Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}