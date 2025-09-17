import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import publicRoutes from './routes/public.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Mongo connection
const mongoUri = process.env.MONGO_URI;
async function start() {
  // Try connecting to MongoDB, but don't block server start in dev
  if (!mongoUri) {
    console.warn('MONGO_URI not set. Running in in-memory mode.');
  } else {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
    } catch (err) {
      console.warn('MongoDB connection failed; continuing with in-memory mode:', err.message);
    }
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

start();