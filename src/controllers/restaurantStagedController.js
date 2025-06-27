const BaseController = require('./BaseController');
const { Restaurant } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class RestaurantStagedController extends BaseController {
  constructor() {
    super();
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateStage = this.updateStage.bind(this);
    this.getRegistrationStages = this.getRegistrationStages.bind(this);
    this.getDashboard = this.getDashboard.bind(this);
    this.updateSpecificStage = this.updateSpecificStage.bind(this);
    this.getStageData = this.getStageData.bind(this);
  }

  // Stage 1: Initial registration with basic info only
  async register(req, res) {
    try {
      const { ownerName, email, password } = req.body;

      // Validate required fields
      if (!ownerName || !email || !password) {
        return this.errorResponse(res, 'Owner name, email, and password are required', 400);
      }

      // Check if restaurant already exists
      const existingRestaurant = await Restaurant.findOne({ where: { email } });
      if (existingRestaurant) {
        return this.errorResponse(res, 'Restaurant with this email already exists', 400);
      }

      // Create restaurant with stage 1 data
      const restaurant = await Restaurant.create({
        ownerName,
        email,
        password,
        registrationStage: 1,
        isRegistrationComplete: false
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: restaurant.id, email: restaurant.email, type: 'restaurant' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      this.successResponse(res, {
        message: 'Restaurant registered successfully',
        type: 'restaurant',
        restaurant: {
          id: restaurant.id,
          ownerName: restaurant.ownerName,
          email: restaurant.email,
          registrationStage: restaurant.registrationStage,
          isRegistrationComplete: restaurant.isRegistrationComplete
        },
        token
      }, 201);

    } catch (error) {
      console.error('Restaurant registration error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return this.errorResponse(res, 'Email and password are required', 400);
      }

      // Find restaurant
      const restaurant = await Restaurant.findOne({ where: { email } });
      if (!restaurant) {
        return this.errorResponse(res, 'Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await restaurant.comparePassword(password);
      if (!isPasswordValid) {
        return this.errorResponse(res, 'Invalid credentials', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: restaurant.id, email: restaurant.email, type: 'restaurant' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Generate a human-readable stage message
      let stageMessage = '';
      if (restaurant.isRegistrationComplete) {
        stageMessage = 'Registration complete. You can now access all features.';
      } else {
        const stageInfo = this.getNextStageInfo(restaurant.registrationStage, restaurant);
        if (stageInfo && stageInfo.title) {
          stageMessage = `You are currently on Stage ${restaurant.registrationStage}: ${stageInfo.title}. ${stageInfo.description}`;
        } else {
          stageMessage = `You are currently on Stage ${restaurant.registrationStage}. Please complete this stage to continue.`;
        }
      }

      this.successResponse(res, {
        message: 'Login successful',
        type: 'restaurant',
        restaurant: {
          id: restaurant.id,
          ownerName: restaurant.ownerName,
          email: restaurant.email,
          registrationStage: restaurant.registrationStage,
          isRegistrationComplete: restaurant.isRegistrationComplete
        },
        stageMessage,
        token
      });

    } catch (error) {
      console.error('Restaurant login error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!restaurant) {
        return this.errorResponse(res, 'Restaurant not found', 404);
      }

      this.successResponse(res, {
        restaurant,
        nextStage: this.getNextStageInfo(restaurant.registrationStage, restaurant)
      });

    } catch (error) {
      console.error('Get profile error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Update registration stage
  async updateStage(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.user.id);
      if (!restaurant) {
        return this.errorResponse(res, 'Restaurant not found', 404);
      }

      const currentStage = restaurant.registrationStage;
      const updateData = req.body;

      let nextStage = currentStage;
      let isComplete = false;

      // Stage 1: Basic owner and business information
      if (currentStage === 1) {
        const requiredFields = [
          'phone', 'identificationType', 'ownerAddress', 'businessType',
          'restaurantName', 'businessEmail', 'businessPhone', 'restaurantAddress',
          'city', 'province', 'postalCode'
        ];
        
        // Check if all required fields are provided
        const hasAllFields = requiredFields.every(field => {
          const value = updateData[field];
          return value !== undefined && value !== null && value !== '';
        });
        
        if (hasAllFields) {
          nextStage = 2;
        } else {
          const missingFields = requiredFields.filter(field => {
            const value = updateData[field];
            return value === undefined || value === null || value === '';
          });
          return this.errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
        }
      }
      
      // Stage 2: Banking information and HST number
      else if (currentStage === 2) {
        const requiredFields = ['bankingInfo', 'HSTNumber'];
        
        // Check if all required fields are provided
        const hasAllFields = requiredFields.every(field => {
          const value = updateData[field];
          if (field === 'bankingInfo') {
            return value && value.transitNumber && value.institutionNumber && value.accountNumber;
          }
          return value !== undefined && value !== null && value !== '';
        });
        
        if (hasAllFields) {
          nextStage = 3;
        } else {
          const missingFields = requiredFields.filter(field => {
            const value = updateData[field];
            if (field === 'bankingInfo') {
              return !value || !value.transitNumber || !value.institutionNumber || !value.accountNumber;
            }
            return value === undefined || value === null || value === '';
          });
          return this.errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
        }
      }
      
      // Stage 3: Document uploads
      else if (currentStage === 3) {
        const requiredFields = [
          'drivingLicenseUrl', 'voidChequeUrl', 'HSTdocumentUrl', 
          'foodHandlingCertificateUrl', 'articleofIncorporation'
        ];
        
        // Check if all required fields are provided
        const hasAllFields = requiredFields.every(field => {
          const value = updateData[field];
          return value !== undefined && value !== null && value !== '';
        });
        
        if (hasAllFields) {
          nextStage = 3; // Stay at stage 3 but mark as complete
          isComplete = true;
        } else {
          const missingFields = requiredFields.filter(field => {
            const value = updateData[field];
            return value === undefined || value === null || value === '';
          });
          return this.errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
        }
      }

      // Update restaurant with new data
      await restaurant.update({
        ...updateData,
        registrationStage: nextStage,
        isRegistrationComplete: isComplete
      });

      // Fetch updated restaurant
      const updatedRestaurant = await Restaurant.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      this.successResponse(res, {
        message: `Stage ${currentStage} completed successfully`,
        restaurant: updatedRestaurant,
        nextStage: isComplete ? null : this.getNextStageInfo(nextStage, updatedRestaurant)
      });

    } catch (error) {
      console.error('Update stage error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Get registration stages information
  async getRegistrationStages(req, res) {
    try {
      const stages = {
        1: {
          title: "Basic Owner & Business Information",
          description: "Complete your basic owner and business information",
          fields: [
            "ownerName", "email", "password", "phone", "identificationType", 
            "ownerAddress", "businessType", "restaurantName", "businessEmail", 
            "businessPhone", "restaurantAddress", "city", "province", "postalCode"
          ],
          completed: true // Always completed after registration
        },
        2: {
          title: "Banking Information & HST Number",
          description: "Provide your banking information and HST number",
          fields: ["bankingInfo", "HSTNumber"]
        },
        3: {
          title: "Document Uploads", 
          description: "Upload required business documents",
          fields: [
            "drivingLicenseUrl", "voidChequeUrl", "HSTdocumentUrl", 
            "foodHandlingCertificateUrl", "articleofIncorporation"
          ]
        }
      };

      this.successResponse(res, { stages });

    } catch (error) {
      console.error('Get stages error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Helper method to get next stage information
  getNextStageInfo(currentStage, restaurant) {
    const stageInfo = {
      2: {
        title: "Banking Information & HST Number",
        description: "Please provide your banking information and HST number",
        requiredFields: ["bankingInfo", "HSTNumber"]
      },
      3: {
        title: "Document Uploads",
        description: "Upload required business documents", 
        requiredFields: [
          "drivingLicenseUrl", "voidChequeUrl", "HSTdocumentUrl", 
          "foodHandlingCertificateUrl", "articleofIncorporation"
        ]
      }
    };

    return stageInfo[currentStage] || null;
  }

  // Get dashboard information
  async getDashboard(req, res) {
    try {
      const restaurant = await Restaurant.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!restaurant) {
        return this.errorResponse(res, 'Restaurant not found', 404);
      }

      // Get all stages information
      const stages = {
        1: {
          title: "Basic Owner & Business Information",
          description: "Complete your basic owner and business information",
          fields: [
            "ownerName", "email", "phone", "identificationType", "ownerAddress", 
            "businessType", "restaurantName", "businessEmail", "businessPhone", 
            "restaurantAddress", "city", "province", "postalCode"
          ],
          completed: true, // Always completed after registration
          isCurrentStage: restaurant.registrationStage === 1
        },
        2: {
          title: "Banking Information & HST Number",
          description: "Provide your banking information and HST number",
          fields: ["bankingInfo", "HSTNumber"],
          completed: restaurant.registrationStage > 1,
          isCurrentStage: restaurant.registrationStage === 2
        },
        3: {
          title: "Document Uploads", 
          description: "Upload required business documents",
          fields: [
            "drivingLicenseUrl", "voidChequeUrl", "HSTdocumentUrl", 
            "foodHandlingCertificateUrl", "articleofIncorporation"
          ],
          completed: restaurant.registrationStage > 2,
          isCurrentStage: restaurant.registrationStage === 3
        }
      };

      // Get current stage details
      const currentStageInfo = this.getNextStageInfo(restaurant.registrationStage, restaurant);

      this.successResponse(res, {
        restaurant,
        currentStage: restaurant.registrationStage,
        isRegistrationComplete: restaurant.isRegistrationComplete,
        stages,
        currentStageInfo,
        progress: {
          totalStages: 3,
          completedStages: restaurant.registrationStage - 1,
          currentStage: restaurant.registrationStage,
          percentage: Math.round(((restaurant.registrationStage - 1) / 3) * 100)
        }
      });

    } catch (error) {
      console.error('Get dashboard error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Update specific stage (allows going back and forth)
  async updateSpecificStage(req, res) {
    try {
      const { stage, data } = req.body;
      const restaurant = await Restaurant.findByPk(req.user.id);
      
      if (!restaurant) {
        return this.errorResponse(res, 'Restaurant not found', 404);
      }

      // Validate stage number
      if (stage < 1 || stage > 3) {
        return this.errorResponse(res, 'Invalid stage number', 400);
      }

      // Update restaurant with stage data
      await restaurant.update({
        ...data,
        registrationStage: stage,
        isRegistrationComplete: stage === 3
      });

      // Fetch updated restaurant
      const updatedRestaurant = await Restaurant.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      this.successResponse(res, {
        message: `Stage ${stage} updated successfully`,
        restaurant: updatedRestaurant,
        currentStage: stage,
        isRegistrationComplete: stage === 3
      });

    } catch (error) {
      console.error('Update specific stage error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Get specific stage data
  async getStageData(req, res) {
    try {
      const { stage } = req.params;
      const restaurant = await Restaurant.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!restaurant) {
        return this.errorResponse(res, 'Restaurant not found', 404);
      }

      // Get stage-specific fields
      const stageFields = this.getStageFields(parseInt(stage));
      
      // Extract only the fields relevant to this stage
      const stageData = {};
      stageFields.forEach(field => {
        if (restaurant[field] !== undefined) {
          stageData[field] = restaurant[field];
        }
      });

      this.successResponse(res, {
        stage: parseInt(stage),
        data: stageData,
        stageInfo: this.getNextStageInfo(parseInt(stage), restaurant)
      });

    } catch (error) {
      console.error('Get stage data error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Helper method to get fields for specific stage
  getStageFields(stage) {
    const stageFields = {
      1: [
        'ownerName', 'email', 'phone', 'identificationType', 'ownerAddress', 
        'businessType', 'restaurantName', 'businessEmail', 'businessPhone', 
        'restaurantAddress', 'city', 'province', 'postalCode'
      ],
      2: ['bankingInfo', 'HSTNumber'],
      3: [
        'drivingLicenseUrl', 'voidChequeUrl', 'HSTdocumentUrl', 
        'foodHandlingCertificateUrl', 'articleofIncorporation'
      ]
    };
    return stageFields[stage] || [];
  }
}

module.exports = new RestaurantStagedController();
