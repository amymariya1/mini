const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection URI - using the same as the server
const mongoUri = 'mongodb://127.0.0.1:27017/mindmirror2';

// Admin schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
  passwordHash: { type: String, required: true },
  isSuperAdmin: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.name);
      mongoose.connection.close();
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const admin = new Admin({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: passwordHash,
      isSuperAdmin: true,
      active: true,
    });
    
    await admin.save();
    console.log('Admin user created successfully:', admin.name);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();