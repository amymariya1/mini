import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function StressDetail() {
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
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😤</div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              Understanding Stress
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
              Learn about stress, its impact on your health, and effective strategies to manage it
            </p>
          </div>
        </motion.div>

        {/* What is Stress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#6d28d9', marginBottom: '20px' }}>
            What is Stress?
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '16px' }}>
            Stress is your body's natural response to demands or challenges. While some stress can be motivating and helpful (eustress), chronic or excessive stress can negatively impact your physical and mental health. Understanding and managing stress is crucial for overall well-being.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569' }}>
            Stress affects everyone differently, and what's stressful for one person might not be for another. The key is learning to recognize your stress triggers and developing healthy coping mechanisms.
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
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#6d28d9', marginBottom: '20px' }}>
            Common Signs of Stress
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#f5f3ff', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#6d28d9', marginBottom: '12px' }}>
                Emotional Signs
              </h3>
              <ul style={{ lineHeight: '1.8', color: '#475569' }}>
                <li>Feeling overwhelmed or on edge</li>
                <li>Irritability or mood swings</li>
                <li>Difficulty relaxing</li>
                <li>Low self-esteem</li>
                <li>Avoiding social situations</li>
              </ul>
            </div>
            <div style={{ padding: '20px', background: '#f5f3ff', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#6d28d9', marginBottom: '12px' }}>
                Physical Signs
              </h3>
              <ul style={{ lineHeight: '1.8', color: '#475569' }}>
                <li>Headaches or muscle tension</li>
                <li>Fatigue or low energy</li>
                <li>Digestive problems</li>
                <li>Changes in appetite or sleep</li>
                <li>Weakened immune system</li>
              </ul>
            </div>
            <div style={{ padding: '20px', background: '#f5f3ff', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#6d28d9', marginBottom: '12px' }}>
                Behavioral Signs
              </h3>
              <ul style={{ lineHeight: '1.8', color: '#475569' }}>
                <li>Procrastination or avoidance</li>
                <li>Changes in eating habits</li>
                <li>Increased use of alcohol/drugs</li>
                <li>Nervous habits (nail biting, pacing)</li>
                <li>Difficulty concentrating</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* How to Manage Stress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#6d28d9', marginBottom: '20px' }}>
            Evidence-Based Strategies to Manage Stress
          </h2>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              1. Quick Stress Relief Techniques
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Use these techniques for immediate stress relief in the moment:
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li><strong>Physiological Sigh:</strong> Take a deep breath in, then a small "top-up" breath, followed by a long exhale. Repeat 3 times.</li>
              <li><strong>Box Breathing:</strong> Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat for 2-3 minutes.</li>
              <li><strong>Progressive Muscle Relaxation:</strong> Tense and release each muscle group from toes to head</li>
              <li><strong>Cold Water:</strong> Splash cold water on your face or hold ice cubes to activate the dive reflex</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              2. Time Management and Organization
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Prioritize tasks: Focus on what's important vs. urgent</li>
              <li>Break large projects into smaller, manageable steps</li>
              <li>Use time-blocking: Schedule focused work periods with breaks</li>
              <li>Learn to say "no" to low-priority commitments</li>
              <li>Delegate tasks when possible</li>
              <li>Set realistic deadlines and expectations</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              3. Physical Activity
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              Exercise is one of the most effective stress relievers:
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Aim for 30 minutes of moderate exercise, 5 days per week</li>
              <li>Take 5-minute movement breaks every hour</li>
              <li>Try yoga, tai chi, or stretching for mind-body benefits</li>
              <li>Go for walks in nature when possible</li>
              <li>Dance, swim, or engage in activities you enjoy</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              4. Mindfulness and Meditation
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Practice mindfulness meditation for 10-20 minutes daily</li>
              <li>Use body scan meditation to release tension</li>
              <li>Try guided meditation apps (Headspace, Calm, Insight Timer)</li>
              <li>Practice mindful eating, walking, or daily activities</li>
              <li>Focus on the present moment rather than worrying about future</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              5. Healthy Lifestyle Habits
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li><strong>Sleep:</strong> Maintain consistent sleep schedule, 7-9 hours per night</li>
              <li><strong>Nutrition:</strong> Eat regular, balanced meals; limit caffeine and sugar</li>
              <li><strong>Hydration:</strong> Drink plenty of water throughout the day</li>
              <li><strong>Limit Stimulants:</strong> Reduce caffeine after noon, avoid alcohol as stress relief</li>
              <li><strong>Screen Time:</strong> Take breaks from devices, especially before bed</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              6. Social Support and Connection
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Talk to friends and family about your stress</li>
              <li>Join support groups or community activities</li>
              <li>Spend quality time with loved ones</li>
              <li>Consider getting a pet for companionship</li>
              <li>Volunteer to help others and gain perspective</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              7. Cognitive Strategies
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Challenge negative or catastrophic thinking</li>
              <li>Practice gratitude: Write down 3 things you're grateful for daily</li>
              <li>Reframe stressors as challenges rather than threats</li>
              <li>Focus on what you can control, accept what you can't</li>
              <li>Use positive self-talk and affirmations</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              8. Relaxation and Hobbies
            </h3>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Schedule regular "me time" for activities you enjoy</li>
              <li>Engage in creative hobbies (art, music, writing)</li>
              <li>Listen to calming music or nature sounds</li>
              <li>Take warm baths or practice aromatherapy</li>
              <li>Spend time in nature or with animals</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '16px' }}>
              9. Professional Help
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
              If stress is overwhelming or persistent, seek professional support:
            </p>
            <ul style={{ lineHeight: '1.8', color: '#475569', marginLeft: '20px' }}>
              <li>Cognitive Behavioral Therapy (CBT) for stress management</li>
              <li>Stress management counseling or coaching</li>
              <li>Biofeedback or relaxation training</li>
              <li>Medication if recommended by a healthcare provider</li>
            </ul>
          </div>
        </motion.section>

        {/* Warning Signs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card"
          style={{ marginBottom: '30px', padding: '40px', background: '#fef3c7', border: '2px solid #f59e0b' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#92400e', marginBottom: '20px' }}>
            ⚠️ When Stress Becomes Too Much
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#78350f', marginBottom: '16px' }}>
            Seek professional help if you experience:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#78350f', marginLeft: '20px' }}>
            <li>Persistent feelings of being overwhelmed or unable to cope</li>
            <li>Physical symptoms that don't improve with self-care</li>
            <li>Using alcohol, drugs, or food to cope with stress</li>
            <li>Thoughts of harming yourself or others</li>
            <li>Inability to perform daily tasks or work responsibilities</li>
            <li>Relationship problems due to stress</li>
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
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
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
              color: '#8b5cf6',
              border: '2px solid #8b5cf6',
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
