const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection URI - using the same as the server
const mongoUri = 'mongodb://127.0.0.1:27017/mindmirror2';

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

async function debugLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Test with a known user email
    const email = 'user1@gmail.com';
    const password = 'Test1234!'; // This might be incorrect
    
    console.log('Testing login for user:', email);
    
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('No user found with email:', email);
      mongoose.connection.close();
      return;
    }
    
    console.log('User details:');
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- User Type:', user.userType);
    console.log('- Is Active:', user.isActive);
    console.log('- Is Approved:', user.isApproved);

    // Test password comparison
    const ok = await bcrypt.compare(password, user.passwordHash);
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

debugLogin();