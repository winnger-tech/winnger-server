const {
  uploadFile
} = require('../utils/s3');
const {
  sendEmail,
  sendVerificationEmail,
  emailTemplates
} = require('../utils/email');
const BaseController = require('./BaseController');
const {
  Restaurant
} = require('../models');
const {
  sequelize
} = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add in-memory store
const otpStore = new Map();
const emailVerificationStore = new Map();
class RestaurantController extends BaseController {
  constructor() {
    super();
    this.stripe = stripe;
  }

  // Helper method to properly handle completedSteps array
  updateCompletedSteps(currentSteps, stepToAdd) {
    // Ensure currentSteps is an array
    let stepsArray = Array.isArray(currentSteps) ? [...currentSteps] : [];

    // Parse if it's a JSON string
    if (typeof currentSteps === 'string') {
      try {
        stepsArray = JSON.parse(currentSteps);
      } catch (e) {
        stepsArray = [];
      }
    }

    // Ensure it's an array after parsing
    if (!Array.isArray(stepsArray)) {
      stepsArray = [];
    }

    // Add step if not already present
    if (!stepsArray.includes(stepToAdd)) {
      stepsArray.push(stepToAdd);
    }

    // Sort the array to maintain order
    return stepsArray.sort((a, b) => a - b);
  }

  // Helper method to get step information
  getStepInfo(step) {
    const stepInfo = {
      1: {
        title: "Owner & Business Information",
        description: "Complete your basic owner and business information"
      },
      2: {
        title: "Banking & Tax Information",
        description: "Provide your banking information and HST number"
      },
      3: {
        title: "Document Uploads",
        description: "Upload required business documents"
      },
      4: {
        title: "Review & Confirmation",
        description: "Review your information and confirm registration details"
      },
      5: {
        title: "Payment Processing",
        description: "Complete your registration fee payment"
      }
    };
    return stepInfo[step] || {
      title: "Unknown Step",
      description: "Please complete this step to continue"
    };
  }

