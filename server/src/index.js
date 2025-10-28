import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables with explicit path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });
console.log('In index.js - Loading .env from:', envPath);
console.log('In index.js - MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('In index.js - MONGO_URI value:', process.env.MONGO_URI);

// ES module workaround for __dirname
const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);

// Initialize Express app
const app = express();

// Enable CORS for all routes with comprehensive configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5002',
      'https://mini-iota-one.vercel.app',
      // Render frontend URLs - using regex pattern matching
    ];
    
    // Check if the origin matches any of our allowed origins or patterns
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      // For regex patterns
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    }) || /.*\.onrender\.com$/.test(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Built-in middleware for parsing JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes imports
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
import appointmentRoutes from "./routes/appointment.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import tentativeAvailabilityRoutes from "./routes/tentativeAvailability.routes.js";
import therapistRoutes from "./routes/therapist.routes.js";
import meditationVideoRoutes from "./routes/meditationVideo.routes.js";
import likeRoutes from "./routes/like.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import therapistScheduleRoutes from "./routes/therapistSchedule.routes.js";
import upcomingPatientRoutes from "./routes/upcomingPatient.routes.js";
import cancellationRoutes from "./routes/cancellation.routes.js";

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
app.use("/api/appointments", appointmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/availability", tentativeAvailabilityRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/meditation-videos", meditationVideoRoutes);
app.use("/api", likeRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/therapist-schedule", therapistScheduleRoutes);
app.use("/api/upcoming-patients", upcomingPatientRoutes);
app.use("/api/cancellations", cancellationRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Root endpoint for Vercel deployment
app.get("/", (_req, res) => {
  res.json({ 
    message: "MindMirror Backend API", 
    status: "running",
    timestamp: new Date().toISOString(),
    documentation: "https://github.com/amymariya1/mini"
  });
});

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }
  
  try {
    if (!mongoUri) {
      throw new Error("❌ Error: MONGO_URI not found in environment variables");
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    throw error;
  }
}

// Export for Vercel
export { app, connectToDatabase };

export default app;