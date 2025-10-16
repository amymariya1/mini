import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function About() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '60px', padding: '40px 20px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
              About MindMirror
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
              Empowering individuals to understand and improve their mental wellness through science-backed tools and personalized insights.
            </p>
          </div>

          {/* Mission Section */}
          <div className="card" style={{ 
            padding: '40px', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
                  Our Mission
                </h2>
                <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '20px' }}>
                  At MindMirror, we believe that mental wellness is fundamental to overall well-being. Our mission is to make mental health tools accessible, understandable, and actionable for everyone.
                </p>
                <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                  We're committed to providing evidence-based resources that empower individuals to take control of their mental health journey, track their progress, and connect with professional support when needed.
                </p>
              </div>
              <div style={{ 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px', 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '4rem', color: '#94a3b8' }}>🧠</div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1e293b', 
              textAlign: 'center', 
              marginBottom: '40px' 
            }}>
              Our Core Values
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <motion.div 
                className="card"
                whileHover={{ y: -5 }}
                style={{ 
                  padding: '30px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#ffffff',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%', 
                  backgroundColor: '#e0f2fe', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '2rem',
                  color: '#0ea5e9'
                }}>
                  🔒
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '15px' }}>
                  Privacy & Security
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  Your mental health data is sensitive. We implement industry-leading security measures to protect your privacy and ensure your information remains confidential.
                </p>
              </motion.div>
              
              <motion.div 
                className="card"
                whileHover={{ y: -5 }}
                style={{ 
                  padding: '30px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#ffffff',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%', 
                  backgroundColor: '#fef3c7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '2rem',
                  color: '#f59e0b'
                }}>
                  🧪
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '15px' }}>
                  Evidence-Based
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  All our tools and assessments are grounded in scientific research and validated psychological instruments to ensure accuracy and effectiveness.
                </p>
              </motion.div>
              
              <motion.div 
                className="card"
                whileHover={{ y: -5 }}
                style={{ 
                  padding: '30px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#ffffff',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%', 
                  backgroundColor: '#fce7f3', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '2rem',
                  color: '#ec4899'
                }}>
                  🤝
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '15px' }}>
                  Accessibility
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                  Mental wellness tools should be available to everyone. We strive to make our platform accessible, affordable, and easy to use for all individuals.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Team Section */}
          <div className="card" style={{ 
            padding: '40px', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
            marginBottom: '40px'
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1e293b', 
              textAlign: 'center', 
              marginBottom: '30px' 
            }}>
              Our Team
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f1f5f9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '3rem',
                  color: '#94a3b8'
                }}>
                  👩‍⚕️
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  Dr. Sarah Johnson
                </h3>
                <p style={{ color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>
                  Clinical Psychologist
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  15+ years in mental health research and therapy
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f1f5f9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '3rem',
                  color: '#94a3b8'
                }}>
                  👨‍💻
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  Michael Chen
                </h3>
                <p style={{ color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>
                  Lead Developer
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Specializing in mental health technology solutions
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f1f5f9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '3rem',
                  color: '#94a3b8'
                }}>
                  👩‍💼
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  Emma Rodriguez
                </h3>
                <p style={{ color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>
                  Wellness Coordinator
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Certified wellness and mindfulness instructor
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div style={{ 
            textAlign: 'center', 
            padding: '50px 30px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            marginBottom: '40px'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
              Ready to Start Your Wellness Journey?
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 30px' }}>
              Join thousands of individuals taking control of their mental health with our comprehensive tools and resources.
            </p>
            <a 
              href="/signup" 
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#334155'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1e293b'}
            >
              Get Started Today
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}