import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function ReferPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    referringProfessional: "",
    professionalEmail: "",
    reason: "",
    additionalInfo: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, we'll just show success message
      setSubmitSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          patientName: "",
          patientEmail: "",
          patientPhone: "",
          referringProfessional: "",
          professionalEmail: "",
          reason: "",
          additionalInfo: ""
        });
      }, 3000);
    } catch (error) {
      setSubmitError("An error occurred while submitting the referral. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Navbar />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
              Refer a Patient
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Help connect individuals with the mental health support they need by referring them to our therapy services.
            </p>
          </div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                marginBottom: '32px'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                Referral Submitted Successfully!
              </h3>
              <p style={{ color: '#166534' }}>
                Thank you for referring a patient. We'll contact them shortly to discuss therapy options.
              </p>
            </motion.div>
          ) : (
            <div 
              className="card"
              style={{ 
                padding: '32px', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#ffffff'
              }}
            >
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>
                    Patient Information
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label 
                        htmlFor="patientName" 
                        style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}
                      >
                        Patient Full Name *
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
                          padding: '12px 16px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s'
                        }}
                        placeholder="Enter patient's full name"
                      />
                    </div>
                    
                    <div>
                      <label 
                        htmlFor="patientEmail" 
                        style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}
                      >
                        Patient Email *
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
                          padding: '12px 16px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s'
                        }}
                        placeholder="Enter patient's email"
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label 
                      htmlFor="patientPhone" 
                      style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}
                    >
                      Patient Phone Number
                    </label>
                    <input
                      type="tel"
                      id="patientPhone"
                      name="patientPhone"
                      value={formData.patientPhone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s'
                      }}
                      placeholder="Enter patient's phone number"
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>
                    Referring Professional Information
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label 
                        htmlFor="referringProfessional" 
                        style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}
                      >
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        id="referringProfessional"
                        name="referringProfessional"
                        value={formData.referringProfessional}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s'
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label 
                        htmlFor="professionalEmail" 
                        style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}
                      >
                        Your Email *
                      </label>
                      <input
                        type="email"
                        id="professionalEmail"
                        name="professionalEmail"
                        value={formData.professionalEmail}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s'
                        }}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label 
                    htmlFor="reason" 
                    style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}
                  >
                    Reason for Referral *
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '1rem',
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <option value="">Select a reason</option>
                    <option value="anxiety">Anxiety Disorders</option>
                    <option value="depression">Depression</option>
                    <option value="ptsd">PTSD/Trauma</option>
                    <option value="bipolar">Bipolar Disorder</option>
                    <option value="ocd">OCD</option>
                    <option value="stress">Stress Management</option>
                    <option value="grief">Grief and Loss</option>
                    <option value="relationship">Relationship Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '32px' }}>
                  <label 
                    htmlFor="additionalInfo" 
                    style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}
                  >
                    Additional Information
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s',
                      resize: 'vertical'
                    }}
                    placeholder="Any additional details about the patient or reason for referral..."
                  />
                </div>
                
                {submitError && (
                  <div style={{ 
                    color: '#dc2626', 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '6px', 
                    padding: '12px 16px', 
                    marginBottom: '20px' 
                  }}>
                    {submitError}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Referral'}
                  </motion.button>
                </div>
              </form>
            </div>
          )}
          
          <div style={{ 
            marginTop: '32px', 
            textAlign: 'center', 
            padding: '24px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0' 
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              Questions About Referrals?
            </h3>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>
              Our team is here to help you connect patients with the care they need.
            </p>
            <button 
              onClick={() => navigate('/contact')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
            >
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}