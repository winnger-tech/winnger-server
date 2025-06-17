const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Security middleware
const securityMiddleware = [
// Set security headers
helmet(),
// Rate limiting
limiter,
// Prevent XSS attacks
xss(),
// Prevent HTTP Parameter Pollution
hpp(),
// CORS configuration
(req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}];
module.exports = securityMiddleware;