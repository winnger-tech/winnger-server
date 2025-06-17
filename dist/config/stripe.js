const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const createPaymentIntent = async (amount, currency = 'usd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true
      }
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};
const verifyPaymentIntent = async paymentIntentId => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    throw error;
  }
};
module.exports = {
  stripe,
  createPaymentIntent,
  verifyPaymentIntent
};