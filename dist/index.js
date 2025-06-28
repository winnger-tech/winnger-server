const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const {
  connectDB
} = require('./config/database');

// Import routes
const testRoutes = require('./routes/test');
const adminRoutes = require('./routes/adminRoutes');
const driverRoutes = require('./routes/driverRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const driverStagedRoutes = require('./routes/driverStagedRoutes');
// const { paymentRouter} = require('./routes/paymentRoutes');

// Load env vars
//dotenv.config();

const app = express();

// Define allowed origins
const allowedOrigins = ['http://localhost:3000',
// Client app
'http://localhost:3001',
// Admin app
process.env.CLIENT_URL,
// Production client URL
process.env.ADMIN_URL // Production admin URL
].filter(Boolean); // Remove any undefined values

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  },
  referrerPolicy: {
    policy: "no-referrer"
  }
}));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow specific localhost origins for development
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      // In development, allow all origins
      return callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Credentials', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Endpoint logging middleware - shows only endpoint hit with status code
app.use((req, res, next) => {
  const start = Date.now();

  // Log response with status code
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    console.log(`🌐 ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    originalSend.call(this, data);
  };
  next();
});

// Handle preflight requests
app.options('*', cors());

// Routes
app.use('/api/test', testRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drivers-staged', driverStagedRoutes);

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
const PORT = 5001;

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