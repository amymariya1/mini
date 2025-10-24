import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function DepressionDetail() {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: isDarkMode ? colors.background : '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#667eea',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😔</div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0c4a6e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              Understanding Depression
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
              Learn about depression, its symptoms, and evidence-based strategies to overcome it
            </p>
          </div>
        </motion.div>

        {/* What is Depression */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0c4a6e', marginBottom: '20px' }}>
            What is Depression?
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '16px' }}>
            Depression is more than just feeling sad or going through a rough patch. It's a serious mental health condition that affects how you feel, think, and handle daily activities. Depression can make it difficult to work, study, eat, sleep, and enjoy life.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>
            It's important to know that depression is a real illness with real symptoms, and it's not a sign of weakness or something you can simply "snap out of." With proper treatment and support, most people with depression can make a full recovery.
          </p>
        </motion.section>

        {/* Common Symptoms */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0c4a6e', marginBottom: '20px' }}>
            Common Symptoms
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#0c4a6e', marginBottom: '12px' }}>
                Emotional Symptoms
              </h3>
              <ul style={{ lineHeight: '1.8', color: '#475569' }}>
                <li>Persistent sad, anxious, or "empty" mood</li>
                <li>Feelings of hopelessness or pessimism</li>
                <li>Feelings of guilt, worthlessness, or helplessness</li>
                <li>Loss of interest in hobbies and activities</li>
                <li>Decreased energy or fatigue</li>
              </ul>
            </div>
            <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#0c4a6e', marginBottom: '12px' }}>
                Physical Symptoms
              </h3>
              <ul style={{ lineHeight: '1.8', color: '#475569' }}>
                <li>Changes in appetite or weight</li>
                <li>Difficulty sleeping or oversleeping</li>
                <li>Physical aches or pains</li>
                <li>Digestive problems</li>
                <li>Difficulty concentrating or making decisions</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* How to Overcome Depression */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0c4a6e', marginBottom: '20px' }}>
            Evidence-Based Strategies to Overcome Depression
          </h2>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '16px' }}>
              1. Behavioral Activation
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Start with small, achievable activities each day. Even when you don't feel like it, engaging in activities can help lift your mood.
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Set 1-3 small, doable goals daily (e.g., take a 5-minute walk, shower, text a friend)</li>
              <li>Schedule activities you used to enjoy, even if motivation is low</li>
              <li>Break larger tasks into smaller, manageable steps</li>
              <li>Celebrate small victories and progress</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '16px' }}>
              2. Cognitive Behavioral Therapy (CBT) Techniques
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Challenge and reframe negative thought patterns that contribute to depression.
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Keep a thought log: Notice negative thoughts → Test their accuracy → Replace with balanced alternatives</li>
              <li>Practice self-compassion: Treat yourself as you would a good friend</li>
              <li>Identify cognitive distortions (all-or-nothing thinking, catastrophizing, etc.)</li>
              <li>Focus on evidence-based thinking rather than emotional reasoning</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '16px' }}>
              3. Establish Healthy Routines
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Maintain a consistent sleep schedule (7-9 hours per night)</li>
              <li>Eat regular, nutritious meals</li>
              <li>Exercise for 20-30 minutes most days (walking, yoga, swimming)</li>
              <li>Get sunlight exposure, especially in the morning</li>
              <li>Limit alcohol and avoid recreational drugs</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '16px' }}>
              4. Social Connection
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Reach out to friends and family, even when you don't feel like it</li>
              <li>Join support groups or community activities</li>
              <li>Consider volunteering to help others</li>
              <li>Share your feelings with trusted people</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '16px' }}>
              5. Mindfulness and Relaxation
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Practice mindfulness meditation (10-15 minutes daily)</li>
              <li>Try progressive muscle relaxation</li>
              <li>Use deep breathing exercises</li>
              <li>Engage in activities that bring you into the present moment</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '16px' }}>
              6. Professional Help
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Don't hesitate to seek professional support. Treatment options include:
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Psychotherapy (CBT, Interpersonal Therapy, etc.)</li>
              <li>Medication (antidepressants) when recommended by a doctor</li>
              <li>Combination of therapy and medication (often most effective)</li>
              <li>Regular check-ins with a mental health professional</li>
            </ul>
          </div>
        </motion.section>

        {/* When to Seek Help */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px', background: '#fef3c7', border: '2px solid #f59e0b' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#92400e', marginBottom: '20px' }}>
            ⚠️ When to Seek Immediate Help
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#78350f', marginBottom: '16px' }}>
            If you or someone you know is experiencing thoughts of suicide or self-harm, seek help immediately:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#78350f', marginLeft: '20px' }}>
            <li>Call emergency services (911 in the US)</li>
            <li>Contact the National Suicide Prevention Lifeline: 988 (US)</li>
            <li>Go to the nearest emergency room</li>
            <li>Reach out to a trusted friend, family member, or mental health professional</li>
          </ul>
        </motion.section>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/assessments')}
            style={{
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0c4a6e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
            }}
          >
            Take Assessment
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/therapists')}
            style={{
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'white',
              color: '#0ea5e9',
              border: '2px solid #0ea5e9',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            Find a Therapist
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
