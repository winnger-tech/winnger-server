const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  login,
  getDashboardStats,
  getAllDrivers,
  getAllRestaurants,
  updateDriverStatus,
  updateRestaurantStatus,
  updateDriverPayment,
  updateRestaurantPayment,
  exportData
} = require('../controllers/adminController');
const { Admin } = require('../models');

// Public routes
router.post('/login', login);

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
router.get('/me', protect, async (req, res) => {
  try {
    console.log('🔐 req.admin:', req.admin);
    const admin = await Admin.findById(req.admin.id);
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 