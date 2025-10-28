import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables explicitly FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Now import other modules after environment variables are loaded
import { app, connectToDatabase } from './index.js';

const port = process.env.PORT || 5002;

async function startServer() {
  try {
    await connectToDatabase();
    
    // Start Express server with error handling
    const server = app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error("❌ Server error:", error.message);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please close the application using this port or use a different port.`);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();