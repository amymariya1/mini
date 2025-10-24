import app from './index.js';

// Vercel serverless function handler
export default function handler(req, res) {
  // Delegate to Express app
  return app(req, res);
}

// Export for local development
export { app };