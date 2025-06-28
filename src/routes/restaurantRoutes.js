// server/src/routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const { auth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ‼️ STEP 1: Import the specific middleware, not the entire module
const { restaurantUpload } = require('../middleware/upload');

const {
  registerRestaurant,
  login,
  updateStep1,
  updateStep2,
  updateStep3,
  getProfile,
  getRegistrationProgress,
  sendVerificationCode,
  verifyOTP,
  completePayment,
  createPaymentIntent
} = restaurantController;

// Validation middleware for each step
const validateStep1 = [
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('identificationType').optional().isIn(['licence', 'pr_card', 'passport', 'medical_card', 'provincial_id'])
    .withMessage('Invalid identification type'),
  body('ownerAddress').optional().isString().withMessage('Owner address must be a string'),
  body('businessType').optional().isIn(['solo', 'corporate']).withMessage('Invalid business type'),
  body('restaurantName').optional().isString().withMessage('Restaurant name must be a string'),
  body('businessEmail').optional().isEmail().withMessage('Please provide a valid business email'),
  body('businessPhone').optional().isMobilePhone().withMessage('Please provide a valid business phone number'),
  body('restaurantAddress').optional().isString().withMessage('Restaurant address must be a string'),
  body('city').optional().isString().withMessage('City must be a string'),
  body('province').optional().isIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
    .withMessage('Invalid province'),
  body('postalCode').optional().matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/)
    .withMessage('Invalid postal code format')
];

const validateStep2 = [
  body('bankingInfo').optional().isObject().withMessage('Banking info must be an object'),
  body('bankingInfo.transitNumber').optional().isLength({ min: 5, max: 5 }).isNumeric()
    .withMessage('Transit number must be 5 digits'),
  body('bankingInfo.institutionNumber').optional().isLength({ min: 3, max: 3 }).isNumeric()
    .withMessage('Institution number must be 3 digits'),
  body('bankingInfo.accountNumber').optional().isLength({ min: 7, max: 12 }).isNumeric()
    .withMessage('Account number must be 7-12 digits'),
  body('HSTNumber').optional().isString().withMessage('HST number must be a string')
];

// Public routes
router.post('/verify-email', sendVerificationCode);
router.post('/verify-otp', verifyOTP);

// Register new restaurant (basic account)
router.post('/register', [
  body('ownerName').notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], registerRestaurant);

// Login restaurant
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Protected routes
router.use(auth);

// Step 1: Owner & Business Information
router.put('/step1', validateStep1, updateStep1);

// Step 2: Banking & Tax Information
router.put('/step2', validateStep2, updateStep2);

// Step 3: Documents (with file upload)
router.put('/step3', restaurantUpload, updateStep3);

// Profile and progress routes
router.get('/profile', getProfile);
router.get('/progress', getRegistrationProgress);

// Complete payment route
router.post('/complete-payment', completePayment);

// Payment route - use controller method instead of inline implementation
router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;