import { Router } from 'express';
import mongoose from 'mongoose';
import JournalEntry from '../models/JournalEntry.js';
import User from '../models/User.js';

const router = Router();

// Middleware: simple auth by email header (placeholder). Replace with real auth if available.
async function requireUser(req, res, next) {
  try {
    // Expect a header x-user-email or x-user-id (adjust to your real auth once available)
    const email = req.headers['x-user-email'];
    const userIdHeader = req.headers['x-user-id'];

    let user = null;
    if (userIdHeader && mongoose.isValidObjectId(userIdHeader)) {
      user = await User.findById(userIdHeader);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    console.error('requireUser error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/journal?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/journal', requireUser, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { userId: req.user._id };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = String(from);
      if (to) query.date.$lte = String(to);
    }
    const entries = await JournalEntry.find(query).sort({ date: 1 });
    return res.json({ entries });
  } catch (err) {
    console.error('List journal entries error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/journal/:date
router.get('/journal/:date', requireUser, async (req, res) => {
  try {
    const { date } = req.params;
    const entry = await JournalEntry.findOne({ userId: req.user._id, date });
    if (!entry) return res.status(404).json({ message: 'Not found' });
    return res.json({ entry });
  } catch (err) {
    console.error('Get journal entry error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/journal/:date  { mood, note, dass? }
router.put('/journal/:date', requireUser, async (req, res) => {
  try {
    const { date } = req.params;
    const { mood = null, note = '', dass } = req.body || {};

    const update = { mood, note };
    if (dass && typeof dass === 'object') {
      update.dass = {
        D: typeof dass.D === 'number' ? dass.D : null,
        A: typeof dass.A === 'number' ? dass.A : null,
        S: typeof dass.S === 'number' ? dass.S : null,
      };
    }

    const entry = await JournalEntry.findOneAndUpdate(
      { userId: req.user._id, date },
      { $set: update },
      { new: true, upsert: true }
    );

    return res.json({ entry });
  } catch (err) {
    console.error('Upsert journal entry error', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate entry for date' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/journal/:date
router.delete('/journal/:date', requireUser, async (req, res) => {
  try {
    const { date } = req.params;
    await JournalEntry.deleteOne({ userId: req.user._id, date });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete journal entry error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;