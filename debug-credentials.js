const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection URI - using the same as the server
const mongoUri = 'mongodb://127.0.0.1:27017/mindmirror2';

// Admin schema
const adminSchema = new mongoose.Schema({
  name: String, email: String, passwordHash: String, isSuperAdmin: Boolean, active: Boolean,
});
const Admin = mongoose.model('Admin', adminSchema);

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  userType: String,
  isApproved: Boolean,
  isActive: Boolean,
});
const User = mongoose.model('User', userSchema);

async function debugCredentials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Test admin credentials
    console.log('\n=== Testing Admin Credentials ===');
    const admins = await Admin.find({});
    for (const admin of admins) {
      console.log(`Admin: ${admin.name} (${admin.email}) - Active: ${admin.active}`);
    }
    
    // Test user credentials
    console.log('\n=== Testing User Credentials ===');
    const users = await User.find({});
    for (const user of users) {
      console.log(`${user.name} (${user.email}) - Type: ${user.userType}, Active: ${user.isActive}, Approved: ${user.isApproved}`);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugCredentials();