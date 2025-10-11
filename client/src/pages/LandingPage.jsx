import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import "../App.css";

export default function LandingPage() {
  console.log("LandingPage is rendering with updated styles");
  return (
    <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title" style={{ textAlign: 'center', color: '#1e3a8a', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', lineHeight: '1.1', marginBottom: 'var(--space-6)', letterSpacing: '-0.02em', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '20px', borderRadius: '10px' }}>
            Your Mental Health
            <br />
            Companion & Wellness Guide
          </h1>
          <p className="hero-subtitle" style={{ textAlign: 'center', fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', lineHeight: '1.6', color: 'var(--primary-700)', marginBottom: 'var(--space-8)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Discover your mental health state, track your wellness journey, 
            and access personalized tools to improve your emotional well-being. 
            Take control of your mental health with science-backed assessments and self-care resources.
          </p>
          <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Your Wellness Journey
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <motion.div
            className="text-center"
            style={{ marginBottom: 'var(--space-16)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-4)', color: 'var(--primary-900)' }}>
              Your Personal Mental Health Toolkit
            </h2>
            <p className="text-lg" style={{ color: 'var(--primary-600)', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive self-care tools and assessments to understand and improve your mental wellness
            </p>
          </motion.div>

          <div className="features-grid">
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card-body text-center">
                <div className="feature-icon">📊</div>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-3)', color: 'var(--primary-900)' }}>
                  Mental Health Assessments
                </h3>
                <p style={{ color: 'var(--primary-600)', lineHeight: '1.6' }}>
                  Take validated assessments like DASS-21 to understand your current mental health state, track changes over time, and get personalized insights.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card-body text-center">
                <div className="feature-icon">📈</div>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-3)', color: 'var(--primary-900)' }}>
                  Progress Tracking
                </h3>
                <p style={{ color: 'var(--primary-600)', lineHeight: '1.6' }}>
                  Monitor your mental wellness journey with detailed analytics, mood patterns, and personalized reports to see your growth over time.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="card-body text-center">
                <div className="feature-icon">🧘</div>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-3)', color: 'var(--primary-900)' }}>
                  Self-Care Activities
                </h3>
                <p style={{ color: 'var(--primary-600)', lineHeight: '1.6' }}>
                  Access guided meditations, breathing exercises, journaling prompts, and mindfulness practices tailored to your mental health needs.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="card-body text-center">
                <div className="feature-icon">💡</div>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-3)', color: 'var(--primary-900)' }}>
                  Personalized Insights
                </h3>
                <p style={{ color: 'var(--primary-600)', lineHeight: '1.6' }}>
                  Get AI-powered recommendations and actionable tips based on your assessment results to help you improve your mental well-being.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="card-body text-center">
                <div className="feature-icon">🎯</div>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-3)', color: 'var(--primary-900)' }}>
                  Wellness Goals
                </h3>
                <p style={{ color: 'var(--primary-600)', lineHeight: '1.6' }}>
                  Set and track personal mental health goals, create action plans, and celebrate milestones in your wellness journey.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="card-body text-center">
                <div className="feature-icon">📚</div>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-3)', color: 'var(--primary-900)' }}>
                  Educational Resources
                </h3>
                <p style={{ color: 'var(--primary-600)', lineHeight: '1.6' }}>
                  Learn about mental health, coping strategies, and evidence-based techniques through articles, videos, and interactive content.
                </p>
              </div>
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
      <section className="section">
        <div className="container">
          <motion.div
            className="text-center"
            style={{ marginBottom: 'var(--space-16)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-4)', color: 'var(--primary-900)' }}>
              Real Stories of Personal Growth
            </h2>
            <p className="text-lg" style={{ color: 'var(--primary-600)', maxWidth: '600px', margin: '0 auto' }}>
              Discover how others have used our tools to understand and improve their mental wellness
            </p>
          </motion.div>

          <div className="testimonials-grid">
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card-body">
                <div className="testimonial-content">
                  <p style={{ fontSize: '1.125rem', lineHeight: '1.7', color: 'var(--primary-700)', marginBottom: 'var(--space-6)', fontStyle: 'italic' }}>
                    "The mental health assessments helped me understand my anxiety levels. Tracking my progress over time showed me real improvement and gave me hope."
                  </p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">S</div>
                  <div className="author-info">
                    <h4 style={{ fontWeight: '600', color: 'var(--primary-900)', marginBottom: 'var(--space-1)' }}>Sarah M.</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--primary-600)' }}>User since 2023</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card-body">
                <div className="testimonial-content">
                  <p style={{ fontSize: '1.125rem', lineHeight: '1.7', color: 'var(--primary-700)', marginBottom: 'var(--space-6)', fontStyle: 'italic' }}>
                    "The self-care activities and personalized insights really work! I've learned so much about managing my stress and building better mental health habits."
                  </p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">M</div>
                  <div className="author-info">
                    <h4 style={{ fontWeight: '600', color: 'var(--primary-900)', marginBottom: 'var(--space-1)' }}>Michael R.</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--primary-600)' }}>User since 2022</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="card-body">
                <div className="testimonial-content">
                  <p style={{ fontSize: '1.125rem', lineHeight: '1.7', color: 'var(--primary-700)', marginBottom: 'var(--space-6)', fontStyle: 'italic' }}>
                    "Setting wellness goals and tracking my daily mood has been a game-changer. I feel more in control of my mental health than ever before."
                  </p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">A</div>
                  <div className="author-info">
                    <h4 style={{ fontWeight: '600', color: 'var(--primary-900)', marginBottom: 'var(--space-1)' }}>Alex T.</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--primary-600)' }}>User since 2023</p>
                  </div>
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
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">Ready to Take Control of Your Mental Wellness?</h2>
            <p className="cta-description">
              Start your journey of self-discovery and personal growth with our comprehensive mental health assessment and personalized wellness tools.
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start My Wellness Journey
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
  );
}