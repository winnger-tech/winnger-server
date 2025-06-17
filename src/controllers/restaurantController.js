const Restaurant = require('../models/Restaurant');
const { uploadFile } = require('../utils/s3');
const { sendEmail, sendVerificationEmail, emailTemplates } = require('../utils/email');
const BaseController = require('./BaseController');
const { User } = require('../models');
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
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateRestaurantStatus = this.updateRestaurantStatus.bind(this);
    this.sendVerificationCode = this.sendVerificationCode.bind(this);
    this.verifyOTP = this.verifyOTP.bind(this);
    this.updateMenuItems = this.updateMenuItems.bind(this);
    this.updateHours = this.updateHours.bind(this);
    this.updateTaxInfo = this.updateTaxInfo.bind(this);
    this.createPaymentIntent = this.createPaymentIntent.bind(this);
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

  // @desc    Register new restaurant
  // @route   POST /api/restaurants
  // @access  Public
  async registerRestaurant(req, res) {
    const t = await sequelize.transaction();
    try {
        this.validateRequest(req);

        const {
            ownerName, email, password, phone, identificationType,
            restaurantName, businessAddress, city, province, postalCode,
            bankingInfo, taxInfo, menuDetails, hoursOfOperation,
            stripePaymentIntentId
        } = req.body;

        // Verify payment
        const paymentIntent = await this.stripe.paymentIntents.retrieve(stripePaymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            await t.rollback();
            return this.handleError({ status: 400, message: 'Payment not completed' }, res);
        }

        // Handle file uploads
        const documentUrls = this.uploadRestaurantDocuments(req.files);

        // Create restaurant
        const restaurant = await Restaurant.create({
            ownerName, email, password, phone, identificationType,
            restaurantName, businessAddress, city, province, postalCode,
            bankingInfo: JSON.parse(bankingInfo),
            taxInfo: JSON.parse(taxInfo),
            menuDetails: JSON.parse(menuDetails),
            hoursOfOperation: JSON.parse(hoursOfOperation),
            paymentStatus: 'completed',
            paymentAmount: paymentIntent.amount / 100, // store amount in dollars
            paymentDate: new Date(),
            stripePaymentIntentId,
            emailVerified: true,
            ...documentUrls
        }, { transaction: t });

        await t.commit();
        return this.handleSuccess(res, { restaurantId: restaurant.id }, 'Restaurant registration successful');

    } catch (error) {
        await t.rollback();
        return this.handleError(error, res);
    }
}

uploadRestaurantDocuments(files) {
  const documentUrls = {};

  // Handle mandatory file uploads as defined in your model
  if (files.businessDocument && files.businessDocument[0]) {
      documentUrls.businessDocumentUrl = files.businessDocument[0].location;
  } else {
      throw new Error('Missing required document: Business Document');
  }

  if (files.voidCheque && files.voidCheque[0]) {
      documentUrls.voidChequeUrl = files.voidCheque[0].location;
  } else {
      throw new Error('Missing required document: Void Cheque');
  }
  
  if (files.businessLicense && files.businessLicense[0]) {
      documentUrls.businessLicenseUrl = files.businessLicense[0].location;
  } else {
      throw new Error('Missing required document: Business License');
  }

  // Handle optional menu images
  if (files.menuImages && files.menuImages.length > 0) {
      // Note: Your model does not have a column for menuImageUrls. 
      // This logic is here if you decide to add it later.
      // documentUrls.menuImageUrls = files.menuImages.map(file => file.location);
  }

  return documentUrls;
}

  // @desc    Get restaurant profile
  // @route   GET /api/restaurants/profile
  // @access  Private
  async getProfile(req, res) {
    try {
      const restaurant = await Restaurant.findById(req.user.id).select('-password');
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

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
}

module.exports = new RestaurantController();