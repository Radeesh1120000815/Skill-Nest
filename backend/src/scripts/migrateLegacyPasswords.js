import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import connectDB_Server from '../config/db.js';

const run = async () => {
  try {
    console.log('🔄 Starting legacy password migration...');

    await connectDB_Server();

    // Find users whose password does NOT look like a bcrypt hash
    const legacyUsers = await User.find({ password: { $not: /^\$2/ } });

    if (!legacyUsers.length) {
      console.log('✅ No legacy plain-text passwords found. Nothing to migrate.');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`Found ${legacyUsers.length} user(s) with legacy passwords. Migrating...`);

    for (const user of legacyUsers) {
      const plainPassword = user.password;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(plainPassword, salt);
      await user.save();
      console.log(`  → Migrated user ${user.email}`);
    }

    console.log('✅ Finished migrating legacy passwords.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during legacy password migration:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
