import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function AnxietyDetail() {
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
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😰</div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f59e0b 0%, #92400e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              Understanding Anxiety
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
              Learn about anxiety disorders, their symptoms, and proven strategies to manage them
            </p>
          </div>
        </motion.div>

        {/* What is Anxiety */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#92400e', marginBottom: '20px' }}>
            What is Anxiety?
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '16px' }}>
            Anxiety is a normal human emotion that everyone experiences from time to time. However, when anxiety becomes excessive, persistent, and interferes with daily life, it may be an anxiety disorder. Anxiety disorders are the most common mental health conditions, affecting millions of people worldwide.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>
            Anxiety can manifest in various forms, including generalized anxiety disorder (GAD), social anxiety disorder, panic disorder, and specific phobias. The good news is that anxiety disorders are highly treatable with the right strategies and support.
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
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#92400e', marginBottom: '20px' }}>
            Common Symptoms
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#92400e', marginBottom: '12px' }}>
                Mental Symptoms
              </h3>
              <ul style={{ lineHeight: '1.8', color: '#475569' }}>
                <li>Excessive worry or fear</li>
                <li>Racing thoughts</li>
                <li>Difficulty concentrating</li>
                <li>Feeling on edge or restless</li>
                <li>Anticipating the worst</li>
                <li>Irritability</li>
              </ul>
            </div>
            <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#92400e', marginBottom: '12px' }}>
                Physical Symptoms
              </h3>
              <ul style={{ lineHeight: '1.8', color: '#475569' }}>
                <li>Rapid heartbeat or palpitations</li>
                <li>Shortness of breath</li>
                <li>Sweating or trembling</li>
                <li>Muscle tension</li>
                <li>Digestive issues</li>
                <li>Difficulty sleeping</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* How to Overcome Anxiety */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#92400e', marginBottom: '20px' }}>
            Evidence-Based Strategies to Manage Anxiety
          </h2>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b', marginBottom: '16px' }}>
              1. Breathing Techniques
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Controlled breathing is one of the most effective immediate tools for anxiety relief.
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li><strong>Box Breathing:</strong> Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4-5 times.</li>
              <li><strong>4-7-8 Breathing:</strong> Inhale for 4 counts, hold for 7, exhale slowly for 8. Repeat 3-4 times.</li>
              <li><strong>Diaphragmatic Breathing:</strong> Breathe deeply into your belly, not your chest, for 5-10 minutes.</li>
              <li>Practice breathing exercises daily, not just during anxious moments</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b', marginBottom: '16px' }}>
              2. Grounding Techniques
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Grounding helps bring you back to the present moment during anxiety or panic.
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li><strong>5-4-3-2-1 Technique:</strong> Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste</li>
              <li>Focus on physical sensations (feet on floor, hands on lap)</li>
              <li>Hold ice cubes or splash cold water on your face</li>
              <li>Describe your surroundings in detail out loud</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b', marginBottom: '16px' }}>
              3. Cognitive Restructuring
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Challenge anxious thoughts with evidence-based thinking.
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Identify the anxious thought (e.g., "Something bad will happen")</li>
              <li>Question the evidence: "What proof do I have? What's the worst that could happen?"</li>
              <li>Consider alternative explanations and more balanced thoughts</li>
              <li>Practice self-compassion and avoid harsh self-judgment</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b', marginBottom: '16px' }}>
              4. Gradual Exposure
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              For social anxiety and phobias, gradual exposure is highly effective.
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Create an exposure ladder: List situations from least to most anxiety-provoking</li>
              <li>Start with the easiest step and practice 3-5 times per week</li>
              <li>Stay in the situation until anxiety decreases (don't escape early)</li>
              <li>Gradually move up the ladder as each step becomes easier</li>
              <li>Celebrate progress and be patient with yourself</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b', marginBottom: '16px' }}>
              5. Lifestyle Changes
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Regular exercise (30 minutes, 5 days/week) - proven to reduce anxiety</li>
              <li>Limit caffeine and alcohol, which can worsen anxiety</li>
              <li>Maintain consistent sleep schedule (7-9 hours)</li>
              <li>Practice mindfulness meditation (10-20 minutes daily)</li>
              <li>Reduce screen time, especially before bed</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b', marginBottom: '16px' }}>
              6. Mindfulness and Acceptance
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Practice accepting anxiety rather than fighting it</li>
              <li>Label the feeling: "I'm noticing anxiety" (creates distance)</li>
              <li>Use mindfulness apps or guided meditations</li>
              <li>Focus on what you can control, let go of what you can't</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b', marginBottom: '16px' }}>
              7. Professional Treatment
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Professional help can make a significant difference:
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Cognitive Behavioral Therapy (CBT) - gold standard for anxiety</li>
              <li>Exposure and Response Prevention (ERP) for specific phobias</li>
              <li>Acceptance and Commitment Therapy (ACT)</li>
              <li>Medication (SSRIs, benzodiazepines) when appropriate</li>
              <li>Combination therapy often most effective</li>
            </ul>
          </div>
        </motion.section>

        {/* Panic Attack Help */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px', background: '#fef3c7', border: '2px solid #f59e0b' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#92400e', marginBottom: '20px' }}>
            🆘 During a Panic Attack
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#78350f', marginBottom: '16px' }}>
            If you're experiencing a panic attack, remember: it will pass. Try these steps:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#78350f', marginLeft: '20px' }}>
            <li>Remind yourself: "This is anxiety, not danger. It will pass."</li>
            <li>Focus on slow, deep breathing (exhale longer than inhale)</li>
            <li>Use the 5-4-3-2-1 grounding technique</li>
            <li>Don't fight the panic - accept it and let it pass</li>
            <li>Stay where you are if safe (leaving reinforces fear)</li>
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
              background: 'linear-gradient(135deg, #f59e0b 0%, #92400e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
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
              color: '#f59e0b',
              border: '2px solid #f59e0b',
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
