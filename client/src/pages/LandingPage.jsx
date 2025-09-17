import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import "../App.css";

export default function LandingPage() {
  return (
    <div className="mental-health-landing">
      {/* Background Elements */}
      <div className="bg-hearts"></div>
      <div className="bg-circles"></div>
      <div className="bg-gradient"></div>

      <div className="landing-content">
        <Navbar />

        {/* Hero Section */}
        <section className="mental-hero">
          <div className="hero-container">
          <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-text">
                <h1>
                  Your Mental Health
                  <span className="gradient-text"> Companion & Wellness Guide</span>
                </h1>
                <p className="hero-subtitle">
                  Discover your mental health state, track your wellness journey, 
                  and access personalized tools to improve your emotional well-being. 
                  Take control of your mental health with science-backed assessments and self-care resources.
                </p>
                <div className="hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/signup">
                    <button className="primary-btn">
                      <span>Start Your Wellness Journey</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </Link>

                </div>
                <div className="trust-indicators">
                  <div className="trust-item">
                    <span className="trust-icon">📊</span>
                    <span>Science-Based Assessments</span>
                  </div>
                  <div className="trust-item">
                    <span className="trust-icon">🔒</span>
                    <span>100% Private & Secure</span>
                  </div>
                  <div className="trust-item">
                    <span className="trust-icon">🌱</span>
                    <span>Personal Growth Tools</span>
                  </div>
                </div>
              </div>
              
              <motion.div
                className="hero-visual"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <div className="medical-illustration">
                  <div className="doctor-figure">
                    <div className="doctor-head"></div>
                    <div className="doctor-body"></div>
                    <div className="stethoscope"></div>
                  </div>
                  <div className="heart-symbols">
                    <div className="heart heart-1">❤️</div>
                    <div className="heart heart-2">💙</div>
                    <div className="heart heart-3">💚</div>
                  </div>
                  <div className="therapy-elements">
                    <div className="brain-icon">🧠</div>
                    <div className="therapy-icon">💭</div>
                    <div className="support-icon">🤝</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>Your Personal Mental Health Toolkit</h2>
              <p>Comprehensive self-care tools and assessments to understand and improve your mental wellness</p>
            </motion.div>

            <div className="features-grid">
              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">📊</div>
                <h3>Mental Health Assessments</h3>
                <p>Take validated assessments like DASS-21 to understand your current mental health state, track changes over time, and get personalized insights.</p>
              </motion.div>

              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">📈</div>
                <h3>Progress Tracking</h3>
                <p>Monitor your mental wellness journey with detailed analytics, mood patterns, and personalized reports to see your growth over time.</p>
              </motion.div>

              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">🧘</div>
                <h3>Self-Care Activities</h3>
                <p>Access guided meditations, breathing exercises, journaling prompts, and mindfulness practices tailored to your mental health needs.</p>
              </motion.div>

              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">💡</div>
                <h3>Personalized Insights</h3>
                <p>Get AI-powered recommendations and actionable tips based on your assessment results to help you improve your mental well-being.</p>
              </motion.div>

              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">🎯</div>
                <h3>Wellness Goals</h3>
                <p>Set and track personal mental health goals, create action plans, and celebrate milestones in your wellness journey.</p>
              </motion.div>

              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">📚</div>
                <h3>Educational Resources</h3>
                <p>Learn about mental health, coping strategies, and evidence-based techniques through articles, videos, and interactive content.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="stats-section">
          <div className="container">
            <motion.div
              className="stats-grid"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="stat-item">
                <div className="stat-number">25K+</div>
                <div className="stat-label">Users Tracking Wellness</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Report Feeling Better</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500K+</div>
                <div className="stat-label">Assessments Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Self-Care Tools Available</div>
              </div>
            </motion.div>
                </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <div className="container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>Real Stories of Personal Growth</h2>
              <p>Discover how others have used our tools to understand and improve their mental wellness</p>
            </motion.div>

            <div className="testimonials-grid">
              <motion.div
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="testimonial-content">
                  <p>"The mental health assessments helped me understand my anxiety levels. Tracking my progress over time showed me real improvement and gave me hope."</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">S</div>
                  <div className="author-info">
                    <div className="author-name">Sarah M.</div>
                    <div className="author-role">User since 2023</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="testimonial-content">
                  <p>"The self-care activities and personalized insights really work! I've learned so much about managing my stress and building better mental health habits."</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">M</div>
                  <div className="author-info">
                    <div className="author-name">Michael R.</div>
                    <div className="author-role">User since 2022</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="testimonial-content">
                  <p>"Setting wellness goals and tracking my daily mood has been a game-changer. I feel more in control of my mental health than ever before."</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">A</div>
                  <div className="author-info">
                    <div className="author-name">Alex T.</div>
                    <div className="author-role">User since 2023</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <motion.div
              className="cta-content"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>Ready to Take Control of Your Mental Wellness?</h2>
              <p>Start your journey of self-discovery and personal growth with our comprehensive mental health assessment and personalized wellness tools.</p>
              <div className="cta-actions">
                <Link to="/signup">
                  <button className="primary-btn large">
                    <span>Start My Wellness Journey</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </Link>
              </div>
              <div className="cta-note">
                <span className="note-icon">🔒</span>
                <span>Your data is private and secure - take control of your mental wellness journey</span>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}