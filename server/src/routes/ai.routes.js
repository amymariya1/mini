import { Router } from 'express';

// This route proxies requests to RapidAPI AI Doctor.
// Configure via environment variables:
// - RAPIDAPI_KEY: Your RapidAPI key
// - RAPIDAPI_AI_DOCTOR_HOST: e.g. 'ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com'
// - RAPIDAPI_AI_DOCTOR_URL: full URL for the endpoint (optional). Example:
//   'https://ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com/chat?noqueue=1'
// - RAPIDAPI_AI_DOCTOR_PATH: path part (optional)
//
// Expected client payload: { prompt: string, context?: any }
// Response: { answer: string, meta?: object }
const router = Router();

function resolveEndpoint() {
  const url = process.env.RAPIDAPI_AI_DOCTOR_URL;
  const host = process.env.RAPIDAPI_AI_DOCTOR_HOST || 'ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com';
  const path = process.env.RAPIDAPI_AI_DOCTOR_PATH || '/chat?noqueue=1';
  if (url) return { url, host: host || '', path: '' };
  // Default to the provided endpoint if not explicitly configured via URL
  return { url: `https://${host}${path}`, host, path };
}

router.post('/assistant/ask', async (req, res) => {
  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Server not configured: RAPIDAPI_KEY missing' });
    }

    const { prompt, context } = req.body || {};
    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ message: 'prompt is required' });
    }

    const { url, host } = resolveEndpoint();

    // Build request body to AI Doctor API per provided spec
    const body = {
      message: String(prompt).trim(),
      specialization: 'psychiatry',
      language: (context && context.language) || 'en',
      // Optionally include app metadata if the API ignores unknown fields
      app: (context && context.app) || 'MindMate',
    };

    const headers = {
      'content-type': 'application/json',
      'x-rapidapi-key': apiKey,
    };
    if (host) headers['x-rapidapi-host'] = host;

    // Use global fetch (Node 18+) to avoid extra deps
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = isJson && data && data.message ? data.message : (response.statusText || 'AI Doctor request failed');
      return res.status(response.status).json({ message });
    }

    // Normalize to { answer } shape for the client component
    let answer = '';
    if (isJson && data) {
      // Try common fields and nested shapes
      answer =
        data.answer ||
        data.result ||
        data.text ||
        data.response ||
        data.reply ||
        (data.response && (data.response.message || data.response.answer || data.response.text)) ||
        (data.message && (data.message.text || data.message.answer || data.message)) ||
        (data.data && data.data.answer) ||
        '';

      // If still empty, stringify whole data
      if (!answer) answer = JSON.stringify(data);

      // If answer is an object/array, stringify it to avoid "[object Object]" on client
      if (typeof answer === 'object') {
        try {
          answer = JSON.stringify(answer);
        } catch {
          answer = String(answer);
        }
      }
    } else {
      answer = String(data || '');
    }

    return res.json({ answer, raw: isJson ? data : undefined });
  } catch (err) {
    console.error('AI Doctor proxy error:', err);
    return res.status(500).json({ message: 'Server error contacting AI Doctor' });
  }
});

export default router;
