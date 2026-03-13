import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Protect routes - ensures user is logged in
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Senior Check - ensures only Seniors (or those with both roles) can create groups
export const seniorOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'senior' || req.user.role === 'both')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Only Seniors can perform this action' });
  }
};