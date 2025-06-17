const { Sequelize } = require('sequelize');
const express = require('express');
const multer = require('multer');

// Mock Sequelize
jest.mock('sequelize');

// Mock multer
jest.mock('multer', () => {
  const multer = () => {
    const middleware = (req, res, next) => {
      // Process files from .attach() calls
      if (!req.files) req.files = {};

      // Process form fields
      if (!req.body) req.body = {};
      if (req._body) {
        Object.keys(req._body).forEach(key => {
          req.body[key] = req._body[key];
        });
      }

      next();
    };

    middleware.fields = (fields) => (req, res, next) => {
      // Initialize files object if not exists
      if (!req.files) req.files = {};

      // Process files based on field definitions
      fields.forEach(field => {
        if (field.maxCount > 0 && !req.files[field.name]) {
          req.files[field.name] = [{
            buffer: Buffer.from('test'),
            mimetype: 'application/pdf',
            filename: `${field.name}.pdf`,
            fieldname: field.name,
            originalname: `${field.name}.pdf`,
            size: 1024,
            path: `/tmp/${field.name}.pdf`
          }];
        }
      });

      // Process form fields
      if (!req.body) req.body = {};
      if (req._body) {
        Object.keys(req._body).forEach(key => {
          req.body[key] = req._body[key];
        });
      }

      next();
    };

    middleware.array = () => middleware;
    middleware.single = () => middleware;
    middleware.none = () => middleware;

    return middleware;
  };

  multer.memoryStorage = () => ({});
  return multer;
});

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockS3Instance = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({
      Location: 'https://test-bucket.s3.amazonaws.com/test.pdf',
      Key: 'test/test.pdf'
    })
  };

  return {
    S3: jest.fn(() => mockS3Instance)
  };
});

// Mock email sending
jest.mock('../utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  emailTemplates: {
    registrationSuccess: jest.fn().mockReturnValue('<h1>Success</h1>'),
    applicationStatus: jest.fn().mockReturnValue('<h1>Status Update</h1>')
  }
}));

// Global test data
global.validDriver = {
  fullName: 'Test Driver',
  email: 'test@driver.com',
  phone: '1234567890',
  address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345'
  }
};

global.validRestaurant = {
  ownerName: 'Test Owner',
  email: 'test@restaurant.com',
  phone: '1234567890',
  restaurantName: 'Test Restaurant',
  address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345'
  }
};

// Mock models
jest.mock('../models/Driver', () => {
  const mockDriver = {
    _id: 'test-driver-id',
    fullName: 'Test Driver',
    email: 'test@driver.com',
    phone: '1234567890',
    status: 'pending',
    save: jest.fn()
  };
  mockDriver.save.mockResolvedValue(mockDriver);

  return {
    create: jest.fn().mockResolvedValue(mockDriver),
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(mockDriver),
    destroy: jest.fn().mockResolvedValue(true)
  };
});

jest.mock('../models/Restaurant', () => {
  const mockRestaurant = {
    _id: 'test-restaurant-id',
    ownerName: 'Test Owner',
    email: 'test@restaurant.com',
    phone: '1234567890',
    restaurantName: 'Test Restaurant',
    status: 'pending',
    save: jest.fn()
  };
  mockRestaurant.save.mockResolvedValue(mockRestaurant);

  return {
    create: jest.fn().mockResolvedValue(mockRestaurant),
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(mockRestaurant),
    destroy: jest.fn().mockResolvedValue(true)
  };
});

// Mock S3 upload
jest.mock('../utils/s3', () => ({
  uploadFile: jest.fn().mockResolvedValue({
    url: 'https://test-bucket.s3.amazonaws.com/test-file',
    key: 'test-key'
  })
}));

// Mock email sending
jest.mock('../utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  emailTemplates: {
    registrationSuccess: jest.fn().mockReturnValue('Registration successful'),
    applicationStatus: jest.fn().mockReturnValue('Status updated'),
    paymentReceipt: jest.fn().mockReturnValue('Payment receipt')
  }
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      role: 'admin'
    };
    next();
  }
}));

// Test data
global.validDriver = {
  fullName: 'Test Driver',
  email: 'test@driver.com',
  phone: '1234567890',
  address: JSON.stringify({
    street: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345'
  })
};

global.validRestaurant = {
  ownerName: 'Test Owner',
  email: 'test@restaurant.com',
  phone: '1234567890',
  restaurantName: 'Test Restaurant',
  address: JSON.stringify({
    street: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345'
  })
};
