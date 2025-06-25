const jwt = require('jsonwebtoken');
const {Admin, Driver, Restaurant} = require('../models');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔍 Full request headers:', req.headers);
    console.log('🔍 Request method:', req.method);
    console.log('🔍 Request URL:', req.url);

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🟢 Token received:', token);
    }else {
      console.log('🔴 No token found in header');
      console.log('🔴 Authorization header:', req.headers.authorization);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Empty token, not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decoded);

      // Get admin from token
      const admin = await Admin.findByPk(decoded.id);
      console.log("Fetched admin:", admin?.email);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route - Admin not found'
        });
      }

      // Add admin to request object
      req.admin = admin;
      next();
    } catch (err) {
      console.error('❌ JWT verification failed:', err.message);
      console.log('👉 Token received:', token);
      console.log('👉 JWT_SECRET used:', process.env.JWT_SECRET);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - Invalid token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Admin role ${req.admin.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Generic auth middleware for drivers and restaurants
exports.auth = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Based on the type in the token, fetch the appropriate user
      let user;
      if (decoded.type === 'driver') {
        user = await Driver.findByPk(decoded.id);
      } else if (decoded.type === 'restaurant') {
        user = await Restaurant.findByPk(decoded.id);
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type'
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route - User not found'
        });
      }

      // Add user to request object
      req.user = user;
      req.userType = decoded.type;
      next();
    } catch (err) {
      console.error('❌ JWT verification failed:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - Invalid token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
