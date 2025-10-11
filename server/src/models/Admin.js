import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
    passwordHash: { type: String, required: true },
    isSuperAdmin: { type: Boolean, default: true }, // single super admin for now
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);


export default mongoose.model('Admin', adminSchema);