import mongoose from 'mongoose';
import User from '../models/User.js';

// Protect middleware - ensures user is authenticated
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