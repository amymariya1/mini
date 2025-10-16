import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname and __filename in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file with explicit path
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug: Log environment variables
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
console.log('MONGO_URI value:', process.env.MONGO_URI);

// Import routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import publicRoutes from "./routes/public.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import emailRoutes from "./routes/email.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import ordersCreateRoutes from "./routes/orders.create.routes.js";

const app = express();

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
app.use("/api/reviews", reviewsRoutes);
app.use("/api", paymentRoutes);
app.use("/api", emailRoutes);
app.use("/api", bookingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", ordersRoutes);
app.use("/api", ordersCreateRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --------------------
// 🧠 MongoDB Connection
// --------------------
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 5002;

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