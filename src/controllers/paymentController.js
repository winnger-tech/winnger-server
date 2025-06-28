const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Driver, Restaurant } = require('../models');
const { sendPaymentReceipt } = require('../utils/email');

class PaymentController {
  constructor() {
    this.stripe = stripe;
    
    // Bind methods to ensure proper 'this' context
    this.createPaymentIntent = this.createPaymentIntent.bind(this);
    this.verifyPayment = this.verifyPayment.bind(this);
    this.getPaymentStatus = this.getPaymentStatus.bind(this);
    this.createCheckoutSession = this.createCheckoutSession.bind(this);
    this.handleWebhook = this.handleWebhook.bind(this);
    this.processRefund = this.processRefund.bind(this);
  }

  // @desc    Create payment intent
  // @route   POST /api/payments/create-intent
  // @access  Public
  async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'usd', userType, userId, metadata = {} } = req.body;

      // Validate required fields
      if (!amount || !userType || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Amount, userType, and userId are required'
        });
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          userType,
          userId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
        error: error.message
      });
    }
  }

  // @desc    Verify payment with Stripe
  // @route   POST /api/payments/verify
  // @access  Public
  async verifyPayment(req, res) {
    try {
      const { paymentIntentId, userId, userType } = req.body;

      // Validate required fields
      if (!paymentIntentId || !userId || !userType) {
        return res.status(400).json({
          success: false,
          message: 'Payment intent ID, user ID, and user type are required'
        });
      }

      // Verify payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent) {
        return res.status(404).json({
          success: false,
          message: 'Payment intent not found'
        });
      }

      // Check if payment was successful
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: `Payment not completed. Status: ${paymentIntent.status}`,
          status: paymentIntent.status
        });
      }

      // Verify metadata matches
      if (paymentIntent.metadata.userId !== userId || paymentIntent.metadata.userType !== userType) {
        return res.status(400).json({
          success: false,
          message: 'Payment metadata mismatch'
        });
      }

      // Update user's payment status
      const Model = userType === 'driver' ? Driver : Restaurant;
      const user = await Model.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `${userType} not found`
        });
      }

      // Update payment status
      await user.update({
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentIntentId,
        paymentAmount: paymentIntent.amount / 100,
        paymentDate: new Date()
      });

      // Send payment receipt
      try {
        await sendPaymentReceipt({
          email: user.email,
          name: user.businessName || `${user.firstName} ${user.lastName}`,
          amount: paymentIntent.amount / 100,
          transactionId: paymentIntentId,
          type: userType
        });
      } catch (emailError) {
        console.error('Failed to send payment receipt:', emailError);
        // Don't fail the verification if email fails
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        transactionId: paymentIntentId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        error: error.message
      });
    }
  }

  // @desc    Get payment status
  // @route   GET /api/payments/status/:paymentIntentId
  // @access  Public
  async getPaymentStatus(req, res) {
    try {
      const { paymentIntentId } = req.params;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment intent ID is required'
        });
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent) {
        return res.status(404).json({
          success: false,
          message: 'Payment intent not found'
        });
      }

      res.status(200).json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata
      });
    } catch (error) {
      console.error('Error getting payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
        error: error.message
      });
    }
  }

  // @desc    Create checkout session
  // @route   POST /api/payments/create-checkout
  // @access  Public
  async createCheckoutSession(req, res) {
    try {
      const { 
        amount, 
        currency = 'usd', 
        userType, 
        userId, 
        successUrl, 
        cancelUrl,
        metadata = {} 
      } = req.body;

      // Validate required fields
      if (!amount || !userType || !userId || !successUrl || !cancelUrl) {
        return res.status(400).json({
          success: false,
          message: 'Amount, userType, userId, successUrl, and cancelUrl are required'
        });
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `${userType} Registration Fee`,
                description: `Registration fee for ${userType}`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userType,
          userId,
          ...metadata
        },
      });

      res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create checkout session',
        error: error.message
      });
    }
  }

  // @desc    Handle Stripe webhook
  // @route   POST /api/payments/webhook
  // @access  Public
  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }

  // Handle successful payment intent
  async handlePaymentIntentSucceeded(paymentIntent) {
    const { userType, userId } = paymentIntent.metadata;
    
    if (!userType || !userId) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    const Model = userType === 'driver' ? Driver : Restaurant;
    const user = await Model.findByPk(userId);

    if (user) {
      await user.update({
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentIntent.id,
        paymentAmount: paymentIntent.amount / 100,
        paymentDate: new Date()
      });

      // Send payment receipt
      try {
        await sendPaymentReceipt({
          email: user.email,
          name: user.businessName || `${user.firstName} ${user.lastName}`,
          amount: paymentIntent.amount / 100,
          transactionId: paymentIntent.id,
          type: userType
        });
      } catch (emailError) {
        console.error('Failed to send payment receipt:', emailError);
      }
    }
  }

  // Handle failed payment intent
  async handlePaymentIntentFailed(paymentIntent) {
    const { userType, userId } = paymentIntent.metadata;
    
    if (!userType || !userId) {
      console.error('Missing metadata in payment intent:', paymentIntent.id);
      return;
    }

    const Model = userType === 'driver' ? Driver : Restaurant;
    const user = await Model.findByPk(userId);

    if (user) {
      await user.update({
        paymentStatus: 'failed',
        stripePaymentIntentId: paymentIntent.id
      });
    }
  }

  // Handle completed checkout session
  async handleCheckoutSessionCompleted(session) {
    const { userType, userId } = session.metadata;
    
    if (!userType || !userId) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    const Model = userType === 'driver' ? Driver : Restaurant;
    const user = await Model.findByPk(userId);

    if (user) {
      await user.update({
        paymentStatus: 'completed',
        stripePaymentIntentId: session.payment_intent,
        paymentAmount: session.amount_total / 100,
        paymentDate: new Date()
      });

      // Send payment receipt
      try {
        await sendPaymentReceipt({
          email: user.email,
          name: user.businessName || `${user.firstName} ${user.lastName}`,
          amount: session.amount_total / 100,
          transactionId: session.payment_intent,
          type: userType
        });
      } catch (emailError) {
        console.error('Failed to send payment receipt:', emailError);
      }
    }
  }

  // @desc    Process refund
  // @route   POST /api/payments/refund
  // @access  Private
  async processRefund(req, res) {
    try {
      const { paymentIntentId, amount, reason } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment intent ID is required'
        });
      }

      const refundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      if (reason) {
        refundData.reason = reason;
      }

      const refund = await this.stripe.refunds.create(refundData);

      res.status(200).json({
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      });
    } catch (error) {
      console.error('Refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController(); 