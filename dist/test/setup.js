// Basic test setup for Jest
require('dotenv').config();

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.CERTN_API_KEY = 'test-certn-key';
process.env.API_URL = 'http://localhost:3000';