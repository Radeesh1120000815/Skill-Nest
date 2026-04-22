import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Token generate karanna use karana library eka
import nodemailer from 'nodemailer'; // 🔴 Aluthen ekathu kala: Email yawanna
import { ensureDbConnection } from '../config/db.js';

// Helper function to create the JWT token
const generateToken = (id) => {
  // Check if JWT_SECRET exists to prevent crashes
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing in .env file!");
    return null;
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password, role, batch_details } = req.body;

  try {
    // Ensure we have an active DB connection before querying
    await ensureDbConnection();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    //  normalise role to uppercase to avoid confusion related to multiple roles existing in the system
    const roleMap = {
      'Student': 'STUDENT', 'student': 'STUDENT',
      'Lecturer': 'LECTURER', 'lecturer': 'LECTURER',
      'Admin': 'ADMIN', 'admin': 'ADMIN',
    };
    const normalisedRole = roleMap[role] || role;
    // END OF ADDITION

    // Password hashing (Salting)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role:normalisedRole,
      batch_details
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token (Login)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Make sure DB is connected before querying
    await ensureDbConnection();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let passwordMatches = false;

    // Normal case: hashed password
    if (user.password && user.password.startsWith('$2')) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain-text fallback and automatic migration to hash
      if (user.password === password) {
        passwordMatches = true;
        try {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
        } catch (hashError) {
          console.error('Error upgrading legacy password hash:', hashError.message);
        }
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Optional: if frontend sends selected role, validate role alignment
    const roleMap = {
      student: 'STUDENT',
      lecturer: 'LECTURER',
      admin: 'ADMIN',
    };

    const normalizeRole = (role) => {
      if (!role) return '';
      const raw = String(role).toLowerCase();
      if (raw === 'student' || raw === 'junior' || raw === 'senior' || raw === 'both') return 'STUDENT';
      if (raw === 'lecturer') return 'LECTURER';
      if (raw === 'admin') return 'ADMIN';
      return String(role).toUpperCase();
    };

    const expectedRole = roleMap[req.body.role];
    const actualRole = normalizeRole(user.role);

    if (expectedRole && actualRole !== expectedRole) {
      return res.status(401).json({
        message: `This account is registered as ${actualRole.toLowerCase()}. Please select the correct account type.`,
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (Dashboard Data)
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, user data missing' });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        batch_details: user.batch_details,
        badges: user.badges,
        rating: user.rating,
        headline: user.headline || '',
        bio: user.bio || '',
        skills: user.skills || [],
        interests: user.interests || [],
        industry: user.industry || '',
        languages: user.languages || ['English'],
        profilePublic: user.profilePublic ?? true,
        emailNotif: user.emailNotif ?? true,
        pushNotif: user.pushNotif ?? false
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("getUserProfile Error:", error);
    res.status(500).json({ message: "Server error fetching profile details", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // Update new fields
      user.headline = req.body.headline !== undefined ? req.body.headline : user.headline;
      user.bio      = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.skills   = req.body.skills || user.skills;
      user.interests = req.body.interests || user.interests;
      user.industry = req.body.industry || user.industry;
      user.languages = req.body.languages || user.languages;

      // Update preference fields
      user.profilePublic = req.body.profilePublic !== undefined ? req.body.profilePublic : user.profilePublic;
      user.emailNotif    = req.body.emailNotif    !== undefined ? req.body.emailNotif    : user.emailNotif;
      user.pushNotif     = req.body.pushNotif     !== undefined ? req.body.pushNotif     : user.pushNotif;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        headline: updatedUser.headline,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        interests: updatedUser.interests,
        industry: updatedUser.industry,
        languages: updatedUser.languages,
        batch_details: updatedUser.batch_details,
        badges: updatedUser.badges,
        profilePublic: updatedUser.profilePublic,
        emailNotif: updatedUser.emailNotif,
        pushNotif: updatedUser.pushNotif,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Send Reset Token via Email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // 1. Generate a random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash the token and set to user schema (Token eka 1 hour walin expire wenawa)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour

    await user.save();

    // 3. Email eka yawana link eka (Frontend URL eka)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Note: Danata man link eka console eke print karanawa. 
    // Email yawanna nam 'nodemailer' setup karanna ona.
    console.log(`Password Reset Link: ${resetUrl}`);

    // 🔴 4. Email Sending Logic (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Skill-Nest: Password Reset Request 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4f46e5; margin: 0;">Skill-Nest Platform</h2>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h3 style="color: #111827; margin-top: 0;">Password Reset Request</h3>
            <p style="color: #4b5563; line-height: 1.6;">Hello ${user.name},</p>
            <p style="color: #4b5563; line-height: 1.6;">We received a request to reset your password. Click the secure button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset My Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">If you didn't request this, please safely ignore this email. This link will automatically expire in 1 hour.</p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Update the response message to confirm email was sent
    res.status(200).json({ message: 'Password reset link sent to your email! 📧' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  // Hash the token from the URL to compare with DB
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token expire wela nadda balanawa
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful! You can now login.' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 Aluthen ekathu kala: Log wela inna ayata Dashboard eken password maru karanna
// @desc    Update user password (Logged in users)
// @route   PUT /api/auth/update-password
// @access  Private (Needs Token)
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // req.user._id එන්නේ authMiddleware (protect) එකෙන්
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. පරණ password එක හරිද කියලා check කරනවා
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect! ❌' });
    }

    // 2. හරි නම් අලුත් password එක Hash කරලා save කරනවා
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.status(200).json({ message: 'Password updated successfully! 🔒✨' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update user Kuppi role (junior/senior)
// @route   PUT /api/auth/update-kuppi-role
// @access  Public
export const updateKuppiRole = async (req, res) => {
  const { email, role } = req.body;
  const allowedKuppiRoles = ['junior', 'senior', 'both'];

  if (!allowedKuppiRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid Kuppi role' });
  }

  try {
    // ADD THIS: Never overwrite LECTURER or ADMIN roles
    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: 'User not found' });
    
    if (['LECTURER', 'ADMIN'].includes(existingUser.role)) {
      return res.status(403).json({ message: 'Cannot change role for this account type.' });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { returnDocument: 'after' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
