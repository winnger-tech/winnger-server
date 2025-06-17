const request = require('supertest');
const express = require('express');
const Restaurant = require('../models/Restaurant');
const { uploadFile } = require('../utils/s3');
const { sendEmail } = require('../utils/email');
const restaurantRoutes = require('../routes/restaurants');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/restaurants', restaurantRoutes);

// Import test setup
require('./setup');

describe('Restaurant Registration API', () => {
  beforeEach(() => {
    // Clear mocks before each test
    uploadFile.mockClear();
    sendEmail.mockClear();
    Restaurant.findOne.mockReset();
    Restaurant.findById.mockReset();
  });

  afterEach(async () => {
    // Clean up test data
    await Restaurant.destroy({ where: {} });
  });

  describe('POST /api/restaurants', () => {
    const validRestaurant = {
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

    it('should register a new restaurant with valid data', async () => {
      // Mock findOne to return null (no existing restaurant)
      Restaurant.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/restaurants')
        .field('ownerName', validRestaurant.ownerName)
        .field('email', validRestaurant.email)
        .field('phone', validRestaurant.phone)
        .field('restaurantName', validRestaurant.restaurantName)
        .field('address', JSON.stringify(validRestaurant.address))
        .attach('fssai', Buffer.from('test'), { filename: 'fssai.pdf', contentType: 'application/pdf' })
        .attach('gst', Buffer.from('test'), { filename: 'gst.pdf', contentType: 'application/pdf' })
        .attach('pan', Buffer.from('test'), { filename: 'pan.pdf', contentType: 'application/pdf' })
        .attach('businessLicense', Buffer.from('test'), { filename: 'license.pdf', contentType: 'application/pdf' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.email).toBe(validRestaurant.email);
      expect(uploadFile).toHaveBeenCalledTimes(4);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should not register a restaurant with existing email', async () => {
      // Mock findOne to return an existing restaurant
      Restaurant.findOne.mockResolvedValue({ email: validRestaurant.email });

      const res = await request(app)
        .post('/api/restaurants')
        .field('ownerName', validRestaurant.ownerName)
        .field('email', validRestaurant.email)
        .field('phone', validRestaurant.phone)
        .field('restaurantName', validRestaurant.restaurantName)
        .field('address', JSON.stringify(validRestaurant.address))
        .attach('fssai', Buffer.from('test'), { filename: 'fssai.pdf', contentType: 'application/pdf' })
        .attach('gst', Buffer.from('test'), { filename: 'gst.pdf', contentType: 'application/pdf' })
        .attach('pan', Buffer.from('test'), { filename: 'pan.pdf', contentType: 'application/pdf' })
        .attach('businessLicense', Buffer.from('test'), { filename: 'license.pdf', contentType: 'application/pdf' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Restaurant with this email already exists');
    });

    it('should require all mandatory fields', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .field('email', validRestaurant.email)
        .attach('fssai', Buffer.from('test'), { filename: 'fssai.pdf', contentType: 'application/pdf' })
        .attach('gst', Buffer.from('test'), { filename: 'gst.pdf', contentType: 'application/pdf' })
        .attach('pan', Buffer.from('test'), { filename: 'pan.pdf', contentType: 'application/pdf' })
        .attach('businessLicense', Buffer.from('test'), { filename: 'license.pdf', contentType: 'application/pdf' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide all required fields');
    });

    it('should require all document uploads', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .field('ownerName', validRestaurant.ownerName)
        .field('email', validRestaurant.email)
        .field('phone', validRestaurant.phone)
        .field('restaurantName', validRestaurant.restaurantName)
        .field('address', JSON.stringify(validRestaurant.address))
        .attach('fssai', Buffer.from('test'), { filename: 'fssai.pdf', contentType: 'application/pdf' })
        .attach('gst', Buffer.from('test'), { filename: 'gst.pdf', contentType: 'application/pdf' })
        .attach('pan', Buffer.from('test'), { filename: 'pan.pdf', contentType: 'application/pdf' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please upload all required documents');
    });
  });

  describe('PUT /api/restaurants/:id/payment', () => {
    const mockRestaurant = {
      _id: 'test-restaurant-id',
      email: 'test@restaurant.com',
      save: jest.fn().mockResolvedValue({})
    };

    it('should update payment status successfully', async () => {
      Restaurant.findById.mockResolvedValue(mockRestaurant);

      const paymentData = {
        transactionId: 'test_tx_123',
        amount: 100
      };

      const res = await request(app)
        .put(`/api/restaurants/${mockRestaurant._id}/payment`)
        .send(paymentData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Payment Receipt'
        })
      );
    });

    it('should not update payment for non-existent restaurant', async () => {
      Restaurant.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/restaurants/nonexistent-id/payment')
        .send({
          transactionId: 'test_tx_123',
          amount: 100
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/restaurants/:id/status', () => {
    const mockRestaurant = {
      _id: 'test-restaurant-id',
      email: 'test@restaurant.com',
      save: jest.fn().mockResolvedValue({})
    };

    it('should update restaurant status successfully', async () => {
      Restaurant.findById.mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .put(`/api/restaurants/${mockRestaurant._id}/status`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Application Status Update'
        })
      );
    });

    it('should validate status values', async () => {
      Restaurant.findById.mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .put(`/api/restaurants/${mockRestaurant._id}/status`)
        .send({ status: 'invalid-status' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
