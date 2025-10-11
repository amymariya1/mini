import 'dotenv/config';
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Load .env file
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import publicRoutes from "./routes/public.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

// Fix for __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// 🧩 Middleware
// --------------------
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded images (so /uploads/image.jpg works)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------
// 🛣️ Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);
app.use("/api", journalRoutes);
app.use("/api", cartRoutes);
app.use("/api", postsRoutes);
app.use("/api", aiRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --------------------
// 🧠 MongoDB Connection
// --------------------
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI not found in .env file");
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");

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