  // @desc    Register new restaurant (basic account)
  // @route   POST /api/restaurants/register
  // @access  Public
  async registerRestaurant(req, res) {
    try {
      this.validateRequest(req);
      const {
        ownerName,
        email,
        password
      } = req.body;

      // Check if email already exists
      const existingRestaurant = await Restaurant.findOne({
        where: {
          email
        }
      });
      if (existingRestaurant) {
        return this.handleError({
          status: 400,
          message: 'Email already registered'
        }, res);
      }

      // Create restaurant with basic info
      const restaurant = await Restaurant.create({
        ownerName,
        email,
        password,
        currentStep: 1,
        completedSteps: [],
        // Initialize as empty array
        isRegistrationComplete: false
      });
      return this.handleSuccess(res, {
        restaurantId: restaurant.id,
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
        totalSteps: 5,
        message: 'Restaurant account created successfully. Please complete the registration steps.'
      }, 'Restaurant registration successful');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // @desc    Login restaurant
  // @route   POST /api/restaurants/login
  // @access  Public
  async login(req, res) {
    try {
      this.validateRequest(req);
      const {
        email,
        password
      } = req.body;
      if (!email || !password) {
        return this.handleError({
          status: 400,
          message: 'Email and password are required'
        }, res);
      }

      // Find restaurant
      const restaurant = await Restaurant.findOne({
        where: {
          email
        }
      });
      if (!restaurant) {
        return this.handleError({
          status: 401,
          message: 'Invalid credentials'
        }, res);
      }

      // Check password
      const isPasswordValid = await restaurant.comparePassword(password);
      if (!isPasswordValid) {
        return this.handleError({
          status: 401,
          message: 'Invalid credentials'
        }, res);
      }

      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({
        id: restaurant.id,
        email: restaurant.email,
        type: 'restaurant'
      }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });

      // Generate stage message
      let stageMessage = '';
      const currentStep = restaurant.currentStep || 1;
      if (restaurant.isRegistrationComplete) {
        stageMessage = 'Registration complete. You can now access all features.';
      } else {
        const stepInfo = this.getStepInfo(currentStep);
        stageMessage = `You are currently on Step ${currentStep}: ${stepInfo.title}. ${stepInfo.description}`;
      }
      return this.handleSuccess(res, {
        message: 'Login successful',
        type: 'restaurant',
        restaurant: {
          id: restaurant.id,
          ownerName: restaurant.ownerName,
          email: restaurant.email,
          currentStep: currentStep,
          completedSteps: restaurant.completedSteps,
          isRegistrationComplete: restaurant.isRegistrationComplete,
          status: restaurant.status || 'incomplete',
          paymentStatus: restaurant.paymentStatus || 'pending',
          banking: restaurant.bankingInfo || {},
          phone: restaurant.phone || null,
          businessName: restaurant.restaurantName || null,
          businessEmail: restaurant.businessEmail || null,
          businessPhone: restaurant.businessPhone || null,
          address: restaurant.restaurantAddress || null,
          city: restaurant.city || null,
          province: restaurant.province || null,
          postalCode: restaurant.postalCode || null,
          documents: {
            drivingLicense: restaurant.drivingLicenseUrl || null,
            voidCheque: restaurant.voidChequeUrl || null,
            hstDocument: restaurant.HSTdocumentUrl || null,
            foodHandlingCertificate: restaurant.foodHandlingCertificateUrl || null,
            articleOfIncorporation: restaurant.articleofIncorporation || null
          }
        },
        stageMessage,
        token
      }, 'Login successful');
    } catch (error) {
      console.error('Restaurant login error:', error);
      return this.handleError(error, res);
    }
  }

  // @desc    Update Step 1: Owner & Business Information
  // @route   PUT /api/restaurants/step1
  // @access  Private
  async updateStep1(req, res) {
    const transaction = await sequelize.transaction();
    try {
      this.validateRequest(req);
      const {
        phone,
        identificationType,
        ownerAddress,
        businessType,
        restaurantName,
        businessEmail,
        businessPhone,
        restaurantAddress,
        city,
        province,
        postalCode
      } = req.body;
      const restaurant = await Restaurant.findByPk(req.user.id, {
        transaction
      });
      if (!restaurant) {
        await transaction.rollback();
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }

      // Update completedSteps array properly
      const updatedCompletedSteps = this.updateCompletedSteps(restaurant.completedSteps, 1);

      // Update step 1 fields and mark step 1 as completed
      await restaurant.update({
        phone,
        identificationType,
        ownerAddress,
        businessType,
        restaurantName,
        businessEmail,
        businessPhone,
        restaurantAddress,
        city,
        province,
        postalCode,
        currentStep: 2,
        completedSteps: updatedCompletedSteps
      }, {
        transaction
      });
      await transaction.commit();

      // Reload to get fresh data
      await restaurant.reload();
      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
        totalSteps: 5,
        message: 'Step 1 completed successfully'
      }, 'Step 1 updated successfully');
    } catch (error) {
      await transaction.rollback();
      return this.handleError(error, res);
    }
  }

  // @desc    Update Step 2: Banking & Tax Information
  // @route   PUT /api/restaurants/step2
  // @access  Private
  async updateStep2(req, res) {
    const transaction = await sequelize.transaction();
    try {
      this.validateRequest(req);
      const {
        bankingInfo,
        HSTNumber
      } = req.body;
      const restaurant = await Restaurant.findByPk(req.user.id, {
        transaction
      });
      if (!restaurant) {
        await transaction.rollback();
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }

      // Validate that step 1 is completed
      const currentCompletedSteps = Array.isArray(restaurant.completedSteps) ? restaurant.completedSteps : [];
      if (!currentCompletedSteps.includes(1)) {
        await transaction.rollback();
        return this.handleError({
          status: 400,
          message: 'Please complete Step 1 first'
        }, res);
      }

      // Ensure we have valid banking info
      const bankingInfoToSave = typeof bankingInfo === 'string' ? JSON.parse(bankingInfo) : bankingInfo;

      // Update completedSteps array properly
      const updatedCompletedSteps = this.updateCompletedSteps(restaurant.completedSteps, 2);

      // Update with all data including properly managed completedSteps
      await restaurant.update({
        bankingInfo: bankingInfoToSave,
        HSTNumber,
        currentStep: 3,
        completedSteps: updatedCompletedSteps
      }, {
        transaction
      });
      await transaction.commit();

      // Reload to get fresh data
      await restaurant.reload();
      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
        totalSteps: 5,
        message: 'Step 2 completed successfully'
      }, 'Step 2 updated successfully');
    } catch (error) {
      await transaction.rollback();
      return this.handleError(error, res);
    }
  }

  // @desc    Update Step 3: Documents
  // @route   PUT /api/restaurants/step3
  // @access  Private
  async updateStep3(req, res) {
    const transaction = await sequelize.transaction();
    try {
      this.validateRequest(req);
      const restaurant = await Restaurant.findByPk(req.user.id, {
        transaction
      });
      if (!restaurant) {
        await transaction.rollback();
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }

      // Validate that step 2 is completed
      const currentCompletedSteps = Array.isArray(restaurant.completedSteps) ? restaurant.completedSteps : [];
      if (!currentCompletedSteps.includes(2)) {
        await transaction.rollback();
        return this.handleError({
          status: 400,
          message: 'Please complete Step 2 first'
        }, res);
      }

      // Accept both file uploads and direct URLs
      const documentUrls = this.uploadRestaurantDocuments(req.files || {}, req.body || {});

      // Update completedSteps array properly
      const updatedCompletedSteps = this.updateCompletedSteps(restaurant.completedSteps, 3);
      await restaurant.update({
        ...documentUrls,
        currentStep: 4,
        completedSteps: updatedCompletedSteps
      }, {
        transaction
      });
      await transaction.commit();

      // Reload to get fresh data
      await restaurant.reload();
      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
        totalSteps: 5,
        message: 'Step 3 completed successfully'
      }, 'Step 3 updated successfully');
    } catch (error) {
      await transaction.rollback();
      return this.handleError(error, res);
    }
  }

  // @desc    Update Step 4: Review & Confirmation
  // @route   PUT /api/restaurants/step4
  // @access  Private
  async updateStep4(req, res) {
    const transaction = await sequelize.transaction();
    try {
      this.validateRequest(req);
      const {
        agreedToTerms,
        confirmationChecked,
        additionalNotes
      } = req.body;
      const restaurant = await Restaurant.findByPk(req.user.id, {
        transaction
      });
      if (!restaurant) {
        await transaction.rollback();
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }

      // Validate that step 3 is completed
      const currentCompletedSteps = Array.isArray(restaurant.completedSteps) ? restaurant.completedSteps : [];
      if (!currentCompletedSteps.includes(3)) {
        await transaction.rollback();
        return this.handleError({
          status: 400,
          message: 'Please complete Step 3 first'
        }, res);
      }

      // Validate required confirmations
      if (!agreedToTerms || !confirmationChecked) {
        await transaction.rollback();
        return this.handleError({
          status: 400,
          message: 'Please agree to terms and conditions and confirm your information'
        }, res);
      }

      // Update completedSteps array properly
      const updatedCompletedSteps = this.updateCompletedSteps(restaurant.completedSteps, 4);

      // Update step 4 fields
      await restaurant.update({
        agreedToTerms: true,
        confirmationChecked: true,
        additionalNotes: additionalNotes || null,
        reviewCompletedAt: new Date(),
        currentStep: 5,
        completedSteps: updatedCompletedSteps
      }, {
        transaction
      });
      await transaction.commit();

      // Reload to get fresh data
      await restaurant.reload();
      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
        totalSteps: 5,
        message: 'Step 4 completed successfully. Please proceed to payment.',
        nextStep: {
          title: 'Payment Processing',
          description: 'Complete your registration fee payment to finalize your account'
        }
      }, 'Step 4 updated successfully');
    } catch (error) {
      await transaction.rollback();
      return this.handleError(error, res);
    }
  }

  // @desc    Update Step 5: Payment Processing
  // @route   PUT /api/restaurants/step5
  // @access  Private
  async updateStep5(req, res) {
    const transaction = await sequelize.transaction();
    try {
      this.validateRequest(req);
      const {
        paymentIntentId,
        stripePaymentMethodId
      } = req.body;
      const restaurant = await Restaurant.findByPk(req.user.id, {
        transaction
      });
      if (!restaurant) {
        await transaction.rollback();
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }

      // Validate that step 4 is completed
      const currentCompletedSteps = Array.isArray(restaurant.completedSteps) ? restaurant.completedSteps : [];
      if (!currentCompletedSteps.includes(4)) {
        await transaction.rollback();
        return this.handleError({
          status: 400,
          message: 'Please complete Step 4 first'
        }, res);
      }

      // Validate payment intent ID
      if (!paymentIntentId) {
        await transaction.rollback();
        return this.handleError({
          status: 400,
          message: 'Payment intent ID is required'
        }, res);
      }

      // Verify payment with Stripe
      try {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          await transaction.rollback();
          return this.handleError({
            status: 400,
            message: 'Payment has not been completed successfully'
          }, res);
        }
      } catch (stripeError) {
        await transaction.rollback();
        return this.handleError({
          status: 400,
          message: 'Invalid payment intent or payment verification failed'
        }, res);
      }

      // Update completedSteps array properly
      const updatedCompletedSteps = this.updateCompletedSteps(restaurant.completedSteps, 5);

      // Check if registration is complete (all 5 steps completed)
      const isRegistrationComplete = updatedCompletedSteps.includes(1) && updatedCompletedSteps.includes(2) && updatedCompletedSteps.includes(3) && updatedCompletedSteps.includes(4) && updatedCompletedSteps.includes(5);

      // Update step 5 fields and complete registration
      await restaurant.update({
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentIntentId,
        stripePaymentMethodId: stripePaymentMethodId || null,
        paymentCompletedAt: new Date(),
        registrationCompletedAt: isRegistrationComplete ? new Date() : null,
        currentStep: 5,
        completedSteps: updatedCompletedSteps,
        isRegistrationComplete: isRegistrationComplete,
        status: 'pending_approval' // Restaurant is now pending admin approval
      }, {
        transaction
      });
      await transaction.commit();

      // Reload to get fresh data
      await restaurant.reload();

      // Send completion email
      try {
        await sendEmail({
          to: restaurant.email,
          subject: 'Registration Completed Successfully',
          html: emailTemplates.registrationComplete({
            ownerName: restaurant.ownerName,
            restaurantName: restaurant.restaurantName,
            registrationDate: new Date().toLocaleDateString()
          })
        });
      } catch (emailError) {
        console.error('Failed to send completion email:', emailError);
        // Don't fail the registration if email fails
      }
      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
        totalSteps: 5,
        isRegistrationComplete: restaurant.isRegistrationComplete,
        paymentStatus: restaurant.paymentStatus,
        status: restaurant.status,
        message: 'Congratulations! Your registration is now complete. Your account is pending approval.',
        nextSteps: ['Your application will be reviewed by our team', 'You will receive an email notification once approved', 'Once approved, you can start using all platform features']
      }, 'Registration completed successfully');
    } catch (error) {
      await transaction.rollback();
      return this.handleError(error, res);
    }
  }

  // @desc    Get restaurant profile
  // @route   GET /api/restaurants/profile
  // @access  Private
  async getProfile(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.user.id, {
        attributes: {
          exclude: ['password', 'emailVerificationToken']
        }
      });
      if (!restaurant) {
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }
      return this.handleSuccess(res, {
        restaurant
      }, 'Profile retrieved successfully');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // @desc    Get registration progress
  // @route   GET /api/restaurants/progress
  // @access  Private
  async getRegistrationProgress(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.user.id, {
        attributes: ['id', 'currentStep', 'completedSteps', 'isRegistrationComplete', 'paymentStatus', 'status']
      });
      if (!restaurant) {
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }

      // Ensure completedSteps is properly formatted
      const completedSteps = Array.isArray(restaurant.completedSteps) ? restaurant.completedSteps : [];

      // Calculate actual completion status based on completedSteps
      const actualIsRegistrationComplete = completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3) && completedSteps.includes(4) && completedSteps.includes(5);

      // Update the database if the completion status is incorrect
      if (restaurant.isRegistrationComplete !== actualIsRegistrationComplete) {
        await restaurant.update({
          isRegistrationComplete: actualIsRegistrationComplete,
          completedSteps: completedSteps // Ensure proper format
        });
      }

      // Get current step info
      const currentStepInfo = this.getStepInfo(restaurant.currentStep);
      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        currentStepInfo: currentStepInfo,
        completedSteps: completedSteps,
        isRegistrationComplete: actualIsRegistrationComplete,
        paymentStatus: restaurant.paymentStatus || 'pending',
        status: restaurant.status || 'incomplete',
        totalSteps: 5,
        progressPercentage: Math.round(completedSteps.length / 5 * 100)
      }, 'Progress retrieved successfully');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // @desc    Get registration summary for step 4 review
  // @route   GET /api/restaurants/registration-summary
  // @access  Private
  async getRegistrationSummary(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.user.id, {
        attributes: {
          exclude: ['password', 'emailVerificationToken']
        }
      });
      if (!restaurant) {
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }

      // Check if steps 1-3 are completed
      const completedSteps = Array.isArray(restaurant.completedSteps) ? restaurant.completedSteps : [];
      if (!completedSteps.includes(1) || !completedSteps.includes(2) || !completedSteps.includes(3)) {
        return this.handleError({
          status: 400,
          message: 'Please complete steps 1-3 before reviewing registration summary'
        }, res);
      }

      // Prepare summary data
      const summary = {
        ownerInformation: {
          ownerName: restaurant.ownerName,
          email: restaurant.email,
          phone: restaurant.phone,
          identificationType: restaurant.identificationType,
          ownerAddress: restaurant.ownerAddress
        },
        businessInformation: {
          restaurantName: restaurant.restaurantName,
          businessEmail: restaurant.businessEmail,
          businessPhone: restaurant.businessPhone,
          businessType: restaurant.businessType,
          restaurantAddress: restaurant.restaurantAddress,
          city: restaurant.city,
          province: restaurant.province,
          postalCode: restaurant.postalCode
        },
        financialInformation: {
          bankingInfo: restaurant.bankingInfo,
          HSTNumber: restaurant.HSTNumber
        },
        documents: {
          drivingLicenseUrl: restaurant.drivingLicenseUrl,
          voidChequeUrl: restaurant.voidChequeUrl,
          HSTdocumentUrl: restaurant.HSTdocumentUrl,
          foodHandlingCertificateUrl: restaurant.foodHandlingCertificateUrl,
          articleofIncorporation: restaurant.articleofIncorporation
        },
        registrationFee: {
          amount: 50.00,
          currency: 'USD',
          description: 'One-time registration fee'
        },
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps
      };
      return this.handleSuccess(res, {
        summary
      }, 'Registration summary retrieved successfully');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // @desc    Send verification email
  // @route   POST /api/restaurants/verify-email
  // @access  Public
  async sendVerificationCode(req, res) {
    try {
      const {
        email
      } = req.body;

      // Check if email already exists
      const existingRestaurant = await Restaurant.findOne({
        where: {
          email
        }
      });
      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Send verification email
      const {
        success,
        otp,
        expiresIn,
        error
      } = await sendVerificationEmail(email);
      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }

      // Store OTP in in-memory store
      otpStore.set(email, {
        otp,
        expiresAt: Date.now() + expiresIn * 1000
      });
      res.status(200).json({
        success: true,
        message: 'Verification code sent successfully',
        expiresIn
      });
    } catch (error) {
      console.error('Error in sendVerificationCode:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // @desc    Verify email OTP
  // @route   POST /api/restaurants/verify-otp
  // @access  Public
  async verifyOTP(req, res) {
    try {
      const {
        email,
        otp
      } = req.body;

      // Get stored OTP from in-memory store
      const storedOTPData = otpStore.get(email);
      const storedOTP = storedOTPData && storedOTPData.expiresAt > Date.now() ? storedOTPData.otp : null;
      if (!storedOTP) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired or invalid'
        });
      }
      if (otp !== storedOTP) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      // Delete OTP from in-memory store
      otpStore.delete(email);

      // Mark email as verified
      emailVerificationStore.set(email, {
        verified: true,
        expiresAt: Date.now() + 3600 * 1000
      });
      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // @desc    Create payment intent for registration fee
  // @route   POST /api/restaurants/create-payment-intent
  // @access  Private
  async createPaymentIntent(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.user.id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Check if step 4 is completed
      const completedSteps = Array.isArray(restaurant.completedSteps) ? restaurant.completedSteps : [];
      if (!completedSteps.includes(4)) {
        return res.status(400).json({
          success: false,
          message: 'Please complete all previous steps before payment'
        });
      }

      // Check if payment is already completed
      if (restaurant.paymentStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Payment has already been completed'
        });
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 5000,
        // $50.00 in cents - registration fee
        currency: 'usd',
        metadata: {
          restaurantId: restaurant.id,
          email: restaurant.email,
          restaurantName: restaurant.restaurantName || 'Restaurant Registration'
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Store payment intent ID for tracking
      await restaurant.update({
        pendingPaymentIntentId: paymentIntent.id
      });
      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: 5000,
        currency: 'usd'
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent'
      });
    }
  }

  // @desc    Complete payment for restaurant registration
  // @route   POST /api/restaurants/complete-payment
  // @access  Private
  async completePayment(req, res) {
    try {
      const {
        paymentIntentId
      } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment intent ID is required'
        });
      }
      const restaurant = await Restaurant.findByPk(req.user.id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Verify payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Payment has not been completed successfully'
        });
      }

      // Update restaurant with payment completion
      await restaurant.update({
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentIntentId,
        paymentCompletedAt: new Date()
      });
      return res.json({
        success: true,
        message: 'Payment completed successfully',
        paymentStatus: 'completed',
        paymentIntentId: paymentIntentId
      });
    } catch (error) {
      console.error('Error completing payment:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to complete payment'
      });
    }
  }

  // @desc    Update restaurant profile
  // @route   PUT /api/restaurants/profile
  // @access  Private
  async updateProfile(req, res) {
    try {
      const {
        ownerName,
        phone,
        restaurantName,
        address
      } = req.body;
      const updateData = {
        ownerName,
        phone,
        restaurantName,
        address: JSON.parse(address)
      };
      const restaurant = await Restaurant.findByIdAndUpdate(req.user.id, updateData, {
        new: true
      }).select('-password');
      res.status(200).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // @desc    Update restaurant status
  // @route   PUT /api/restaurants/:id/status
  // @access  Private/Admin
  async updateRestaurantStatus(req, res) {
    try {
      const {
        id
      } = req.params;
      const {
        status
      } = req.body;

      // Validate status
      const validStatuses = ['pending_approval', 'approved', 'rejected', 'suspended'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      const restaurant = await Restaurant.findByPk(id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }
      restaurant.status = status;
      restaurant.statusUpdatedAt = new Date();
      await restaurant.save();

      // Send email notification
      await sendEmail({
        to: restaurant.email,
        subject: 'Application Status Update',
        html: emailTemplates.applicationStatus('Restaurant', status)
      });
      res.status(200).json({
        success: true,
        data: {
          id: restaurant.id,
          ownerName: restaurant.ownerName,
          email: restaurant.email,
          status: restaurant.status,
          statusUpdatedAt: restaurant.statusUpdatedAt
        }
      });
    } catch (error) {
      console.error('Error in updateRestaurantStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // @desc    Update payment status
  // @route   PUT /api/restaurants/:id/payment
  // @access  Private/Admin
  async updatePaymentStatus(req, res) {
    try {
      const {
        transactionId,
        amount
      } = req.body;
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }
      restaurant.payment = {
        status: 'completed',
        transactionId,
        amount,
        date: new Date()
      };
      await restaurant.save();

      // Send payment receipt
      await sendEmail({
        to: restaurant.email,
        subject: 'Payment Receipt',
        html: emailTemplates.paymentReceipt({
          amount,
          transactionId,
          date: new Date().toLocaleDateString()
        })
      });
      res.status(200).json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  async updateMenuItems(req, res) {
    try {
      const {
        restaurantId
      } = req.params;
      const {
        menuDetails
      } = req.body;
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw {
          status: 404,
          message: 'Restaurant not found'
        };
      }

      // Upload new menu images if provided
      if (req.files && req.files.menuImages) {
        const menuImageUrls = await Promise.all(req.files.menuImages.map(file => this.uploadFile(file)));

        // Update menu details with new image URLs
        menuDetails.forEach((item, index) => {
          if (menuImageUrls[index]) {
            item.imageUrl = menuImageUrls[index];
          }
        });
      }
      await restaurant.update({
        menuDetails
      });
      return this.handleSuccess(res, {
        menuDetails: restaurant.menuDetails
      }, 'Menu items updated successfully');
    } catch (error) {
      return this.handleError(error, res);
    }
  }
  async updateHours(req, res) {
    try {
      const {
        restaurantId
      } = req.params;
      const {
        hoursOfOperation
      } = req.body;
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw {
          status: 404,
          message: 'Restaurant not found'
        };
      }
      await restaurant.update({
        hoursOfOperation
      });
      return this.handleSuccess(res, {
        hoursOfOperation: restaurant.hoursOfOperation
      }, 'Hours of operation updated successfully');
    } catch (error) {
      return this.handleError(error, res);
    }
  }
  async updateTaxInfo(req, res) {
    try {
      const {
        restaurantId
      } = req.params;
      const {
        taxInfo
      } = req.body;
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw {
          status: 404,
          message: 'Restaurant not found'
        };
      }
      await restaurant.update({
        taxInfo: {
          ...taxInfo,
          province: restaurant.province // Ensure province is included for tax validation
        }
      });
      return this.handleSuccess(res, {
        taxInfo: restaurant.taxInfo
      }, 'Tax information updated successfully');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // @desc    Get step validation status
  // @route   GET /api/restaurants/step-validation/:step
  // @access  Private
  async getStepValidation(req, res) {
    try {
      const {
        step
      } = req.params;
      const stepNumber = parseInt(step);
      if (stepNumber < 1 || stepNumber > 5) {
        return this.handleError({
          status: 400,
          message: 'Invalid step number'
        }, res);
      }
      const restaurant = await Restaurant.findByPk(req.user.id);
      if (!restaurant) {
        return this.handleError({
          status: 404,
          message: 'Restaurant not found'
        }, res);
      }
      const completedSteps = Array.isArray(restaurant.completedSteps) ? restaurant.completedSteps : [];
      let validation = {
        stepNumber: stepNumber,
        isCompleted: completedSteps.includes(stepNumber),
        canAccess: true,
        missingFields: [],
        errors: []
      };

      // Check if previous steps are completed
      for (let i = 1; i < stepNumber; i++) {
        if (!completedSteps.includes(i)) {
          validation.canAccess = false;
          validation.errors.push(`Please complete Step ${i} first`);
        }
      }

      // Validate specific step requirements
      switch (stepNumber) {
        case 1:
          const step1Fields = ['ownerName', 'phone', 'identificationType', 'ownerAddress', 'businessType', 'restaurantName', 'businessEmail', 'businessPhone', 'restaurantAddress', 'city', 'province', 'postalCode'];
          validation.missingFields = step1Fields.filter(field => !restaurant[field]);
          break;
        case 2:
          if (!restaurant.bankingInfo || !restaurant.HSTNumber) {
            validation.missingFields = ['bankingInfo', 'HSTNumber'].filter(field => !restaurant[field]);
          }
          break;
        case 3:
          const requiredDocs = ['drivingLicenseUrl', 'voidChequeUrl', 'HSTdocumentUrl', 'foodHandlingCertificateUrl'];
          validation.missingFields = requiredDocs.filter(field => !restaurant[field]);
          break;
        case 4:
          if (!restaurant.agreedToTerms || !restaurant.confirmationChecked) {
            validation.missingFields = ['agreedToTerms', 'confirmationChecked'].filter(field => !restaurant[field]);
          }
          break;
        case 5:
          if (restaurant.paymentStatus !== 'completed') {
            validation.missingFields = ['payment'];
          }
          break;
      }
      validation.isValid = validation.missingFields.length === 0 && validation.canAccess;
      return this.handleSuccess(res, {
        validation
      }, 'Step validation retrieved successfully');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // Helper method to handle document uploads or direct URLs
  uploadRestaurantDocuments(files = {}, body = {}) {
    return {
      drivingLicenseUrl: body.drivingLicenseUrl || files.drivingLicense && files.drivingLicense[0]?.location || null,
      voidChequeUrl: body.voidChequeUrl || files.voidCheque && files.voidCheque[0]?.location || null,
      HSTdocumentUrl: body.HSTdocumentUrl || files.HSTdocument && files.HSTdocument[0]?.location || null,
      foodHandlingCertificateUrl: body.foodHandlingCertificateUrl || files.foodHandlingCertificate && files.foodHandlingCertificate[0]?.location || null,
      articleofIncorporation: body.articleofIncorporation || files.articleofIncorporation && files.articleofIncorporation[0]?.location || null,
      articleofIncorporationExpiryDate: body.articleofIncorporationExpiryDate || null,
      foodSafetyCertificateExpiryDate: body.foodSafetyCertificateExpiryDate || null
    };
  }
}

// Export all methods using module.exports
const restaurantController = new RestaurantController();
module.exports = {
  // Authentication & Registration
  registerRestaurant: restaurantController.registerRestaurant.bind(restaurantController),
  login: restaurantController.login.bind(restaurantController),
  // Email Verification
  sendVerificationCode: restaurantController.sendVerificationCode.bind(restaurantController),
  verifyOTP: restaurantController.verifyOTP.bind(restaurantController),
  // Registration Steps
  updateStep1: restaurantController.updateStep1.bind(restaurantController),
  updateStep2: restaurantController.updateStep2.bind(restaurantController),
  updateStep3: restaurantController.updateStep3.bind(restaurantController),
  updateStep4: restaurantController.updateStep4.bind(restaurantController),
  updateStep5: restaurantController.updateStep5.bind(restaurantController),
  // Profile & Progress
  getProfile: restaurantController.getProfile.bind(restaurantController),
  getRegistrationProgress: restaurantController.getRegistrationProgress.bind(restaurantController),
  getRegistrationSummary: restaurantController.getRegistrationSummary.bind(restaurantController),
  getStepValidation: restaurantController.getStepValidation.bind(restaurantController),
  // Payment
  createPaymentIntent: restaurantController.createPaymentIntent.bind(restaurantController),
  completePayment: restaurantController.completePayment.bind(restaurantController),
  // Restaurant Management
  updateProfile: restaurantController.updateProfile.bind(restaurantController),
  updateMenuItems: restaurantController.updateMenuItems.bind(restaurantController),
  updateHours: restaurantController.updateHours.bind(restaurantController),
  updateTaxInfo: restaurantController.updateTaxInfo.bind(restaurantController),
  // Admin Functions
  updateRestaurantStatus: restaurantController.updateRestaurantStatus.bind(restaurantController),
  updatePaymentStatus: restaurantController.updatePaymentStatus.bind(restaurantController)
};