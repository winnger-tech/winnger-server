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
  body('businessPhone').optional().matches(/^\+?1?\d{10,14}$/).withMessage('Valid business phone number format required'),
  body('postalCode').optional().matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/).withMessage('Valid postal code required'),
  body('province').optional().isIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']).withMessage('Valid province required'),
  body('identificationType').optional().isIn(['licence', 'pr_card', 'passport', 'medical_card', 'provincial_id']).withMessage('Valid identification type required'),
  body('businessType').optional().isIn(['solo', 'corporate']).withMessage('Valid business type required'),
  body('businessEmail').optional().isEmail().withMessage('Valid business email required'),
  body('HSTNumber').optional().isString().withMessage('HST number must be a string'),
  body('bankingInfo.transitNumber').optional().matches(/^\d{5}$/).withMessage('Transit number must be 5 digits'),
  body('bankingInfo.institutionNumber').optional().matches(/^\d{3}$/).withMessage('Institution number must be 3 digits'),
  body('bankingInfo.accountNumber').optional().matches(/^\d{7,12}$/).withMessage('Account number must be 7-12 digits'),
  body('drivingLicenseUrl').optional().isURL().withMessage('Valid URL required for driving license'),
  body('voidChequeUrl').optional().isURL().withMessage('Valid URL required for void cheque'),
  body('HSTdocumentUrl').optional().isURL().withMessage('Valid URL required for HST document'),
  body('foodHandlingCertificateUrl').optional().isURL().withMessage('Valid URL required for food handling certificate'),
  body('articleofIncorporation').optional().isURL().withMessage('Valid URL required for article of incorporation'),
  body('articleofIncorporationExpiryDate').optional().isISO8601().withMessage('Valid date required for article of incorporation expiry'),
  body('foodSafetyCertificateExpiryDate').optional().isISO8601().withMessage('Valid date required for food safety certificate expiry')
];

// Validation for status updates
const validateStatusUpdate = (req, res, next) => {
  const { status, remarks } = req.body;
  
  const validStatuses = ['pending', 'approved', 'rejected'];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be one of: pending, approved, rejected'
    });
  }
  
  if (remarks && typeof remarks !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Remarks must be a string'
    });
  }
  
  if (remarks && remarks.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Remarks cannot exceed 500 characters'
    });
  }
  
  next();
};

// Validation for payment updates
const validatePaymentUpdate = (req, res, next) => {
  const { action } = req.body;
  
  const validActions = ['approve', 'reject', 'retry'];
  
  if (!action || !validActions.includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Action must be one of: approve, reject, retry'
    });
  }
  
  next();
};

// Validation for bulk operations
const validateBulkUpdate = (req, res, next) => {
  const { driverIds, restaurantIds, status, action, remarks } = req.body;
  
  // Check if we're dealing with drivers or restaurants
  const isDriverOperation = req.path.includes('drivers');
  const isRestaurantOperation = req.path.includes('restaurants');
  
  if (isDriverOperation) {
    if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of driver IDs'
      });
    }
    
    if (driverIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update more than 100 drivers at once'
      });
    }
    
    // Validate UUID format for driver IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (const id of driverIds) {
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid driver ID format'
        });
      }
    }
  }
  
  if (isRestaurantOperation) {
    if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of restaurant IDs'
      });
    }
    
    if (restaurantIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update more than 100 restaurants at once'
      });
    }
    
    // Validate UUID format for restaurant IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (const id of restaurantIds) {
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid restaurant ID format'
        });
      }
    }
  }
  
  // Validate status for status updates
  if (req.path.includes('status')) {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: pending, approved, rejected'
      });
    }
    
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Remarks must be a string'
      });
    }
    
    if (remarks && remarks.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Remarks cannot exceed 500 characters'
      });
    }
  }
  
  // Validate action for payment updates
  if (req.path.includes('payment')) {
    const validActions = ['approve', 'reject', 'retry'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be one of: approve, reject, retry'
      });
    }
  }
  
  next();
};

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
  validateRestaurantUpdate: [restaurantUpdateRules, handleValidationErrors],
  validateStatusUpdate,
  validatePaymentUpdate,
  validateBulkUpdate
};
