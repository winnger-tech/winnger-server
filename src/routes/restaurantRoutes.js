// server/src/routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ‼️ STEP 1: Import the specific middleware, not the entire module
const { restaurantUpload } = require('../middleware/upload');

const {
  registerRestaurant,
  getProfile,
  updateProfile,
  updateRestaurantStatus,
  sendVerificationCode,
  verifyOTP,
  updateMenuItems,
  updateHours,
  updateTaxInfo,
  createPaymentIntent
} = restaurantController;

// Validation middleware for restaurant registration
const validateRestaurantRegistration = [
  body('ownerName').notEmpty().withMessage('Owner name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  
  // NEW: Owner Address Validation (optional)
  body('ownerAddress').optional().notEmpty().withMessage('Owner address cannot be empty if provided'), 
  
  body('identificationType').trim().isIn(['licence', 'pr_card', 'passport', 'medical_card', 'provincial_id'])
    .withMessage('Invalid identification type'),
  body('restaurantName').notEmpty().withMessage('Restaurant name is required'),
  
  // NEW: Business Email Validation (optional)
  body('businessEmail').optional().trim().isEmail().withMessage('Please provide a valid business email if provided'), 
  
  // RENAMED: businessAddress to restaurantAddress
  body('restaurantAddress').notEmpty().withMessage('Restaurant address is required'), 
  body('city').notEmpty().withMessage('City is required'),
  body('province').trim().isIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
    .withMessage('Invalid province'),
  body('postalCode').trim().matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/)
    .withMessage('Invalid postal code format'),
  body('bankingInfo').isString().withMessage('Banking info must be a JSON string'),
  body('taxInfo').isString().withMessage('Tax info must be a JSON string'),
  body('menuDetails').isString().withMessage('Menu details must be a JSON string'),
  body('hoursOfOperation').isString().withMessage('Hours of operation must be a JSON string'),
  body('stripePaymentIntentId').notEmpty().withMessage('Stripe Payment Intent ID is required'),
  
  // NEW: Business Type Validation
  body('businessType').trim().isIn(['Solo proprietor', 'Corporate'])
    .withMessage('Invalid business type. Must be "Solo proprietor" or "Corporate"'),

  // NEW: Expiry Date Validations (optional)
  body('articleOfIncorporationExpiryDate')
    .optional({ checkFalsy: true }) // Allow empty or null, but if present, validate
    .isISO8601().toDate().withMessage('Invalid Article of Incorporation expiry date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Article of Incorporation expiry date cannot be in the past');
      }
      return true;
    }),
  body('foodHandlingCertificateExpiryDate')
    .optional({ checkFalsy: true }) // Allow empty or null, but if present, validate
    .isISO8601().toDate().withMessage('Invalid Food Handling Certificate expiry date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Food Handling Certificate expiry date cannot be in the past');
      }
      return true;
    }),
];

// Email verification routes
router.post('/verify-email', sendVerificationCode);
router.post('/verify-otp', verifyOTP);

// Payment route
router.post('/create-payment-intent', createPaymentIntent);

// Create checkout session for restaurant registration (unchanged)
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, email, restaurantId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Restaurant Registration Fee',
              description: 'One-time registration fee for restaurant partners',
            },
            unit_amount: amount || 5000, // Default to $50.00 if not specified
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/restaurant-registration`,
      metadata: {
        registration_type: 'restaurant',
        email: email,
        restaurantId: restaurantId
      }
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Register new restaurant
router.post(
  '/',
  restaurantUpload,
  validateRestaurantRegistration,
  registerRestaurant
);

// Protected routes (no changes needed here)
//router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.put('/menu', updateMenuItems);
router.put('/hours', updateHours);
router.put('/tax-info', updateTaxInfo);

// Admin routes (no changes needed here)
router.put('/:id/status', updateRestaurantStatus);

module.exports = router;
