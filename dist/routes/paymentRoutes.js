const express = require('express');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const paymentRouter = express.Router();
paymentRouter.post('/create-intent', paymentController.createPaymentIntent);
paymentRouter.post('/verify', paymentController.verifyPayment);
paymentRouter.get('/status/:paymentIntentId', paymentController.getPaymentStatus);
paymentRouter.post('/create-checkout', paymentController.createCheckoutSession);
paymentRouter.post('/refund', auth, paymentController.processRefund);
const webhookRouter = express.Router();
webhookRouter.post('/webhook', express.raw({
  type: 'application/json'
}), paymentController.handleWebhook);
module.exports = {
  paymentRouter,
  webhookRouter
};