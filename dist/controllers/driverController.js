const BaseController = require('./BaseController');
const {
  Driver,
  sequelize
} = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
  certnApi
} = require('../utils/certnApi');
class DriverController extends BaseController {
  constructor() {
    super();
    this.stripe = stripe;
    this.register = this.register.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
    this.handleBackgroundCheckWebhook = this.handleBackgroundCheckWebhook.bind(this);
  }
  async register(req, res) {
    try {
      this.validateRequest(req);
      const {
        email,
        password,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        cellNumber,
        streetNameNumber,
        appUniteNumber,
        city,
        province,
        postalCode,
        vehicleType,
        vehicleMake,
        vehicleModel,
        yearOfManufacture,
        vehicleColor,
        vehicleLicensePlate,
        driversLicenseClass,
        drivingAbstractDate,
        workEligibilityType,
        sinNumber,
        bankingInfo,
        consentAndDeclarations,
        // Document URLs from frontend
        profilePhotoUrl,
        driversLicenseFrontUrl,
        driversLicenseBackUrl,
        vehicleRegistrationUrl,
        vehicleInsuranceUrl,
        drivingAbstractUrl,
        workEligibilityUrl,
        sinCardUrl,
        criminalBackgroundCheckUrl,
        criminalBackgroundCheckDate
      } = req.body;
      const parsedBankingInfo = JSON.parse(bankingInfo);
      const parsedConsentAndDeclarations = JSON.parse(consentAndDeclarations);

      // Validate required document URLs
      const requiredDocuments = {
        profilePhotoUrl,
        driversLicenseFrontUrl,
        driversLicenseBackUrl,
        vehicleRegistrationUrl,
        vehicleInsuranceUrl,
        drivingAbstractUrl,
        workEligibilityUrl
      };
      for (const [docType, url] of Object.entries(requiredDocuments)) {
        if (!url) {
          throw new Error(`Missing required document URL: ${docType}`);
        }
      }

      // Create driver without payment intent
      const result = await sequelize.transaction(async t => {
        const driver = await Driver.create({
          email,
          password,
          firstName,
          middleName,
          lastName,
          dateOfBirth,
          cellNumber,
          streetNameNumber,
          appUniteNumber,
          city,
          province,
          postalCode,
          vehicleType,
          vehicleMake,
          vehicleModel,
          deliveryType: 'Meals',
          // Default value
          yearOfManufacture,
          vehicleColor,
          vehicleLicensePlate,
          driversLicenseClass,
          drivingAbstractDate,
          workEligibilityType,
          sinNumber,
          bankingInfo: parsedBankingInfo,
          consentAndDeclarations: parsedConsentAndDeclarations,
          paymentStatus: 'pending',
          // Set as pending
          // Document URLs
          profilePhotoUrl,
          driversLicenseFrontUrl,
          driversLicenseBackUrl,
          vehicleRegistrationUrl,
          vehicleInsuranceUrl,
          drivingAbstractUrl,
          workEligibilityUrl,
          sinCardUrl,
          criminalBackgroundCheckUrl,
          criminalBackgroundCheckDate
        }, {
          transaction: t
        });
        return driver;
      });
      return res.status(201).json({
        success: true,
        data: {
          driverId: result.id
        },
        message: 'Driver registration submitted successfully. Please complete payment.'
      });
    } catch (error) {
      console.error('Driver registration error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to register driver'
      });
    }
  }
  async confirmPayment(req, res) {
    try {
      const {
        driverId,
        paymentIntentId
      } = req.body;

      // Verify the payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        throw {
          status: 400,
          message: 'Payment not completed'
        };
      }

      // Find and update driver
      const driver = await Driver.findByPk(driverId);
      if (!driver) {
        throw {
          status: 404,
          message: 'Driver not found'
        };
      }

      // Verify this payment belongs to this driver
      if (driver.stripePaymentIntentId !== paymentIntentId) {
        throw {
          status: 400,
          message: 'Payment mismatch'
        };
      }

      // Update payment status and ensure it's saved
      await driver.update({
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentIntentId
      });

      // Double check the update was successful
      const updatedDriver = await Driver.findByPk(driverId);
      if (updatedDriver.paymentStatus !== 'completed') {
        throw {
          status: 500,
          message: 'Failed to update payment status'
        };
      }

      // Initiate background check (now optional)
      // try {
      //   const applicant = await certnApi.createApplicant({
      //     firstName: driver.firstName,
      //     lastName: driver.lastName,
      //     email: driver.email,
      //     phoneNumber: driver.cellNumber,
      //     dateOfBirth: driver.dateOfBirth,
      //     address: {
      //       streetAddress: driver.streetNameNumber,
      //       unit: driver.appUniteNumber,
      //       city: driver.city,
      //       province: driver.province,
      //       postalCode: driver.postalCode,
      //       country: 'CA'
      //     },
      //     documents: {
      //       driverLicense: driver.driversLicenseNumber,
      //       sinNumber: driver.sinNumber
      //     }
      //   });

      //   const check = await certnApi.requestBackgroundCheck({
      //     type: 'criminal',
      //     applicantId: applicant.id,
      //     callbackUrl: `${process.env.API_URL}/api/drivers/background-check-webhook`
      //   });

      //   await driver.update({
      //     certnApplicantId: applicant.id,
      //     backgroundCheckStatus: 'in_progress'
      //   });
      // } catch (bgError) {
      //   console.error('Background check initiation failed:', bgError);
      //   // Don't fail the payment confirmation if background check fails
      // }

      return res.json({
        success: true,
        message: 'Payment confirmed successfully',
        paymentStatus: 'completed'
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to confirm payment'
      });
    }
  }
  async handleBackgroundCheckWebhook(req, res) {
    try {
      const {
        type,
        data
      } = req.body;
      const driver = await Driver.findOne({
        where: {
          certnCheckId: data.checkId
        }
      });
      if (!driver) {
        throw {
          status: 404,
          message: 'Driver not found'
        };
      }
      switch (type) {
        case 'check.completed':
          await driver.update({
            backgroundCheckStatus: 'completed',
            criminalBackgroundCheckUrl: data.results?.criminalCheck?.reportUrl,
            drivingAbstractUrl: data.results?.drivingAbstract?.reportUrl
          });
          break;
        case 'check.failed':
          await driver.update({
            backgroundCheckStatus: 'failed'
          });
          break;
        default:
          console.log(`Unhandled webhook type: ${type}`);
      }
      return this.handleSuccess(res, {
        message: 'Webhook processed'
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }
  async checkRegistrationStatus(req, res) {
    try {
      const {
        driverId
      } = req.params;
      const driver = await Driver.findByPk(driverId);
      if (!driver) {
        throw {
          status: 404,
          message: 'Driver not found'
        };
      }

      // Check all registration requirements
      const registrationStatus = {
        isComplete: false,
        paymentStatus: driver.paymentStatus,
        backgroundCheckStatus: driver.backgroundCheckStatus,
        adminApprovalStatus: driver.status,
        missingRequirements: []
      };

      // Check payment status
      if (driver.paymentStatus !== 'completed') {
        registrationStatus.missingRequirements.push('Payment not completed');
      }

      // Background check is now optional - don't block registration completion
      // if (driver.backgroundCheckStatus !== 'completed') {
      //   registrationStatus.missingRequirements.push('Background check not completed');
      // }

      // Check admin approval status
      if (driver.status !== 'approved') {
        registrationStatus.missingRequirements.push('Admin approval pending');
      }

      // Registration is complete if all requirements are met
      registrationStatus.isComplete = registrationStatus.missingRequirements.length === 0;
      return res.json({
        success: true,
        data: registrationStatus
      });
    } catch (error) {
      console.error('Registration status check error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to check registration status'
      });
    }
  }
  async getDriverById(req, res) {
    try {
      const {
        driverId
      } = req.params;
      const driver = await Driver.findByPk(driverId, {
        attributes: {
          exclude: ['password', 'bankingInfo', 'sinNumber'] // Exclude sensitive data
        }
      });
      if (!driver) {
        throw {
          status: 404,
          message: 'Driver not found'
        };
      }
      return res.json({
        success: true,
        data: driver
      });
    } catch (error) {
      console.error('Get driver by ID error:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve driver'
      });
    }
  }
}
module.exports = new DriverController();