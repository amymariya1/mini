import { app, connectToDatabase } from '../index.js';

// Vercel serverless function handler
export default async function handler(request, response) {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    // Pass the request to the Express app
    return app(request, response);
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}