// server/src/routes/driverRoutes.js

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const {
  Driver
} = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Register route - now accepts document URLs directly
router.post('/register', driverController.register);

// --- All other routes ---
router.post('/confirm-payment', driverController.confirmPayment);
router.post('/background-check-webhook', driverController.handleBackgroundCheckWebhook);

// Check registration status
router.get('/registration-status/:driverId', driverController.checkRegistrationStatus);

// Get driver by ID
router.get('/:driverId', driverController.getDriverById);
router.post('/create-payment-intent', async (req, res) => {
  console.log("Received body:", req.body);
  try {
    const {
      driverId
    } = req.body;
    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({
        error: 'Driver not found'
      });
    }
    if (driver.stripePaymentIntentId) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(driver.stripePaymentIntentId);
        if (existingIntent.status === 'requires_payment_method' || existingIntent.status === 'requires_confirmation') {
          return res.json({
            clientSecret: existingIntent.client_secret
          });
        }
      } catch (error) {
        console.log('Failed to retrieve existing payment intent, creating new one');
      }
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 6500,
      // $65 CAD in cents
      currency: 'cad',
      payment_method_types: ['card'],
      metadata: {
        driverId: driverId,
        type: 'driver_registration',
        email: driver.email
      }
    });
    await driver.update({
      stripePaymentIntentId: paymentIntent.id
    });
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});
module.exports = router;