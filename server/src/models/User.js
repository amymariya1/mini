import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
    passwordHash: { type: String, required: true },
    age: { type: Number, required: true, min: 0, max: 150 },
    // Password reset fields
    resetPasswordTokenHash: { type: String, default: null, index: true }, // sha256(token)
    resetPasswordExpires: { type: Date, default: null }, // expiry timestamp
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);