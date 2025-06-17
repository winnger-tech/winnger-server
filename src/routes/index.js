const express = require('express');
const router = express.Router();

const driverRoutes = require('./driverRoutes');
const restaurantRoutes = require('./restaurantRoutes');

router.use('/drivers', driverRoutes);
router.use('/restaurants', restaurantRoutes);

module.exports = router; 