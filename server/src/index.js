import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Mongo connection
const mongoUri = process.env.MONGO_URI;
async function start() {
  try {
    if (!mongoUri) {
      console.warn('MONGO_URI not set. Set it in server/.env to persist users.');
    } else {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();