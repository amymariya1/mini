import { app, connectToDatabase } from './index.js';

const port = process.env.PORT || 5002;

async function startServer() {
  try {
    await connectToDatabase();
    
    // Start Express server
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();