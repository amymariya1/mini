const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: String, email: String, passwordHash: String, isSuperAdmin: Boolean, active: Boolean,
});
const Admin = mongoose.model('Admin', adminSchema);

async function verifyAdminPassword() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mindmirror2');
    console.log('Connected to MongoDB');
    
    // Test with a known admin email
    const email = 'amymariya4@gmail.com';
    const password = 'Test1234!'; // This might not be the correct password
    
    console.log('Testing password for:', email);
    
    const admin = await Admin.findOne({ email, active: true });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      console.log('No active admin found with email:', email);
      mongoose.connection.close();
      return;
    }

    // Test password comparison
    const ok = await bcrypt.compare(password, admin.passwordHash);
    console.log('Password match:', ok);
    
    if (!ok) {
      console.log('The password you provided does not match the stored hash.');
      console.log('Please make sure you are using the correct password.');
    } else {
      console.log('Password is correct!');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAdminPassword();