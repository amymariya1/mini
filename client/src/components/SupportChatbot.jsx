import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import { askAssistantLLM } from "../services/api";
import "./support-chatbot.css";

// Lightweight on-device chatbot for wellness questions.
// - Reads latest DASS-21 results from localStorage (mm_assessment_dass21)
// - Answers common questions about depression, stress, and (social) anxiety
// - Shows quick tips and links to relevant app areas
// - Includes a crisis-safety response for self-harm language

function useLatestAssessment() {
  const [latest, setLatest] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_assessment_dass21");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.result) setLatest(parsed.result);
    } catch {}
  }, []);

  const summary = useMemo(() => {
    if (!latest?.final || !latest?.severity) return null;
    return {
      depressionScore: latest.final.D,
      anxietyScore: latest.final.A,
      stressScore: latest.final.S,
      depression: latest.severity.Depression,
      anxiety: latest.severity.Anxiety,
      stress: latest.severity.Stress,
    };
  }, [latest]);

  return summary;
}

function crisisCheck(text) {
  const t = (text || "").toLowerCase();
  return (
    t.includes("suicid") ||
    t.includes("kill myself") ||
    t.includes("hurt myself") ||
    t.includes("self-harm") ||
    t.includes("self harm")
  );
}

function generateAnswer(userText, assessment) {
  const text = (userText || "").toLowerCase();

  if (crisisCheck(text)) {
    return {
      title: "If you're in immediate danger",
      body: `I'm not a crisis service, but you matter. If you might be at risk of harming yourself or others, please seek immediate help: call your local emergency number, a suicide prevention hotline, or talk to someone you trust. In many countries, you can dial 988 (US) or find your country's hotline at findahelpline.com.`,
      tips: [
        "Breathe slowly: inhale 4s, hold 4s, exhale 6–8s",
        "Grounding: name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste",
        "Reach out to a trusted person right now",
      ],
    };
  }

  if (text.includes("result") || text.includes("assessment") || text.includes("score")) {
    if (!assessment) {
      return {
        title: "No recent assessment found",
        body: "I couldn't find a recent DASS‑21 result. You can take or retake it from the Assessments page to get a personalized overview.",
        links: [{ label: "Open Assessments", href: "/assessments" }],
      };
    }
    return {
      title: "Your latest DASS‑21 snapshot",
      body: `Depression: ${assessment.depression} (${assessment.depressionScore}) • Anxiety: ${assessment.anxiety} (${assessment.anxietyScore}) • Stress: ${assessment.stress} (${assessment.stressScore}). These are screening results, not a diagnosis. If results are Moderate+ and persist, consider speaking with a professional.`,
      tips: [
        "Track mood daily for 1–2 weeks",
        "Practice 10–15 min of breathing/relaxation",
        "Small routine changes: sleep, movement, connection",
      ],
      links: [
        { label: "Review/Retake Assessment", href: "/assessments" },
        { label: "Open Journal", href: "/journal" },
      ],
    };
  }

  if (text.includes("social anx") || text.includes("social-anx") || text.includes("social anxiety")) {
    return {
      title: "Support for Social Anxiety",
      body: "Social anxiety is common and workable. Gradual exposure + self-compassion helps over time.",
      tips: [
        "Build an exposure ladder: list 5–7 social steps from easier → harder",
        "Before events: 3 slow breaths; during: focus on the task, not on yourself",
        "After: note what went better than expected (journal it)",
      ],
      links: [
        { label: "Plan exposures in Journal", href: "/journal" },
        { label: "Check your assessment", href: "/assessments" },
      ],
    };
  }

  if (text.includes("depress")) {
    return {
      title: "Low mood and Depression – first steps",
      body: "Try gentle activation and self-kindness. Tiny wins compound.",
      tips: [
        "Set one very small goal today (e.g., 5‑min walk, shower, one text to a friend)",
        "Schedule activities you enjoyed before (even if motivation is low)",
        "Keep a thought log: notice harsh thoughts → write a kinder alternative",
      ],
      links: [
        { label: "Track mood in Journal", href: "/journal" },
        { label: "Review assessment", href: "/assessments" },
      ],
    };
  }

  if (text.includes("stress")) {
    return {
      title: "Quick Stress Reset",
      body: "Short, repeatable practices calm the body and mind.",
      tips: [
        "Physiological sigh: inhale, small top-up inhale, long exhale ×3",
        "4‑7‑8 breathing for 2–3 minutes",
        "Timebox worries: 10 min later today – write, then return to the present",
      ],
      links: [
        { label: "Log triggers in Journal", href: "/journal" },
        { label: "See assessment trend", href: "/assessments" },
      ],
    };
  }

  if (text.includes("anx") || text.includes("panic")) {
    return {
      title: "Anxiety/Panic Toolkit",
      body: "Panic peaks and passes. Skills help you ride the wave.",
      tips: [
        "Grounding 5‑4‑3‑2‑1 using senses",
        "Breathing: exhale longer than inhale",
        "Name the feeling: ‘I’m noticing anxiety’ → return attention to one action",
      ],
      links: [
        { label: "Practice and note in Journal", href: "/journal" },
        { label: "Check assessment", href: "/assessments" },
      ],
    };
  }

  return {
    title: "How can I help?",
    body: "Ask about depression, stress, social anxiety, panic, or your assessment results. I can share self‑help tips and point you to tools in the app.",
    tips: [
      "Examples: ‘What do my results mean?’",
      "‘Quick tip for social anxiety’",
      "‘How to reduce stress now?’",
    ],
  };
}

const SupportChatbot = forwardRef((props, ref) => {
  const assessment = useLatestAssessment();
  const [open, setOpen] = useState(false);

  // Expose open method to parent components
  useImperativeHandle(ref, () => ({
    openChat: () => setOpen(true),
    closeChat: () => setOpen(false),
    toggleChat: () => setOpen(v => !v)
  }));
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi! I’m here to help with questions about depression, stress, and social anxiety. You can also ask about your assessment results.",
    },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text) {
    if (!text.trim()) return;

    // Optimistically add user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    // Crisis/safety guard first
    if (crisisCheck(text)) {
      const answer = generateAnswer(text, assessment);
      setMessages((prev) => [...prev, { role: "bot", content: formatAnswer(answer) }]);
      return;
    }

    // Try LLM first if configured; otherwise local rules
    try {
      const payload = {
        prompt: text,
        context: {
          assessment,
          app: "MindMate",
          topics: ["depression", "stress", "social anxiety", "panic"],
          safety: true,
        },
      };
      const llm = await askAssistantLLM(payload);
      const answerText = (llm && (llm.answer || llm.text || llm.content)) ? (llm.answer || llm.text || llm.content) : JSON.stringify(llm);
      const pretty = cleanLLMText(answerText);
      setMessages((prev) => [...prev, { role: "bot", content: pretty }]);
    } catch (e) {
      // fallback to local generation
      const answer = generateAnswer(text, assessment);
      setMessages((prev) => [...prev, { role: "bot", content: formatAnswer(answer) }]);
    }
  }

  function formatAnswer(ans) {
    let out = "";
    if (ans.title) out += `\n${ans.title}\n`;
    if (ans.body) out += `\n${ans.body}\n`;
    if (ans.tips?.length) out += `\nTips:\n• ${ans.tips.join("\n• ")}\n`;
    if (ans.links?.length) out += `\nLinks:\n${ans.links.map(l => `• ${l.label}: ${l.href}`).join("\n")}\n`;
    return out.trim();
  }

  // Convert various AI responses into clean, human-friendly text
  function cleanLLMText(input) {
    try {
      if (input == null) return "";
      if (typeof input === "object") {
        // If object, try common fields first
        const t = input.answer || input.text || input.content || input.message || (input.response && (input.response.message || input.response.text)) || input.toString();
        return cleanLLMText(t);
      }
      let text = String(input);
      // If looks like JSON, attempt to parse and extract text
      const looksJson = /^[\[{].*[\]}]$/.test(text.trim());
      if (looksJson) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            // Join array of strings/objects as bullets
            const lines = parsed.map((v) => typeof v === 'string' ? v : (v && (v.text || v.message || JSON.stringify(v))));
            return lines.filter(Boolean).join("\n• ");
          } else if (parsed && typeof parsed === 'object') {
            const candidate = parsed.answer || parsed.text || parsed.message || (parsed.response && (parsed.response.message || parsed.response.text));
            if (candidate) return cleanLLMText(candidate);
            // Fallback to pretty-print key info
            return Object.entries(parsed).map(([k,v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join("\n");
          }
        } catch {}
      }
      // Unescape common escaped newlines from APIs
      text = text.replace(/\\n/g, "\n");
      // Remove wrapping quotes if present
      if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
        text = text.slice(1, -1);
      }
      return text.trim();
    } catch {
      return String(input || "");
    }
  }

  // Render message text with simple formatting: paragraphs and clickable links
  function renderMessage(text) {
    const urlRegex = /https?:\/\/[^\s)]+/g;
    const lines = String(text || '').split(/\n+/);
    return (
      <div>
        {lines.map((line, i) => {
          const parts = line.split(urlRegex);
          const links = line.match(urlRegex) || [];
          const nodes = [];
          for (let j = 0; j < parts.length; j++) {
            if (parts[j]) nodes.push(<span key={`t-${i}-${j}`}>{parts[j]}</span>);
            if (links[j]) nodes.push(
              <a key={`a-${i}-${j}`} href={links[j]} target="_blank" rel="noreferrer noopener">{links[j]}</a>
            );
          }
          return <p key={`p-${i}`} style={{ margin: '0 0 6px 0', lineHeight: 1.4 }}>{nodes}</p>;
        })}
      </div>
    );
  }

  const quickPrompts = [
    "What do my results mean?",
    "Quick tip for stress",
    "Help with social anxiety",
    "Tools for depression",
  ];

  return (
    <>
      {/* Launcher Button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="support-chat-launcher"
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        <FaRobot size={24} />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="support-chat-panel"
            role="dialog"
            aria-label="Support Chat"
          >
            {/* Header */}
            <div className="support-chat-header">
              <div className="support-chat-title">Support Chatbot</div>
              <button
                onClick={() => setOpen(false)}
                className="support-chat-close"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Assessment mini-badge */}
            <div className="support-chat-badge">
              {assessment ? (
                <div>
                  Latest DASS‑21 → Depression: <strong>{assessment.depression}</strong> • Anxiety: <strong>{assessment.anxiety}</strong> • Stress: <strong>{assessment.stress}</strong>
                </div>
              ) : (
                <div>No recent assessment found. Consider taking it for personalized tips.</div>
              )}
            </div>

            {/* Messages */}
            <div className="support-chat-body">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`support-chat-row ${m.role}`}
                >
                  <div className="support-chat-bubble">
                    {renderMessage(m.content)}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Quick prompts */}
            <div className="support-chat-prompts">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="support-chat-chip"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="support-chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about stress, anxiety, depression, or your results…"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default SupportChatbot;