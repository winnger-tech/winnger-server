const express = require('express');
const router = express.Router();
const restaurantStagedController = require('../controllers/restaurantStagedController');
const {
  auth
} = require('../middleware/auth');
const {
  validateRestaurantRegistration,
  validateRestaurantLogin,
  validateRestaurantUpdate
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRestaurantRegistration, restaurantStagedController.register);
router.post('/login', validateRestaurantLogin, restaurantStagedController.login);

// Protected routes
router.use(auth); // Apply auth middleware to all routes below

router.get('/profile', restaurantStagedController.getProfile);
router.get('/dashboard', restaurantStagedController.getDashboard);
router.put('/update-stage', validateRestaurantUpdate, restaurantStagedController.updateStage);
router.put('/update-specific-stage', restaurantStagedController.updateSpecificStage);
router.get('/stage/:stage', restaurantStagedController.getStageData);
router.get('/stages', restaurantStagedController.getRegistrationStages);
module.exports = router;