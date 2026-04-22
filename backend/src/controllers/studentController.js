// Handles student registration logic
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { ensureDbConnection } from '../config/db.js';

export const registerStudent = async (req, res) => {
  console.log('Student register endpoint hit', req.body, 'DB readyState:', mongoose.connection.readyState);
  try {
    // Make sure DB connection is alive before running any queries
    await ensureDbConnection();

    const { name, email, password, studentId } = req.body;

    // Check for existing user by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      lecturerId: undefined,
      studentId
    });
    await student.save();
    res.status(201).json({ message: 'Student registered successfully', student });
  } catch (error) {
    console.error('Student registration error:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({
      error: error.message,
      dbReadyState: mongoose.connection.readyState
    });
  }
};