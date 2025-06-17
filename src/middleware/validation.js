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

module.exports = {
  handleValidationErrors,
  driverValidationRules,
  restaurantValidationRules,
  adminValidationRules,
  paymentValidationRules
};
