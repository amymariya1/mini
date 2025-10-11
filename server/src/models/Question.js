import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    // Optional scale for DASS-style grouping: D = Depression, A = Anxiety, S = Stress
    scale: { type: String, enum: ['D', 'A', 'S', ''], default: '' },
    // Category allows grouping questionnaires (e.g., 'mindcheck', 'dass21')
    category: { type: String, default: 'mindcheck', index: true },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);


export default mongoose.model('Question', questionSchema);