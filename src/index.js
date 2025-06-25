const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');

const helmet = require('helmet');
const { connectDB } = require('./config/database');

// Import routes
const testRoutes = require('./routes/test');
const adminRoutes = require('./routes/adminRoutes');
const driverRoutes = require('./routes/driverRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');

// Load env vars
//dotenv.config();

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',  // Client app
  'http://localhost:3001',  // Admin app
  process.env.CLIENT_URL,   // Production client URL
  process.env.ADMIN_URL     // Production admin URL
].filter(Boolean); // Remove any undefined values

// Middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/test', testRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Test API at: http://localhost:${PORT}/api/test`);
      console.log(`Test DB connection at: http://localhost:${PORT}/api/test/db`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
