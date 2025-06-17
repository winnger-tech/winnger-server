const crypto = require('crypto');
const {
  sendOTP
} = require('../utils/email');

// Store OTPs in memory (in production, use Redis or similar)
const otpStore = new Map();
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const sendVerificationOTP = async (req, res, next) => {
  try {
    const {
      email
    } = req.body;
    const otp = generateOTP();

    // Store OTP with expiry (10 minutes)
    otpStore.set(email, {
      otp,
      expiry: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send OTP via email
    await sendOTP({
      email,
      otp
    });
    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('OTP sending failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};
const verifyOTP = async (req, res, next) => {
  try {
    const {
      email,
      otp
    } = req.body;
    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email'
      });
    }
    if (Date.now() > storedData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP verified successfully
    otpStore.delete(email);
    req.otpVerified = true;
    next();
  } catch (error) {
    console.error('OTP verification failed:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
};
module.exports = {
  sendVerificationOTP,
  verifyOTP
};