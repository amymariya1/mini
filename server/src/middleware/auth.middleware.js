import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

// JWT Authentication middleware
export async function authenticateJWT(req, res, next) {
  try {
    console.log('Authentication middleware called');
    console.log('Authorization header:', req.headers.authorization);
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted from header:', token);
    }

    // If no token found, return error
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    console.log('Verifying token with JWT_SECRET');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Find user by ID from token
    const user = await User.findById(decoded.id);
    console.log('User found from token:', user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT Authentication error:', err);
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token.'
    });
  }
}

// Restrict middleware - ensures user has specific role
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Please log in first'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action'
      });
    }

    next();
  };
}

// Protect middleware - ensures user is authenticated (keeping the original for backward compatibility)
export async function protect(req, res, next) {
  try {
    // Get user info from headers (same pattern as other routes)
    const email = req.headers['x-user-email'];
    const userIdHeader = req.headers['x-user-id'];

    // Validate that we have at least an email
    if (!email) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Email header required' 
      });
    }

    let user = null;
    
    // Try to find user by ID first (more secure)
    if (userIdHeader && mongoose.isValidObjectId(userIdHeader)) {
      user = await User.findById(userIdHeader);
    } 
    // Fallback to finding by email
    else if (email) {
      user = await User.findOne({ email });
    }

    // If no user found, return unauthorized
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: User not found' 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
}