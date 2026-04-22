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

    const sessionLinkResult = await Session.updateMany(
      { sessionLink: '' },
      { $unset: { sessionLink: 1 } }
    );

    const timeResult = await Session.updateMany(
      { time: '' },
      { $unset: { time: 1 } }
    );

    console.log('Cleanup completed.');
    console.log(`sessionLink removed from ${sessionLinkResult.modifiedCount} documents.`);
    console.log(`time removed from ${timeResult.modifiedCount} documents.`);
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
