const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  login,
  register,
  getDashboardStats,
  getAllDrivers,
  getAllRestaurants,
  updateDriverStatus,
  updateRestaurantStatus,
  updateDriverPayment,
  updateRestaurantPayment,
  exportData
} = require('../controllers/adminController');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes - only accessible by authenticated admins
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// Driver routes
router.get('/drivers', getAllDrivers);
router.put('/drivers/:id/status', updateDriverStatus);
router.put('/drivers/:id/payment', updateDriverPayment);

// Restaurant routes
router.get('/restaurants', getAllRestaurants);
router.put('/restaurants/:id/status', updateRestaurantStatus);
router.put('/restaurants/:id/payment', updateRestaurantPayment);

// Export routes
router.get('/export', exportData);

module.exports = router; 