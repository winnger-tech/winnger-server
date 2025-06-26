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

      // Stage 2: Business details
      if (currentStage === 1) {
        const requiredFields = ['phone', 'identificationType', 'restaurantName', 'businessAddress', 'city', 'province', 'postalCode'];
        const hasAllFields = requiredFields.every(field => updateData[field]);
        
        if (hasAllFields) {
          nextStage = 2;
        }
      }
      
      // Stage 3: Documents
      else if (currentStage === 2) {
        const requiredFields = ['businessDocumentUrl', 'drivingLicenseUrl', 'voidChequeUrl'];
        const hasAllFields = requiredFields.every(field => updateData[field]);
        
        if (hasAllFields) {
          nextStage = 3;
        }
      }
      
      // Stage 4: Menu and hours
      else if (currentStage === 3) {
        const requiredFields = ['menuDetails', 'hoursOfOperation'];
        const hasAllFields = requiredFields.every(field => updateData[field]);
        
        if (hasAllFields) {
          nextStage = 4;
        }
      }
      
      // Stage 5: Banking and tax information
      else if (currentStage === 4) {
        const requiredFields = ['bankingInfo', 'taxInfo'];
        const hasAllFields = requiredFields.every(field => updateData[field]);
        
        if (hasAllFields) {
          nextStage = 5;
          isComplete = true;
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
          title: "Basic Information",
          description: "Complete your basic owner information",
          fields: ["ownerName", "email", "password"],
          completed: true // Always completed after registration
        },
        2: {
          title: "Business Details",
          description: "Provide your business and contact information",
          fields: ["phone", "identificationType", "restaurantName", "businessAddress", "city", "province", "postalCode"]
        },
        3: {
          title: "Documents Upload", 
          description: "Upload required business documents",
          fields: ["businessDocumentUrl", "drivingLicenseUrl", "voidChequeUrl"]
        },
        4: {
          title: "Menu & Hours",
          description: "Set up your menu and operating hours",
          fields: ["menuDetails", "hoursOfOperation"]
        },
        5: {
          title: "Banking & Tax Information",
          description: "Complete banking and tax information",
          fields: ["bankingInfo", "taxInfo"]
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
        title: "Business Details",
        description: "Please provide your business and contact information",
        requiredFields: ["phone", "identificationType", "restaurantName", "businessAddress", "city", "province", "postalCode"]
      },
      3: {
        title: "Documents Upload",
        description: "Upload required business documents", 
        requiredFields: ["businessDocumentUrl", "drivingLicenseUrl", "voidChequeUrl"]
      },
      4: {
        title: "Menu & Hours",
        description: "Set up your menu and operating hours",
        requiredFields: ["menuDetails", "hoursOfOperation"]
      },
      5: {
        title: "Banking & Tax Information",
        description: "Complete banking and tax information",
        requiredFields: ["bankingInfo", "taxInfo"]
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
          title: "Basic Information",
          description: "Complete your basic owner information",
          fields: ["ownerName", "restaurantName", "email", "password"],
          completed: true, // Always completed after registration
          isCurrentStage: restaurant.registrationStage === 1
        },
        2: {
          title: "Business Details",
          description: "Provide your business and contact information",
          fields: ["phone", "identificationType", "businessAddress", "city", "province", "postalCode"],
          completed: restaurant.registrationStage > 1,
          isCurrentStage: restaurant.registrationStage === 2
        },
        3: {
          title: "Documents Upload", 
          description: "Upload required business documents",
          fields: ["businessDocumentUrl", "drivingLicenseUrl", "voidChequeUrl"],
          completed: restaurant.registrationStage > 2,
          isCurrentStage: restaurant.registrationStage === 3
        },
        4: {
          title: "Menu & Hours",
          description: "Set up your menu and operating hours",
          fields: ["menuDetails", "hoursOfOperation"],
          completed: restaurant.registrationStage > 3,
          isCurrentStage: restaurant.registrationStage === 4
        },
        5: {
          title: "Banking & Tax Information",
          description: "Complete banking and tax information",
          fields: ["bankingInfo", "taxInfo"],
          completed: restaurant.registrationStage > 4,
          isCurrentStage: restaurant.registrationStage === 5
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
          totalStages: 5,
          completedStages: restaurant.registrationStage - 1,
          currentStage: restaurant.registrationStage,
          percentage: Math.round(((restaurant.registrationStage - 1) / 5) * 100)
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
      if (stage < 1 || stage > 5) {
        return this.errorResponse(res, 'Invalid stage number', 400);
      }

      // Update restaurant with stage data
      await restaurant.update({
        ...data,
        registrationStage: stage,
        isRegistrationComplete: stage === 5
      });

      // Fetch updated restaurant
      const updatedRestaurant = await Restaurant.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      this.successResponse(res, {
        message: `Stage ${stage} updated successfully`,
        restaurant: updatedRestaurant,
        currentStage: stage,
        isRegistrationComplete: stage === 5
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
      1: ['ownerName', 'restaurantName', 'email'],
      2: ['phone', 'identificationType', 'businessAddress', 'city', 'province', 'postalCode'],
      3: ['businessDocumentUrl', 'drivingLicenseUrl', 'voidChequeUrl'],
      4: ['menuDetails', 'hoursOfOperation'],
      5: ['bankingInfo', 'taxInfo']
    };
    return stageFields[stage] || [];
  }
}

module.exports = new RestaurantStagedController();
