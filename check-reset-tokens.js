const mongoose = require('mongoose');

// MongoDB connection URI
const mongoUri = 'mongodb://127.0.0.1:27017/mindmirror2';

// User schema with reset token fields
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  userType: String,
  isApproved: Boolean,
  isActive: Boolean,
  resetPasswordTokenHash: String,
  resetPasswordExpires: Date,
});
const User = mongoose.model('User', userSchema);

async function checkResetTokens() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check for users with reset tokens
    const usersWithTokens = await User.find({
      resetPasswordTokenHash: { $ne: null },
      resetPasswordExpires: { $gt: new Date() }
    });
    
    console.log('\nUsers with active reset tokens:');
    if (usersWithTokens.length === 0) {
      console.log('No users with active reset tokens found');
    } else {
      usersWithTokens.forEach(user => {
        console.log(`- ${user.email} (Token expires: ${user.resetPasswordExpires})`);
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkResetTokens();