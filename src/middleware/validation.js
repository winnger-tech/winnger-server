const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const driverValidationRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').matches(/^[0-9]{6}$/).withMessage('Valid 6-digit zip code is required'),
];

const restaurantValidationRules = [
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('restaurantName').trim().notEmpty().withMessage('Restaurant name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').matches(/^[0-9]{6}$/).withMessage('Valid 6-digit zip code is required'),
];

const adminValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
];

const paymentValidationRules = [
  body('type').isIn(['driver', 'restaurant']).withMessage('Invalid registration type'),
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
];

// Staged registration validation rules
const driverRegistrationRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const driverLoginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const driverUpdateRules = [
  // These are optional since we validate based on stage
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('cellNumber').optional().matches(/^\+1-\d{3}-\d{3}-\d{4}$/).withMessage('Valid phone number format required'),
  body('postalCode').optional().matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/).withMessage('Valid postal code required'),
  body('province').optional().isIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']).withMessage('Valid province required')
];

const restaurantRegistrationRules = [
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const restaurantLoginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const restaurantUpdateRules = [
  // These are optional since we validate based on stage
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^\+?1?\d{10,14}$/).withMessage('Valid phone number format required'),
  body('postalCode').optional().matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/).withMessage('Valid postal code required'),
  body('province').optional().isIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']).withMessage('Valid province required')
];

module.exports = {
  handleValidationErrors,
  driverValidationRules,
  restaurantValidationRules,
  adminValidationRules,
  paymentValidationRules,
  // Staged registration exports
  validateDriverRegistration: [driverRegistrationRules, handleValidationErrors],
  validateDriverLogin: [driverLoginRules, handleValidationErrors],
  validateDriverUpdate: [driverUpdateRules, handleValidationErrors],
  validateRestaurantRegistration: [restaurantRegistrationRules, handleValidationErrors],
  validateRestaurantLogin: [restaurantLoginRules, handleValidationErrors],
  validateRestaurantUpdate: [restaurantUpdateRules, handleValidationErrors]
};
