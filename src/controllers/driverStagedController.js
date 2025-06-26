const BaseController = require('./BaseController');
const { Driver } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class DriverStagedController extends BaseController {
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
      const { firstName, lastName, email, password } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return this.errorResponse(res, 'First name, last name, email, and password are required', 400);
      }

      // Check if driver already exists
      const existingDriver = await Driver.findOne({ where: { email } });
      if (existingDriver) {
        return this.errorResponse(res, 'Driver with this email already exists', 400);
      }

      // Create driver with stage 1 data
      const driver = await Driver.create({
        firstName,
        lastName,
        email,
        password,
        registrationStage: 1,
        isRegistrationComplete: false
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: driver.id, email: driver.email, type: 'driver' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      this.successResponse(res, {
        message: 'Driver registered successfully',
        type: 'driver',
        driver: {
          id: driver.id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          registrationStage: driver.registrationStage,
          isRegistrationComplete: driver.isRegistrationComplete
        },
        token
      }, 201);

    } catch (error) {
      console.error('Driver registration error:', error);
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

      // Find driver
      const driver = await Driver.findOne({ where: { email } });
      if (!driver) {
        return this.errorResponse(res, 'Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await driver.comparePassword(password);
      if (!isPasswordValid) {
        return this.errorResponse(res, 'Invalid credentials', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: driver.id, email: driver.email, type: 'driver' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      this.successResponse(res, {
        message: 'Login successful',
        type: 'driver',
        driver: {
          id: driver.id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          registrationStage: driver.registrationStage,
          isRegistrationComplete: driver.isRegistrationComplete
        },
        token
      });

    } catch (error) {
      console.error('Driver login error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      this.successResponse(res, {
        driver,
        nextStage: this.getNextStageInfo(driver.registrationStage, driver)
      });

    } catch (error) {
      console.error('Get profile error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Update registration stage
  async updateStage(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id);
      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      const currentStage = driver.registrationStage;
      const updateData = req.body;

      let nextStage = currentStage;
      let isComplete = false;

      // Stage 2: Personal details
      if (currentStage === 1) {
        const requiredFields = ['dateOfBirth', 'cellNumber', 'streetNameNumber', 'city', 'province', 'postalCode'];
        const hasAllFields = requiredFields.every(field => updateData[field]);
        
        if (hasAllFields) {
          nextStage = 2;
        }
      }
      
      // Stage 3: Vehicle information
      else if (currentStage === 2) {
        const requiredFields = ['vehicleType', 'vehicleMake', 'vehicleModel', 'deliveryType', 'yearOfManufacture', 'vehicleColor', 'vehicleLicensePlate', 'driversLicenseClass'];
        const hasAllFields = requiredFields.every(field => updateData[field]);
        
        if (hasAllFields) {
          nextStage = 3;
        }
      }
      
      // Stage 4: Documents
      else if (currentStage === 3) {
        const requiredFields = ['driversLicenseFrontUrl', 'driversLicenseBackUrl', 'vehicleRegistrationUrl', 'vehicleInsuranceUrl', 'drivingAbstractUrl', 'drivingAbstractDate', 'workEligibilityUrl', 'workEligibilityType', 'sinNumber'];
        const hasAllFields = requiredFields.every(field => updateData[field]);
        
        if (hasAllFields) {
          nextStage = 4;
        }
      }
      
      // Stage 5: Banking and consent
      else if (currentStage === 4) {
        const requiredFields = ['bankingInfo', 'consentAndDeclarations'];
        const hasAllFields = requiredFields.every(field => updateData[field]);
        
        if (hasAllFields) {
          nextStage = 5;
          isComplete = true;
        }
      }

      // Update driver with new data
      await driver.update({
        ...updateData,
        registrationStage: nextStage,
        isRegistrationComplete: isComplete
      });

      // Fetch updated driver
      const updatedDriver = await Driver.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      this.successResponse(res, {
        message: `Stage ${currentStage} completed successfully`,
        driver: updatedDriver,
        nextStage: isComplete ? null : this.getNextStageInfo(nextStage, updatedDriver)
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
          description: "Complete your basic profile information",
          fields: ["firstName", "lastName", "email", "password"],
          completed: true // Always completed after registration
        },
        2: {
          title: "Personal Details",
          description: "Provide your personal and address information",
          fields: ["dateOfBirth", "cellNumber", "streetNameNumber", "appUniteNumber", "city", "province", "postalCode"]
        },
        3: {
          title: "Vehicle Information", 
          description: "Tell us about your vehicle and delivery preferences",
          fields: ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass"]
        },
        4: {
          title: "Documents Upload",
          description: "Upload required documents for verification",
          fields: ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinNumber", "sinCardUrl", "criminalBackgroundCheckUrl", "criminalBackgroundCheckDate"]
        },
        5: {
          title: "Banking & Consent",
          description: "Complete banking information and consent forms",
          fields: ["bankingInfo", "consentAndDeclarations"]
        }
      };

      this.successResponse(res, { stages });

    } catch (error) {
      console.error('Get stages error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Helper method to get next stage information
  getNextStageInfo(currentStage, driver) {
    const stageInfo = {
      2: {
        title: "Personal Details",
        description: "Please provide your personal and address information",
        requiredFields: ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode"],
        optionalFields: ["appUniteNumber"]
      },
      3: {
        title: "Vehicle Information",
        description: "Tell us about your vehicle and delivery preferences", 
        requiredFields: ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass"]
      },
      4: {
        title: "Documents Upload",
        description: "Upload required documents for verification",
        requiredFields: ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinNumber"],
        optionalFields: ["sinCardUrl", "criminalBackgroundCheckUrl", "criminalBackgroundCheckDate"]
      },
      5: {
        title: "Banking & Consent",
        description: "Complete banking information and consent forms",
        requiredFields: ["bankingInfo", "consentAndDeclarations"]
      }
    };

    return stageInfo[currentStage] || null;
  }

  // Get dashboard information
  async getDashboard(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      // Get all stages information
      const stages = {
        1: {
          title: "Basic Information",
          description: "Complete your basic profile information",
          fields: ["firstName", "lastName", "email", "password"],
          completed: true, // Always completed after registration
          isCurrentStage: driver.registrationStage === 1
        },
        2: {
          title: "Personal Details",
          description: "Provide your personal and address information",
          fields: ["dateOfBirth", "cellNumber", "streetNameNumber", "appUniteNumber", "city", "province", "postalCode"],
          completed: driver.registrationStage > 1,
          isCurrentStage: driver.registrationStage === 2
        },
        3: {
          title: "Vehicle Information", 
          description: "Tell us about your vehicle and delivery preferences",
          fields: ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass"],
          completed: driver.registrationStage > 2,
          isCurrentStage: driver.registrationStage === 3
        },
        4: {
          title: "Documents Upload",
          description: "Upload required documents for verification",
          fields: ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinNumber", "sinCardUrl", "criminalBackgroundCheckUrl", "criminalBackgroundCheckDate"],
          completed: driver.registrationStage > 3,
          isCurrentStage: driver.registrationStage === 4
        },
        5: {
          title: "Banking & Consent",
          description: "Complete banking information and consent forms",
          fields: ["bankingInfo", "consentAndDeclarations"],
          completed: driver.registrationStage > 4,
          isCurrentStage: driver.registrationStage === 5
        }
      };

      // Get current stage details
      const currentStageInfo = this.getNextStageInfo(driver.registrationStage, driver);

      this.successResponse(res, {
        driver,
        currentStage: driver.registrationStage,
        isRegistrationComplete: driver.isRegistrationComplete,
        stages,
        currentStageInfo,
        progress: {
          totalStages: 5,
          completedStages: driver.registrationStage - 1,
          currentStage: driver.registrationStage,
          percentage: Math.round(((driver.registrationStage - 1) / 5) * 100)
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
      const driver = await Driver.findByPk(req.user.id);
      
      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      // Validate stage number
      if (stage < 1 || stage > 5) {
        return this.errorResponse(res, 'Invalid stage number', 400);
      }

      // Update driver with stage data
      await driver.update({
        ...data,
        registrationStage: stage,
        isRegistrationComplete: stage === 5
      });

      // Fetch updated driver
      const updatedDriver = await Driver.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      this.successResponse(res, {
        message: `Stage ${stage} updated successfully`,
        driver: updatedDriver,
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
      const driver = await Driver.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      // Get stage-specific fields
      const stageFields = this.getStageFields(parseInt(stage));
      
      // Extract only the fields relevant to this stage
      const stageData = {};
      stageFields.forEach(field => {
        if (driver[field] !== undefined) {
          stageData[field] = driver[field];
        }
      });

      this.successResponse(res, {
        stage: parseInt(stage),
        data: stageData,
        stageInfo: this.getNextStageInfo(parseInt(stage), driver)
      });

    } catch (error) {
      console.error('Get stage data error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Helper method to get fields for specific stage
  getStageFields(stage) {
    const stageFields = {
      1: ['firstName', 'lastName', 'email'],
      2: ['dateOfBirth', 'cellNumber', 'streetNameNumber', 'appUniteNumber', 'city', 'province', 'postalCode'],
      3: ['vehicleType', 'vehicleMake', 'vehicleModel', 'deliveryType', 'yearOfManufacture', 'vehicleColor', 'vehicleLicensePlate', 'driversLicenseClass'],
      4: ['driversLicenseFrontUrl', 'driversLicenseBackUrl', 'vehicleRegistrationUrl', 'vehicleInsuranceUrl', 'drivingAbstractUrl', 'drivingAbstractDate', 'workEligibilityUrl', 'workEligibilityType', 'sinNumber', 'sinCardUrl', 'criminalBackgroundCheckUrl', 'criminalBackgroundCheckDate'],
      5: ['bankingInfo', 'consentAndDeclarations']
    };
    return stageFields[stage] || [];
  }
}

module.exports = new DriverStagedController();
