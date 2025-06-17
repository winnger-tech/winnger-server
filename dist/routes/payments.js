const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
  Driver,
  Restaurant
} = require('../models');
const {
  sendPaymentReceipt
} = require('../utils/email');
const auth = require('../middleware/auth');

// Initiate payment
router.post('/initiate', auth, async (req, res) => {
  try {
    const {
      amount,
      currency,
      userType,
      userId
    } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true
      }
    });
    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      paymentId,
      userId,
      userType
    } = req.body;
    const Model = userType === 'driver' ? Driver : Restaurant;
    const record = await Model.findOne({
      where: {
        userId
      }
    });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: `${userType} not found`
      });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    const verified = paymentIntent.status === 'succeeded';
    if (verified) {
      await record.update({
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentId
      });

      // Send payment receipt
      await sendPaymentReceipt({
        email: record.email,
        name: record.businessName || `${record.firstName} ${record.lastName}`,
        amount: record.paymentAmount,
        transactionId: paymentId,
        type: userType
      });
      return res.json({
        success: true,
        transactionId: paymentId
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get payment status
router.get('/status/:type/:userId', auth, async (req, res) => {
  try {
    const {
      type,
      userId
    } = req.params;
    const Model = type === 'driver' ? Driver : Restaurant;
    const record = await Model.findOne({
      where: {
        userId
      }
    });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }
    res.json({
      success: true,
      status: record.paymentStatus
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify Stripe webhook signature
const verifyStripeWebhook = (signature, body) => {
  try {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return null;
  }
};

// Stripe webhook endpoint
router.post('/webhook', express.raw({
  type: 'application/json'
}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = verifyStripeWebhook(sig, req.body);
    if (!event) {
      return res.status(400).send('Webhook signature verification failed');
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const {
          registration_type,
          email,
          restaurantId
        } = session.metadata;

        // Find the corresponding record
        const Model = registration_type === 'driver' ? Driver : Restaurant;
        const record = await Model.findOne({
          where: registration_type === 'driver' ? {
            stripePaymentIntentId: session.payment_intent
          } : {
            id: restaurantId
          }
        });
        if (record) {
          await record.update({
            paymentStatus: 'completed',
            stripePaymentIntentId: session.payment_intent
          });

          // Send payment receipt
          await sendPaymentReceipt({
            email,
            name: record.businessName || `${record.firstName} ${record.lastName}`,
            amount: session.amount_total / 100,
            transactionId: session.payment_intent,
            type: registration_type
          });
        }
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const {
          registration_type: piType,
          email: piEmail
        } = paymentIntent.metadata;

        // Find the corresponding record
        const piModel = piType === 'driver' ? Driver : Restaurant;
        const piRecord = await piModel.findOne({
          where: {
            stripePaymentIntentId: paymentIntent.id
          }
        });
        if (piRecord) {
          // Update payment status
          await piRecord.update({
            paymentStatus: 'completed',
            stripePaymentIntentId: paymentIntent.id
          });

          // Verify the update was successful
          const updatedRecord = await piModel.findOne({
            where: {
              stripePaymentIntentId: paymentIntent.id
            }
          });
          if (updatedRecord && updatedRecord.paymentStatus === 'completed') {
            // Send payment receipt
            await sendPaymentReceipt({
              email: piEmail,
              name: piRecord.businessName || `${piRecord.firstName} ${piRecord.lastName}`,
              amount: paymentIntent.amount / 100,
              transactionId: paymentIntent.id,
              type: piType
            });
          } else {
            console.error('Failed to update payment status for', piType, paymentIntent.id);
          }
        }
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedRecord = await Model.findOne({
          where: {
            stripePaymentIntentId: failedPayment.id
          }
        });
        if (failedRecord) {
          await failedRecord.update({
            paymentStatus: 'failed'
          });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({
      received: true
    });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
module.exports = router;