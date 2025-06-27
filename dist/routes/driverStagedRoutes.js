const express = require('express');
const router = express.Router();
const driverStagedController = require('../controllers/driverStagedController');
const {
  auth
} = require('../middleware/auth');
const {
  validateDriverRegistration,
  validateDriverLogin,
  validateDriverUpdate
} = require('../middleware/validation');

// Public routes
router.post('/register', validateDriverRegistration, driverStagedController.register);
router.post('/login', validateDriverLogin, driverStagedController.login);

// Protected routes
router.use(auth); // Apply auth middleware to all routes below

router.get('/profile', driverStagedController.getProfile);
router.get('/dashboard', driverStagedController.getDashboard);
router.get('/stages', driverStagedController.getRegistrationStages);
router.get('/stage/:stage', driverStagedController.getStageData);

// Stage-specific update routes
router.put('/stage/1', validateDriverUpdate, driverStagedController.updateStage1);
router.put('/stage/2', validateDriverUpdate, driverStagedController.updateStage2);
router.put('/stage/3', validateDriverUpdate, driverStagedController.updateStage3);
router.put('/stage/4', validateDriverUpdate, driverStagedController.updateStage4);
router.put('/stage/5', validateDriverUpdate, driverStagedController.updateStage5);

// Legacy routes (keeping for backward compatibility)
router.put('/update-stage', validateDriverUpdate, driverStagedController.updateStage);
router.put('/update-specific-stage', driverStagedController.updateSpecificStage);
module.exports = router;