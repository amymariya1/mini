const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
  name: String, email: String, passwordHash: String, isSuperAdmin: Boolean, active: Boolean,
});
const Admin = mongoose.model('Admin', adminSchema);

async function checkAdmins() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mindmirror2');
    console.log('Connected to MongoDB');
    const admins = await Admin.find({});
    console.log('Total admins:', admins.length);
    admins.forEach(a => console.log(`- ${a.name} (${a.email})`));
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmins();