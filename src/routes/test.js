const express = require('express');
const router = express.Router();

// Test route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
router.get('/db', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    res.json({
      success: true,
      message: 'Database connection is working!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

module.exports = router;
