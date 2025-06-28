const express = require('express');
const router = express.Router();
const {
  protect,
  authorize
} = require('../middleware/auth');
const {
  validateStatusUpdate,
  validatePaymentUpdate,
  validateBulkUpdate
} = require('../middleware/validation');
const {
  login,
  register,
  getDashboardStats,
  getAllDrivers,
  getAllRestaurants,
  getDriverById,
  getRestaurantById,
  getAllDriversDetailed,
  getAllRestaurantsDetailed,
  updateDriverStatus,
  updateRestaurantStatus,
  updateDriverPayment,
  bulkUpdateDriverStatus,
  bulkUpdateRestaurantStatus,
  bulkUpdateDriverPayment,
  exportData,
  getAllAdmins,
  getAdminById
} = require('../controllers/adminController');
const {
  Admin
} = require('../models');

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
router.get('/drivers/detailed', getAllDriversDetailed);
router.get('/drivers/:id', getDriverById);
router.put('/drivers/:id/status', validateStatusUpdate, updateDriverStatus);
router.put('/drivers/:id/payment', validatePaymentUpdate, updateDriverPayment);
router.put('/drivers/bulk/status', validateBulkUpdate, bulkUpdateDriverStatus);
router.put('/drivers/bulk/payment', validateBulkUpdate, bulkUpdateDriverPayment);

// Restaurant routes
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/detailed', getAllRestaurantsDetailed);
router.get('/restaurants/:id', getRestaurantById);
router.put('/restaurants/:id/status', validateStatusUpdate, updateRestaurantStatus);
router.put('/restaurants/bulk/status', validateBulkUpdate, bulkUpdateRestaurantStatus);

// Admin management routes
router.get('/admins', getAllAdmins);
router.get('/admins/:id', getAdminById);

// Export routes
router.get('/export', exportData);
router.get('/me', protect, async (req, res) => {
  try {
    console.log('🔐 req.admin:', req.admin);
    const admin = await Admin.findByPk(req.admin.id);
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