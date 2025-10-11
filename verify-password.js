const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: String, email: String, passwordHash: String, isSuperAdmin: Boolean, active: Boolean,
});
const Admin = mongoose.model('Admin', adminSchema);

async function verifyPassword() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mindmirror2');
    console.log('Connected to MongoDB');
    
    // Test the exact query used in loginAdmin
    const admin = await Admin.findOne({ email: 'admin@example.com', active: true });
    if (!admin) {
      console.log('Admin not found with active: true query');
      
      // Try without active filter
      const admin2 = await Admin.findOne({ email: 'admin@example.com' });
      if (admin2) {
        console.log('Admin found without active filter:', admin2.name);
        console.log('Active field value:', admin2.active);
      } else {
        console.log('Admin not found even without active filter');
      }
      return;
    }
    
    console.log('Admin found with active filter:', admin.name);
    console.log('Email:', admin.email);
    console.log('Password hash:', admin.passwordHash);
    console.log('Active:', admin.active);
    console.log('isSuperAdmin:', admin.isSuperAdmin);
    
    // Test password
    const isMatch = await bcrypt.compare('admin123', admin.passwordHash);
    console.log('Password match:', isMatch);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyPassword();