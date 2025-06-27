const express = require('express');
const router = express.Router();
const driverRoutes = require('./driverRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const driverStagedRoutes = require('./driverStagedRoutes');
const restaurantStagedRoutes = require('./restaurantStagedRoutes');
router.use('/drivers', driverRoutes);
router.use('/restaurants', restaurantRoutes);

// Staged registration routes
router.use('/drivers/staged', driverStagedRoutes);
router.use('/restaurants/staged', restaurantStagedRoutes);
module.exports = router;