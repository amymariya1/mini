const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: String, email: String, passwordHash: String, isSuperAdmin: Boolean, active: Boolean,
});
const Admin = mongoose.model('Admin', adminSchema);

async function testAdminLogin() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mindmirror2');
    console.log('Connected to MongoDB');
    
    // Test with a known admin email
    const email = 'amymariya4@gmail.com';
    const password = 'Test1234!'; // Replace with actual password
    
    console.log('Testing login for:', email);
    
    const admin = await Admin.findOne({ email, active: true });
    console.log('Admin found:', admin);
    
    if (!admin) {
      console.log('No active admin found with email:', email);
      return;
    }

    // Test password comparison
    const ok = await bcrypt.compare(password, admin.passwordHash);
    console.log('Password match:', ok);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminLogin();