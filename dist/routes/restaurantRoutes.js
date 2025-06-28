// server/src/routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const {
  body
} = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const {
  auth
} = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ‼️ STEP 1: Import the specific middleware, not the entire module
const {
  restaurantUpload
} = require('../middleware/upload');
const {
  registerRestaurant,
  login,
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  getProfile,
  getRegistrationProgress,
  getRegistrationSummary,
  getStepValidation,
  sendVerificationCode,
  verifyOTP,
  completePayment,
  createPaymentIntent,
  updateProfile,
  updateMenuItems,
  updateHours,
  updateTaxInfo,
  updateRestaurantStatus,
  updatePaymentStatus
} = restaurantController;

// Validation middleware for each step
const validateStep1 = [body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'), body('identificationType').optional().isIn(['licence', 'pr_card', 'passport', 'medical_card', 'provincial_id']).withMessage('Invalid identification type'), body('ownerAddress').optional().isString().withMessage('Owner address must be a string'), body('businessType').optional().isIn(['solo', 'corporate']).withMessage('Invalid business type'), body('restaurantName').optional().isString().withMessage('Restaurant name must be a string'), body('businessEmail').optional().isEmail().withMessage('Please provide a valid business email'), body('businessPhone').optional().isMobilePhone().withMessage('Please provide a valid business phone number'), body('restaurantAddress').optional().isString().withMessage('Restaurant address must be a string'), body('city').optional().isString().withMessage('City must be a string'), body('province').optional().isIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']).withMessage('Invalid province'), body('postalCode').optional().matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/).withMessage('Invalid postal code format')];
const validateStep2 = [body('bankingInfo').optional().isObject().withMessage('Banking info must be an object'), body('bankingInfo.transitNumber').optional().isLength({
  min: 5,
  max: 5
}).isNumeric().withMessage('Transit number must be 5 digits'), body('bankingInfo.institutionNumber').optional().isLength({
  min: 3,
  max: 3
}).isNumeric().withMessage('Institution number must be 3 digits'), body('bankingInfo.accountNumber').optional().isLength({
  min: 7,
  max: 12
}).isNumeric().withMessage('Account number must be 7-12 digits'), body('HSTNumber').optional().isString().withMessage('HST number must be a string')];
const validateStep4 = [body('agreedToTerms').isBoolean().withMessage('Agreement to terms is required'), body('confirmationChecked').isBoolean().withMessage('Confirmation is required'), body('additionalNotes').optional().isString().withMessage('Additional notes must be a string')];
const validateStep5 = [body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'), body('stripePaymentMethodId').optional().isString().withMessage('Payment method ID must be a string')];

// Public routes - No authentication required
router.post('/verify-email', sendVerificationCode);
router.post('/verify-otp', verifyOTP);

// Register new restaurant (basic account)
router.post('/register', [body('ownerName').notEmpty().withMessage('Owner name is required'), body('email').isEmail().withMessage('Please provide a valid email'), body('password').isLength({
  min: 6
}).withMessage('Password must be at least 6 characters')], registerRestaurant);

// Login restaurant
router.post('/login', [body('email').isEmail().withMessage('Please provide a valid email'), body('password').notEmpty().withMessage('Password is required')], login);

// Protected routes - Authentication required
router.use(auth);

// Create payment intent for registration fee (requires authentication)
router.post('/create-payment-intent', createPaymentIntent);

// =======================
// REGISTRATION STEPS (1-5)
// =======================

// Step 1: Owner & Business Information
router.put('/step1', validateStep1, updateStep1);

// Step 2: Banking & Tax Information
router.put('/step2', validateStep2, updateStep2);

// Step 3: Documents (with file upload)
router.put('/step3', restaurantUpload, updateStep3);

// Step 4: Review & Confirmation
router.put('/step4', validateStep4, updateStep4);

// Step 5: Payment Processing
router.put('/step5', validateStep5, updateStep5);

// =======================
// PROGRESS & VALIDATION
// =======================

// Get registration progress
router.get('/progress', getRegistrationProgress);

// Get registration summary for step 4 review
router.get('/registration-summary', getRegistrationSummary);

// Get step validation status
router.get('/step-validation/:step', getStepValidation);

// =======================
// PROFILE MANAGEMENT
// =======================

// Get restaurant profile
router.get('/profile', getProfile);

// Update restaurant profile
router.put('/profile', [body('ownerName').optional().isString().withMessage('Owner name must be a string'), body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'), body('restaurantName').optional().isString().withMessage('Restaurant name must be a string'), body('address').optional().isString().withMessage('Address must be a string')], updateProfile);

// =======================
// PAYMENT ROUTES
// =======================

// Complete payment verification
router.post('/complete-payment', [body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required')], completePayment);

// =======================
// RESTAURANT MANAGEMENT
// =======================

// Update menu items
router.put('/:restaurantId/menu', restaurantUpload, updateMenuItems);

// Update hours of operation
router.put('/:restaurantId/hours', [body('hoursOfOperation').isObject().withMessage('Hours of operation must be an object')], updateHours);

// Update tax information
router.put('/:restaurantId/tax-info', [body('taxInfo').isObject().withMessage('Tax info must be an object')], updateTaxInfo);

// =======================
// ADMIN ROUTES
// =======================

// Update restaurant status (Admin only)
router.put('/:id/status', [body('status').isIn(['pending_approval', 'approved', 'rejected', 'suspended']).withMessage('Invalid status value')], updateRestaurantStatus);

// Update payment status (Admin only)
router.put('/:id/payment', [body('transactionId').notEmpty().withMessage('Transaction ID is required'), body('amount').isNumeric().withMessage('Amount must be a number')], updatePaymentStatus);

// =======================
// UTILITY ROUTES
// =======================

// Get step information
router.get('/steps/info/:step', (req, res) => {
  const {
    step
  } = req.params;
  const stepNumber = parseInt(step);
  const stepInfo = {
    1: {
      title: "Owner & Business Information",
      description: "Complete your basic owner and business information",
      fields: ['ownerName', 'phone', 'identificationType', 'ownerAddress', 'businessType', 'restaurantName', 'businessEmail', 'businessPhone', 'restaurantAddress', 'city', 'province', 'postalCode']
    },
    2: {
      title: "Banking & Tax Information",
      description: "Provide your banking information and HST number",
      fields: ['bankingInfo', 'HSTNumber']
    },
    3: {
      title: "Document Uploads",
      description: "Upload required business documents",
      fields: ['drivingLicenseUrl', 'voidChequeUrl', 'HSTdocumentUrl', 'foodHandlingCertificateUrl']
    },
    4: {
      title: "Review & Confirmation",
      description: "Review your information and confirm registration details",
      fields: ['agreedToTerms', 'confirmationChecked']
    },
    5: {
      title: "Payment Processing",
      description: "Complete your registration fee payment",
      fields: ['paymentIntentId', 'paymentStatus']
    }
  };
  if (stepNumber < 1 || stepNumber > 5) {
    return res.status(400).json({
      success: false,
      message: 'Invalid step number'
    });
  }
  res.json({
    success: true,
    data: {
      step: stepNumber,
      ...stepInfo[stepNumber],
      totalSteps: 5
    }
  });
});

// Get all steps overview
router.get('/steps/overview', (req, res) => {
  const stepsOverview = [{
    step: 1,
    title: "Owner & Business Information",
    description: "Complete your basic owner and business information",
    estimatedTime: "5-10 minutes"
  }, {
    step: 2,
    title: "Banking & Tax Information",
    description: "Provide your banking information and HST number",
    estimatedTime: "3-5 minutes"
  }, {
    step: 3,
    title: "Document Uploads",
    description: "Upload required business documents",
    estimatedTime: "5-15 minutes"
  }, {
    step: 4,
    title: "Review & Confirmation",
    description: "Review your information and confirm registration details",
    estimatedTime: "2-5 minutes"
  }, {
    step: 5,
    title: "Payment Processing",
    description: "Complete your registration fee payment ($50 USD)",
    estimatedTime: "2-3 minutes"
  }];
  res.json({
    success: true,
    data: {
      totalSteps: 5,
      estimatedTotalTime: "17-38 minutes",
      registrationFee: {
        amount: 50.00,
        currency: "USD",
        description: "One-time registration fee"
      },
      steps: stepsOverview
    }
  });
});
module.exports = router;