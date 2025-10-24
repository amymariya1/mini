import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Admin from './src/models/Admin.js';

dotenv.config();

async function checkDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully\n');

    // Check database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database: ${dbName}\n`);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections in database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    // Check Admin collection
    console.log('👤 ADMIN COLLECTION:');
    const adminCount = await Admin.countDocuments();
    console.log(`   Total admins: ${adminCount}`);
    
    if (adminCount > 0) {
      const admins = await Admin.find({}).select('name email active isSuperAdmin createdAt').limit(5);
      console.log('   Sample admins:');
      admins.forEach(admin => {
        console.log(`   - ${admin.email} | active: ${admin.active} | super: ${admin.isSuperAdmin}`);
      });
    }
    console.log('');

    // Check User collection
    console.log('👥 USER COLLECTION:');
    const userCount = await User.countDocuments();
    console.log(`   Total users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}).select('name email userType isActive isApproved createdAt').limit(10);
      console.log('   Sample users:');
      users.forEach(user => {
        console.log(`   - ${user.email} | type: ${user.userType} | active: ${user.isActive} | approved: ${user.isApproved}`);
      });
    }
    console.log('');

    // Check specific emails from your login attempts
    const testEmails = ['amyzencoder@gmail.com', 'amymariya4@gmail.com', 'amymariyavb@gmail'];
    console.log('🔍 CHECKING SPECIFIC EMAILS:');
    for (const email of testEmails) {
      const admin = await Admin.findOne({ email });
      const user = await User.findOne({ email });
      console.log(`   ${email}:`);
      console.log(`      Admin: ${admin ? '✅ Found' : '❌ Not found'}`);
      console.log(`      User: ${user ? '✅ Found' : '❌ Not found'}`);
      if (admin) {
        console.log(`         - active: ${admin.active}, super: ${admin.isSuperAdmin}`);
      }
      if (user) {
        console.log(`         - type: ${user.userType}, active: ${user.isActive}, approved: ${user.isApproved}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
