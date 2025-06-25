const express = require('express');
const router = express.Router();
const driverStagedController = require('../controllers/driverStagedController');
const { auth } = require('../middleware/auth');
const { validateDriverRegistration, validateDriverLogin, validateDriverUpdate } = require('../middleware/validation');

// Public routes
router.post('/register', validateDriverRegistration, driverStagedController.register);
router.post('/login', validateDriverLogin, driverStagedController.login);

// Protected routes
router.use(auth); // Apply auth middleware to all routes below

router.get('/profile', driverStagedController.getProfile);
router.get('/dashboard', driverStagedController.getDashboard);
router.put('/update-stage', validateDriverUpdate, driverStagedController.updateStage);
router.put('/update-specific-stage', driverStagedController.updateSpecificStage);
router.get('/stage/:stage', driverStagedController.getStageData);
router.get('/stages', driverStagedController.getRegistrationStages);

module.exports = router;
