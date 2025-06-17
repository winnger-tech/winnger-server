const request = require('supertest');
const express = require('express');
const Driver = require('../models/Driver');
const {
  uploadFile
} = require('../utils/s3');
const {
  sendEmail
} = require('../utils/email');
const driverRoutes = require('../routes/drivers');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use('/api/drivers', driverRoutes);

// Import test setup
require('./setup');
describe('Driver Registration API', () => {
  beforeEach(() => {
    // Clear mocks before each test
    uploadFile.mockClear();
    sendEmail.mockClear();
    Driver.findOne.mockReset();
    Driver.findById.mockReset();
  });
  afterEach(async () => {
    // Clean up test data
    await Driver.destroy({
      where: {}
    });
  });
  describe('POST /api/drivers', () => {
    it('should register a new driver with valid data', async () => {
      // Mock findOne to return null (no existing driver)
      Driver.findOne.mockResolvedValue(null);
      const res = await request(app).post('/api/drivers').field('fullName', validDriver.fullName).field('email', validDriver.email).field('phone', validDriver.phone).field('address', JSON.stringify(validDriver.address)).attach('aadharCard', Buffer.from('test'), {
        filename: 'aadhar.pdf',
        contentType: 'application/pdf'
      }).attach('drivingLicense', Buffer.from('test'), {
        filename: 'license.pdf',
        contentType: 'application/pdf'
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.email).toBe(validDriver.email);
      expect(uploadFile).toHaveBeenCalledTimes(2);
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });
    it('should not register a driver with existing email', async () => {
      // Mock findOne to return an existing driver
      Driver.findOne.mockResolvedValue({
        email: validDriver.email
      });
      const res = await request(app).post('/api/drivers').field('fullName', validDriver.fullName).field('email', validDriver.email).field('phone', validDriver.phone).field('address', JSON.stringify(validDriver.address)).attach('aadharCard', Buffer.from('test'), {
        filename: 'aadhar.pdf',
        contentType: 'application/pdf'
      }).attach('drivingLicense', Buffer.from('test'), {
        filename: 'license.pdf',
        contentType: 'application/pdf'
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Driver with this email already exists');
    });
    it('should require all mandatory fields', async () => {
      const res = await request(app).post('/api/drivers').field('email', validDriver.email).attach('aadharCard', Buffer.from('test'), {
        filename: 'aadhar.pdf',
        contentType: 'application/pdf'
      }).attach('drivingLicense', Buffer.from('test'), {
        filename: 'license.pdf',
        contentType: 'application/pdf'
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide all required fields');
    });
    it('should require both document uploads', async () => {
      const res = await request(app).post('/api/drivers').field('fullName', validDriver.fullName).field('email', validDriver.email).field('phone', validDriver.phone).field('address', JSON.stringify(validDriver.address)).attach('aadharCard', Buffer.from('test'), {
        filename: 'aadhar.pdf',
        contentType: 'application/pdf'
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please upload all required documents');
    });
  });
  describe('PUT /api/drivers/:id/payment', () => {
    const mockDriver = {
      _id: 'test-driver-id',
      email: validDriver.email,
      save: jest.fn().mockResolvedValue({})
    };
    it('should update payment status successfully', async () => {
      Driver.findById.mockResolvedValue(mockDriver);
      const paymentData = {
        transactionId: 'test_tx_123',
        amount: 50
      };
      const res = await request(app).put(`/api/drivers/${mockDriver._id}/payment`).send(paymentData);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Payment Receipt'
      }));
    });
    it('should not update payment for non-existent driver', async () => {
      Driver.findById.mockResolvedValue(null);
      const res = await request(app).put('/api/drivers/nonexistent-id/payment').send({
        transactionId: 'test_tx_123',
        amount: 50
      });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
  describe('PUT /api/drivers/:id/status', () => {
    const mockDriver = {
      _id: 'test-driver-id',
      email: validDriver.email,
      save: jest.fn().mockResolvedValue({})
    };
    it('should update driver status successfully', async () => {
      Driver.findById.mockResolvedValue(mockDriver);
      const res = await request(app).put(`/api/drivers/${mockDriver._id}/status`).send({
        status: 'approved'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Application Status Update'
      }));
    });
    it('should validate status values', async () => {
      Driver.findById.mockResolvedValue(mockDriver);
      const res = await request(app).put(`/api/drivers/${mockDriver._id}/status`).send({
        status: 'invalid-status'
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});