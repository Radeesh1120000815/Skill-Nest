import 'dotenv/config';
import mongoose from 'mongoose';
import Session from '../models/sessionModel.js';

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing. Add it to backend/.env');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const emptySessionLinkCount = await Session.countDocuments({ sessionLink: '' });
    const emptyTimeCount = await Session.countDocuments({ time: '' });
    const existsSessionLinkCount = await Session.countDocuments({ sessionLink: { $exists: true } });
    const existsTimeCount = await Session.countDocuments({ time: { $exists: true } });

    console.log(`empty sessionLink: ${emptySessionLinkCount}`);
    console.log(`empty time: ${emptyTimeCount}`);
    console.log(`documents with sessionLink field: ${existsSessionLinkCount}`);
    console.log(`documents with time field: ${existsTimeCount}`);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
