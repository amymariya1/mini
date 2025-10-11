import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Store date as YYYY-MM-DD for easy lookup and uniqueness per user/day
    date: { type: String, required: true },
    mood: { type: Number, min: 0, max: 10, default: null },
    note: { type: String, default: '' },
    // Optional: store snapshot of assessment results for that date
    dass: {
      D: { type: Number, default: null },
      A: { type: Number, default: null },
      S: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

// Ensure unique entry per user per date

export default mongoose.model('JournalEntry', journalEntrySchema);