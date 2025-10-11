const mongoose = require('mongoose');

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

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({});
    console.log('Total users:', users.length);
    
    // Print user details
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Type: ${user.userType}, Approved: ${user.isApproved}, Active: ${user.isActive}`);
    });
    
    // Find admin users
    const admins = await User.find({ userType: 'admin' });
    console.log('\nAdmin users:', admins.length);
    admins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email})`);
    });
    
    // Find pending therapists
    const pendingTherapists = await User.find({ userType: 'therapist', isApproved: false });
    console.log('\nPending therapists:', pendingTherapists.length);
    pendingTherapists.forEach(therapist => {
      console.log(`- ${therapist.name} (${therapist.email}) - License: ${therapist.license}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();