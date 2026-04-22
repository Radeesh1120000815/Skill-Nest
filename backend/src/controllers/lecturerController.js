// Handles lecturer registration logic
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ensureDbConnection } from '../config/db.js';

export const registerLecturer = async (req, res) => {
  console.log('Lecturer register endpoint hit', req.body, 'DB readyState:', mongoose.connection.readyState);
  try {
    // Ensure DB connection is available before querying/saving
    await ensureDbConnection();

    const { name, email, password, lecturerId } = req.body;

    // Check if lecturer already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password before saving (same as normal register)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Always use lowercase for role
    const lecturer = new User({
      name,
      email,
      password: hashedPassword,
      role: 'LECTURER',
      lecturerId,
    });

    await lecturer.save();
    res.status(201).json({ message: 'Lecturer registered successfully', lecturer });
  } catch (error) {
    console.error('Lecturer registration error:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
    });
    res.status(500).json({ error: error.message, dbReadyState: mongoose.connection.readyState });
  }
};
