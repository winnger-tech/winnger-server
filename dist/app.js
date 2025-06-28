const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const adminRoutes = require('./routes/adminRoutes');
const driverRoutes = require('./routes/driverRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const driverStagedRoutes = require('./routes/driverStagedRoutes');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// CORS configuration - Allow all origins explicitly
app.use(cors({
  origin: '*',
  // Explicitly allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Credentials', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request logging middleware - logs all endpoint calls
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Called from ${req.ip || req.connection.remoteAddress}`);
  next();
});

// Handle preflight requests
app.options('*', cors());

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/restaurants', restaurantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
module.exports = app;