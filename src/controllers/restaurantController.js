const { uploadFile } = require('../utils/s3');
const { sendEmail, sendVerificationEmail, emailTemplates } = require('../utils/email');
const BaseController = require('./BaseController');
const { Restaurant } = require('../models');
const { sequelize } = require('../config/database'); // ADD THIS LINE
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add in-memory store
const otpStore = new Map();
const emailVerificationStore = new Map();

class RestaurantController extends BaseController {
  constructor() {
    super();
    this.stripe = stripe;
    this.registerRestaurant = this.registerRestaurant.bind(this);
    this.login = this.login.bind(this);
    this.updateStep1 = this.updateStep1.bind(this);
    this.updateStep2 = this.updateStep2.bind(this);
    this.updateStep3 = this.updateStep3.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.getRegistrationProgress = this.getRegistrationProgress.bind(this);
    this.sendVerificationCode = this.sendVerificationCode.bind(this);
    this.verifyOTP = this.verifyOTP.bind(this);
    this.updateMenuItems = this.updateMenuItems.bind(this);
    this.updateHours = this.updateHours.bind(this);
    this.updateTaxInfo = this.updateTaxInfo.bind(this);
    this.createPaymentIntent = this.createPaymentIntent.bind(this);
    this.completePayment = this.completePayment.bind(this);
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

  // @desc    Register new restaurant (basic account)
  // @route   POST /api/restaurants/register
  // @access  Public
  async registerRestaurant(req, res) {
    try {
      this.validateRequest(req);

      const { ownerName, email, password } = req.body;

      // Check if email already exists
      const existingRestaurant = await Restaurant.findOne({ where: { email } });
      if (existingRestaurant) {
        return this.handleError({ status: 400, message: 'Email already registered' }, res);
      }

      // Create restaurant with basic info
      const restaurant = await Restaurant.create({
        ownerName,
        email,
        password,
        currentStep: 1,
        completedSteps: [], // Initialize as empty array
        isRegistrationComplete: false
      });

      return this.handleSuccess(res, { 
        restaurantId: restaurant.id,
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
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

      const { email, password } = req.body;

      if (!email || !password) {
        return this.handleError({ status: 400, message: 'Email and password are required' }, res);
      }

      // Find restaurant
      const restaurant = await Restaurant.findOne({ where: { email } });
      if (!restaurant) {
        return this.handleError({ status: 401, message: 'Invalid credentials' }, res);
      }

      // Check password
      const isPasswordValid = await restaurant.comparePassword(password);
      if (!isPasswordValid) {
        return this.handleError({ status: 401, message: 'Invalid credentials' }, res);
      }

      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: restaurant.id, email: restaurant.email, type: 'restaurant' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

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
          isRegistrationComplete: restaurant.isRegistrationComplete
        },
        stageMessage,
        token
      }, 'Login successful');

    } catch (error) {
      console.error('Restaurant login error:', error);
      return this.handleError(error, res);
    }
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
      }
    };
    return stepInfo[step] || { title: "Unknown Step", description: "Please complete this step to continue" };
  }

  // @desc    Update Step 1: Owner & Business Information
  // @route   PUT /api/restaurants/step1
  // @access  Private
  async updateStep1(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      this.validateRequest(req);

      const {
        phone, identificationType, ownerAddress, businessType,
        restaurantName, businessEmail, businessPhone, restaurantAddress,
        city, province, postalCode
      } = req.body;

      const restaurant = await Restaurant.findByPk(req.user.id, { transaction });
      if (!restaurant) {
        await transaction.rollback();
        return this.handleError({ status: 404, message: 'Restaurant not found' }, res);
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
      }, { transaction });

      await transaction.commit();

      // Reload to get fresh data
      await restaurant.reload();

      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
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

      const { bankingInfo, HSTNumber } = req.body;

      const restaurant = await Restaurant.findByPk(req.user.id, { transaction });
      if (!restaurant) {
        await transaction.rollback();
        return this.handleError({ status: 404, message: 'Restaurant not found' }, res);
      }

      // Validate that step 1 is completed
      const currentCompletedSteps = Array.isArray(restaurant.completedSteps) ? 
        restaurant.completedSteps : [];
      
      if (!currentCompletedSteps.includes(1)) {
        await transaction.rollback();
        return this.handleError({ status: 400, message: 'Please complete Step 1 first' }, res);
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
      }, { transaction });

      await transaction.commit();

      // Reload to get fresh data
      await restaurant.reload();

      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
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

      const restaurant = await Restaurant.findByPk(req.user.id, { transaction });
      if (!restaurant) {
        await transaction.rollback();
        return this.handleError({ status: 404, message: 'Restaurant not found' }, res);
      }

      // Validate that step 2 is completed
      const currentCompletedSteps = Array.isArray(restaurant.completedSteps) ? 
        restaurant.completedSteps : [];
      
      if (!currentCompletedSteps.includes(2)) {
        await transaction.rollback();
        return this.handleError({ status: 400, message: 'Please complete Step 2 first' }, res);
      }

      // Accept both file uploads and direct URLs
      const documentUrls = this.uploadRestaurantDocuments(req.files || {}, req.body || {});

      // Update completedSteps array properly
      const updatedCompletedSteps = this.updateCompletedSteps(restaurant.completedSteps, 3);

      // Check if registration is complete (all 3 steps completed)
      const isRegistrationComplete = updatedCompletedSteps.includes(1) && 
                                   updatedCompletedSteps.includes(2) && 
                                   updatedCompletedSteps.includes(3);

      await restaurant.update({
        ...documentUrls,
        currentStep: 3,
        completedSteps: updatedCompletedSteps,
        isRegistrationComplete: isRegistrationComplete
      }, { transaction });

      await transaction.commit();

      // Reload to get fresh data
      await restaurant.reload();

      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: restaurant.completedSteps,
        isRegistrationComplete: restaurant.isRegistrationComplete,
        message: restaurant.isRegistrationComplete ? 
          'Registration completed successfully' : 
          'Step 3 completed successfully'
      }, 'Step 3 updated successfully');

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
        attributes: { exclude: ['password', 'emailVerificationToken'] }
      });

      if (!restaurant) {
        return this.handleError({ status: 404, message: 'Restaurant not found' }, res);
      }

      return this.handleSuccess(res, { restaurant }, 'Profile retrieved successfully');

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
        attributes: ['id', 'currentStep', 'completedSteps', 'isRegistrationComplete']
      });

      if (!restaurant) {
        return this.handleError({ status: 404, message: 'Restaurant not found' }, res);
      }

      // Ensure completedSteps is properly formatted
      const completedSteps = Array.isArray(restaurant.completedSteps) ? 
        restaurant.completedSteps : [];
      
      // Calculate actual completion status based on completedSteps
      const actualIsRegistrationComplete = completedSteps.includes(1) && 
                                         completedSteps.includes(2) && 
                                         completedSteps.includes(3);

      // Update the database if the completion status is incorrect
      if (restaurant.isRegistrationComplete !== actualIsRegistrationComplete) {
        await restaurant.update({
          isRegistrationComplete: actualIsRegistrationComplete,
          completedSteps: completedSteps // Ensure proper format
        });
      }

      return this.handleSuccess(res, {
        currentStep: restaurant.currentStep,
        completedSteps: completedSteps,
        isRegistrationComplete: actualIsRegistrationComplete,
        totalSteps: 3
      }, 'Progress retrieved successfully');

    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // @desc    Send verification email
  // @route   POST /api/restaurants/verify-email
  // @access  Public
  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      // Check if email already exists
      const existingRestaurant = await Restaurant.findOne({ where: { email } });
      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Send verification email
      const { success, otp, expiresIn, error } = await sendVerificationEmail(email);
      
      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }

      // Store OTP in in-memory store
      otpStore.set(email, {
          otp,
          expiresAt: Date.now() + (expiresIn * 1000)
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
      const { email, otp } = req.body;

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
          expiresAt: Date.now() + (3600 * 1000)
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

  // @desc    Update restaurant profile
  // @route   PUT /api/restaurants/profile
  // @access  Private
  async updateProfile(req, res) {
    try {
      const { ownerName, phone, restaurantName, address } = req.body;

      const updateData = {
        ownerName,
        phone,
        restaurantName,
        address: JSON.parse(address)
      };

      const restaurant = await Restaurant.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      ).select('-password');

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
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      restaurant.status = status;
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
          _id: restaurant._id,
          ownerName: restaurant.ownerName,
          email: restaurant.email,
          status: restaurant.status
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
      const { transactionId, amount } = req.body;
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
      const { restaurantId } = req.params;
      const { menuDetails } = req.body;

      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw { status: 404, message: 'Restaurant not found' };
      }

      // Upload new menu images if provided
      if (req.files && req.files.menuImages) {
        const menuImageUrls = await Promise.all(
          req.files.menuImages.map(file => this.uploadFile(file))
        );

        // Update menu details with new image URLs
        menuDetails.forEach((item, index) => {
          if (menuImageUrls[index]) {
            item.imageUrl = menuImageUrls[index];
          }
        });
      }

      await restaurant.update({ menuDetails });

      return this.handleSuccess(res, {
        menuDetails: restaurant.menuDetails
      }, 'Menu items updated successfully');

    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async updateHours(req, res) {
    try {
      const { restaurantId } = req.params;
      const { hoursOfOperation } = req.body;

      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw { status: 404, message: 'Restaurant not found' };
      }

      await restaurant.update({ hoursOfOperation });

      return this.handleSuccess(res, {
        hoursOfOperation: restaurant.hoursOfOperation
      }, 'Hours of operation updated successfully');

    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async updateTaxInfo(req, res) {
    try {
      const { restaurantId } = req.params;
      const { taxInfo } = req.body;

      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw { status: 404, message: 'Restaurant not found' };
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

  // @desc    Create payment intent for registration fee
  // @route   POST /api/restaurants/create-payment-intent
  // @access  Public
  async createPaymentIntent(req, res) {
    try {
      const { email } = req.body;

      // Check if email is verified
      const verificationData = emailVerificationStore.get(email);
      const isVerified = verificationData && verificationData.expiresAt > Date.now() && verificationData.verified;
      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Please verify your email first'
        });
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 5000, // $50.00 in cents
        currency: 'usd',
        metadata: { email },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent'
      });
    }
  }

  // @desc    Complete payment for restaurant
  // @route   POST /api/restaurants/complete-payment
  // @access  Private
  async completePayment(req, res) {
    try {
      const { paymentIntentId } = req.body;
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
      // Optionally, you can verify the payment with Stripe here
      restaurant.paymentStatus = 'completed';
      restaurant.stripePaymentIntentId = paymentIntentId;
      await restaurant.save();
      return res.json({
        success: true,
        message: 'Payment marked as complete',
        paymentStatus: restaurant.paymentStatus,
        paymentIntentId: restaurant.stripePaymentIntentId
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to complete payment'
      });
    }
  }

  // Helper method to handle document uploads or direct URLs
  uploadRestaurantDocuments(files = {}, body = {}) {
    return {
      drivingLicenseUrl: body.drivingLicenseUrl || (files.drivingLicense && files.drivingLicense[0]?.location) || null,
      voidChequeUrl: body.voidChequeUrl || (files.voidCheque && files.voidCheque[0]?.location) || null,
      HSTdocumentUrl: body.HSTdocumentUrl || (files.HSTdocument && files.HSTdocument[0]?.location) || null,
      foodHandlingCertificateUrl: body.foodHandlingCertificateUrl || (files.foodHandlingCertificate && files.foodHandlingCertificate[0]?.location) || null,
      articleofIncorporation: body.articleofIncorporation || (files.articleofIncorporation && files.articleofIncorporation[0]?.location) || null,
      articleofIncorporationExpiryDate: body.articleofIncorporationExpiryDate || null,
      foodSafetyCertificateExpiryDate: body.foodSafetyCertificateExpiryDate || null,
    };
  }
}

module.exports = new RestaurantController();