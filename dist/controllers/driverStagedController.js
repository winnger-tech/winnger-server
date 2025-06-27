const BaseController = require('./BaseController');
const {
  Driver
} = require('../models');
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
    this.updateStage1 = this.updateStage1.bind(this);
    this.updateStage2 = this.updateStage2.bind(this);
    this.updateStage3 = this.updateStage3.bind(this);
    this.updateStage4 = this.updateStage4.bind(this);
    this.updateStage5 = this.updateStage5.bind(this);
  }

  // Stage 1: Initial registration with basic info only
  async register(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        password
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return this.errorResponse(res, 'First name, last name, email, and password are required', 400);
      }

      // Check if driver already exists
      const existingDriver = await Driver.findOne({
        where: {
          email
        }
      });
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
      const token = jwt.sign({
        id: driver.id,
        email: driver.email,
        type: 'driver'
      }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });
      this.successResponse(res, {
        message: 'Driver registered successfully. Please complete your profile.',
        type: 'driver',
        driver: {
          id: driver.id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          registrationStage: driver.registrationStage,
          isRegistrationComplete: driver.isRegistrationComplete
        },
        token,
        nextStage: this.getNextStageInfo(2, driver)
      }, 201);
    } catch (error) {
      console.error('Driver registration error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Login
  async login(req, res) {
    try {
      const {
        email,
        password
      } = req.body;
      if (!email || !password) {
        return this.errorResponse(res, 'Email and password are required', 400);
      }

      // Find driver
      const driver = await Driver.findOne({
        where: {
          email
        }
      });
      if (!driver) {
        return this.errorResponse(res, 'Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await driver.comparePassword(password);
      if (!isPasswordValid) {
        return this.errorResponse(res, 'Invalid credentials', 401);
      }

      // Generate JWT token
      const token = jwt.sign({
        id: driver.id,
        email: driver.email,
        type: 'driver'
      }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });

      // Generate a human-readable stage message
      let stageMessage = '';
      if (driver.isRegistrationComplete) {
        stageMessage = 'Registration complete. You can now access all features.';
      } else {
        const currentStageInfo = this.getCurrentStageInfo(driver.registrationStage);
        if (currentStageInfo && currentStageInfo.title) {
          stageMessage = `You are currently on Stage ${driver.registrationStage}: ${currentStageInfo.title}. ${currentStageInfo.description}`;
        } else {
          stageMessage = `You are currently on Stage ${driver.registrationStage}. Please complete this stage to continue.`;
        }
      }
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
        stageMessage,
        token,
        nextStage: driver.isRegistrationComplete ? null : this.getNextStageInfo(driver.registrationStage, driver)
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
        attributes: {
          exclude: ['password']
        }
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

  // Update Stage 1: Personal Details (dateOfBirth, cellNumber, address, etc.)
  async updateStage1(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id);
      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }
      const {
        firstName,
        lastName,
        middleName,
        email,
        dateOfBirth,
        cellNumber,
        streetNameNumber,
        appUniteNumber,
        city,
        province,
        postalCode,
        profilePhotoUrl
      } = req.body;

      // Validate required fields for stage 1
      const requiredFields = ['dateOfBirth', 'profilePhotoUrl', 'cellNumber', 'streetNameNumber', 'city', 'province', 'postalCode', 'firstName', 'lastName', 'middleName', 'email'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return this.errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
      }

      // Update driver with stage 1 data
      await driver.update({
        firstName,
        lastName,
        middleName,
        email,
        dateOfBirth,
        profilePhotoUrl,
        cellNumber,
        streetNameNumber,
        appUniteNumber,
        city,
        province,
        postalCode,
        registrationStage: 2
      });

      // Fetch updated driver
      const updatedDriver = await Driver.findByPk(req.user.id, {
        attributes: {
          exclude: ['password']
        }
      });
      this.successResponse(res, {
        message: 'Stage 1 completed successfully. Please proceed to Stage 2.',
        driver: updatedDriver,
        nextStage: this.getNextStageInfo(2, updatedDriver)
      });
    } catch (error) {
      console.error('Update stage 1 error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Update Stage 2: Vehicle Information
  async updateStage2(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id);
      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      // Ensure previous stage is completed
      if (driver.registrationStage < 2) {
        return this.errorResponse(res, 'Please complete Stage 1 first', 400);
      }
      const {
        vehicleType,
        vehicleMake,
        vehicleModel,
        deliveryType,
        yearOfManufacture,
        vehicleColor,
        vehicleLicensePlate,
        driversLicenseClass,
        vehicleInsuranceUrl,
        vehicleRegistrationUrl
      } = req.body;

      // Validate required fields for stage 2
      const requiredFields = ['vehicleType', 'vehicleMake', 'vehicleModel', 'deliveryType', 'yearOfManufacture', 'vehicleColor', 'vehicleLicensePlate', 'driversLicenseClass', 'vehicleInsuranceUrl', 'vehicleRegistrationUrl'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return this.errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
      }

      // Validate vehicle type enum
      const validVehicleTypes = ['Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other'];
      if (!validVehicleTypes.includes(vehicleType)) {
        return this.errorResponse(res, 'Invalid vehicle type', 400);
      }

      // Validate delivery type enum
      const validDeliveryTypes = ['Meals', 'Parcel', 'Grocery', 'Other'];
      if (!validDeliveryTypes.includes(deliveryType)) {
        return this.errorResponse(res, 'Invalid delivery type', 400);
      }

      // Update driver with stage 2 data
      await driver.update({
        vehicleType,
        vehicleMake,
        vehicleModel,
        deliveryType,
        yearOfManufacture,
        vehicleColor,
        vehicleLicensePlate,
        driversLicenseClass,
        vehicleInsuranceUrl,
        vehicleRegistrationUrl,
        registrationStage: 3
      });

      // Fetch updated driver
      const updatedDriver = await Driver.findByPk(req.user.id, {
        attributes: {
          exclude: ['password']
        }
      });
      this.successResponse(res, {
        message: 'Stage 2 completed successfully. Please proceed to Stage 3.',
        driver: updatedDriver,
        nextStage: this.getNextStageInfo(3, updatedDriver)
      });
    } catch (error) {
      console.error('Update stage 2 error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Update Stage 3: Documents Upload (URLs from frontend)
  async updateStage3(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id);
      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      // Ensure previous stage is completed
      if (driver.registrationStage < 3) {
        return this.errorResponse(res, 'Please complete Stage 2 first', 400);
      }
      const {
        driversLicenseFrontUrl,
        driversLicenseBackUrl,
        driversLicenseClass,
        vehicleRegistrationUrl,
        vehicleInsuranceUrl,
        drivingAbstractUrl,
        drivingAbstractDate,
        workEligibilityUrl,
        workEligibilityType,
        sinCardUrl,
        sinCardNumber
      } = req.body;

      // Validate required fields for stage 3
      const requiredFields = ['driversLicenseFrontUrl', 'driversLicenseBackUrl', 'driversLicenseClass', 'vehicleRegistrationUrl', 'vehicleInsuranceUrl', 'drivingAbstractUrl', 'workEligibilityUrl', 'sinCardUrl', 'sinCardNumber', 'drivingAbstractDate', 'workEligibilityType'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return this.errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
      }

      // Validate work eligibility type enum
      const validWorkEligibilityTypes = ['passport', 'pr_card', 'work_permit', 'study_permit'];
      if (!validWorkEligibilityTypes.includes(workEligibilityType)) {
        return this.errorResponse(res, 'Invalid work eligibility type', 400);
      }

      // Update driver with stage 3 data (URLs from frontend)
      await driver.update({
        driversLicenseFrontUrl,
        driversLicenseBackUrl,
        driversLicenseClass,
        vehicleRegistrationUrl,
        vehicleInsuranceUrl,
        drivingAbstractUrl,
        drivingAbstractDate,
        workEligibilityUrl,
        workEligibilityType,
        sinCardUrl,
        sinCardNumber,
        registrationStage: 4
      });

      // Fetch updated driver
      const updatedDriver = await Driver.findByPk(req.user.id, {
        attributes: {
          exclude: ['password']
        }
      });
      this.successResponse(res, {
        message: 'Stage 3 completed successfully. Please proceed to Stage 4.',
        driver: updatedDriver,
        nextStage: this.getNextStageInfo(4, updatedDriver)
      });
    } catch (error) {
      console.error('Update stage 3 error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Update Stage 4: Banking Information
  async updateStage4(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id);
      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      // Ensure previous stage is completed
      if (driver.registrationStage < 4) {
        return this.errorResponse(res, 'Please complete Stage 3 first', 400);
      }
      const {
        bankingInfo,
        transitNumber,
        institutionNumber
      } = req.body;

      // Validate required fields for stage 4
      const requiredFields = ['bankingInfo', 'transitNumber'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return this.errorResponse(res, `Missing required fields: ${missingFields.join(', ')}`, 400);
      }

      // Parse banking info if it's a string
      let parsedBankingInfo = bankingInfo;
      if (typeof bankingInfo === 'string') {
        try {
          parsedBankingInfo = JSON.parse(bankingInfo);
        } catch (error) {
          return this.errorResponse(res, 'Invalid banking information format', 400);
        }
      }

      // Validate banking info structure
      if (!parsedBankingInfo.accountNumber || !parsedBankingInfo.accountHolderName) {
        return this.errorResponse(res, 'Banking information must include account number and account holder name', 400);
      }

      // Update driver with stage 4 data
      await driver.update({
        bankingInfo: parsedBankingInfo,
        transitNumber,
        institutionNumber,
        registrationStage: 5
      });

      // Fetch updated driver
      const updatedDriver = await Driver.findByPk(req.user.id, {
        attributes: {
          exclude: ['password']
        }
      });
      this.successResponse(res, {
        message: 'Stage 4 completed successfully. Please proceed to final stage.',
        driver: updatedDriver,
        nextStage: this.getNextStageInfo(5, updatedDriver)
      });
    } catch (error) {
      console.error('Update stage 4 error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Update Stage 5: Consent and Declarations (Final Stage)
  async updateStage5(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id);
      if (!driver) {
        return this.errorResponse(res, 'Driver not found', 404);
      }

      // Ensure previous stage is completed
      if (driver.registrationStage < 5) {
        return this.errorResponse(res, 'Please complete Stage 4 first', 400);
      }
      const {
        consentAndDeclarations
      } = req.body;

      // Validate required fields for stage 5
      if (!consentAndDeclarations) {
        return this.errorResponse(res, 'Consent and declarations are required', 400);
      }

      // Parse consent and declarations if it's a string
      let parsedConsentAndDeclarations = consentAndDeclarations;
      if (typeof consentAndDeclarations === 'string') {
        try {
          parsedConsentAndDeclarations = JSON.parse(consentAndDeclarations);
        } catch (error) {
          return this.errorResponse(res, 'Invalid consent and declarations format', 400);
        }
      }

      // Validate consent structure
      const requiredConsents = ['backgroundCheck', 'termsOfService', 'privacyPolicy', 'dataCollection'];
      const missingConsents = requiredConsents.filter(consent => !parsedConsentAndDeclarations[consent]);
      if (missingConsents.length > 0) {
        return this.errorResponse(res, `Missing required consents: ${missingConsents.join(', ')}`, 400);
      }

      // Update driver with stage 5 data and mark registration as complete
      await driver.update({
        consentAndDeclarations: parsedConsentAndDeclarations,
        registrationStage: 5,
        isRegistrationComplete: true
      });

      // Fetch updated driver
      const updatedDriver = await Driver.findByPk(req.user.id, {
        attributes: {
          exclude: ['password']
        }
      });
      this.successResponse(res, {
        message: 'Registration completed successfully! Your account is now active.',
        driver: updatedDriver,
        isRegistrationComplete: true
      });
    } catch (error) {
      console.error('Update stage 5 error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Update registration stage (legacy method - keeping for backward compatibility)
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
        attributes: {
          exclude: ['password']
        }
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
          fields: ["dateOfBirth", "cellNumber", "streetNameNumber", "appUniteNumber", "city", "province", "postalCode", "profilePhotoUrl"]
        },
        3: {
          title: "Vehicle Information",
          description: "Tell us about your vehicle and delivery preferences",
          fields: ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"]
        },
        4: {
          title: "Documents Upload",
          description: "Upload required documents for verification",
          fields: ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinCardUrl", "sinCardNumber"]
        },
        5: {
          title: "Banking & Consent",
          description: "Complete banking information and consent forms",
          fields: ["bankingInfo", "consentAndDeclarations"]
        }
      };
      this.successResponse(res, {
        stages
      });
    } catch (error) {
      console.error('Get stages error:', error);
      this.errorResponse(res, error.message, 500);
    }
  }

  // Helper method to get next stage information
  getNextStageInfo(currentStage, driver) {
    const stageInfo = {
      1: {
        title: "Personal Details",
        description: "Please provide your personal and address information",
        requiredFields: ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "profilePhotoUrl"],
        optionalFields: ["appUniteNumber"]
      },
      2: {
        title: "Vehicle Information",
        description: "Tell us about your vehicle and delivery preferences", 
        requiredFields: ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"]
      },
      3: {
        title: "Documents Upload",
        description: "Upload required documents for verification",
        requiredFields: ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinCardUrl", "sinCardNumber"]
      },
      4: {
        title: "Banking & Consent",
        description: "Complete banking information and consent forms",
        requiredFields: ["bankingInfo", "consentAndDeclarations"]
      }
    };

    // Return information about the next stage (currentStage + 1)
    const nextStage = currentStage + 1;
    return stageInfo[nextStage] || null;
  }

  // Helper method to get current stage information
  getCurrentStageInfo(currentStage) {
    const stageInfo = {
      1: {
        title: "Basic Information",
        description: "Complete your basic profile information"
      },
      2: {
        title: "Personal Details",
        description: "Provide your personal and address information"
      },
      3: {
        title: "Vehicle Information",
        description: "Tell us about your vehicle and delivery preferences"
      },
      4: {
        title: "Documents Upload",
        description: "Upload required documents for verification"
      },
      5: {
        title: "Banking & Consent",
        description: "Complete banking information and consent forms"
      }
    };

    return stageInfo[currentStage] || null;
  }

  // Get dashboard information
  async getDashboard(req, res) {
    try {
      const driver = await Driver.findByPk(req.user.id, {
        attributes: {
          exclude: ['password']
        }
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
          completed: true,
          // Always completed after registration
          isCurrentStage: driver.registrationStage === 1
        },
        2: {
          title: "Personal Details",
          description: "Provide your personal and address information",
          fields: ["dateOfBirth", "cellNumber", "streetNameNumber", "appUniteNumber", "city", "province", "postalCode", "profilePhotoUrl"],
          completed: driver.registrationStage > 1,
          isCurrentStage: driver.registrationStage === 2
        },
        3: {
          title: "Vehicle Information",
          description: "Tell us about your vehicle and delivery preferences",
          fields: ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"],
          completed: driver.registrationStage > 2,
          isCurrentStage: driver.registrationStage === 3
        },
        4: {
          title: "Documents Upload",
          description: "Upload required documents for verification",
          fields: ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinCardUrl", "sinCardNumber"],
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
      const currentStageInfo = this.getCurrentStageInfo(driver.registrationStage);
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
          percentage: Math.round((driver.registrationStage - 1) / 5 * 100)
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
      const {
        stage,
        data
      } = req.body;
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
        attributes: {
          exclude: ['password']
        }
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
      const {
        stage
      } = req.params;
      const driver = await Driver.findByPk(req.user.id, {
        attributes: {
          exclude: ['password']
        }
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
      1: ['firstName', 'lastName', 'middleName', 'email', 'dateOfBirth', 'cellNumber', 'streetNameNumber', 'appUniteNumber', 'city', 'province', 'postalCode', 'profilePhotoUrl'],
      2: ['vehicleType', 'vehicleMake', 'vehicleModel', 'deliveryType', 'yearOfManufacture', 'vehicleColor', 'vehicleLicensePlate', 'driversLicenseClass', 'vehicleInsuranceUrl', 'vehicleRegistrationUrl'],
      3: ['driversLicenseFrontUrl', 'driversLicenseBackUrl', 'vehicleRegistrationUrl', 'vehicleInsuranceUrl', 'drivingAbstractUrl', 'drivingAbstractDate', 'workEligibilityUrl', 'workEligibilityType', 'sinCardUrl', 'sinCardNumber'],
      4: ['bankingInfo', 'transitNumber', 'institutionNumber'],
      5: ['consentAndDeclarations']
    };
    return stageFields[stage] || [];
  }
}
module.exports = new DriverStagedController();