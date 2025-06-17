const BaseController = require('./BaseController');
const { Driver, sequelize } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { certnApi } = require('../utils/certnApi');

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
      console.log('📥 Received files:', req.files);     // Logs profilePhoto, licenceFront, etc.
      console.log('📝 Received body:', req.body);  
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
        consentAndDeclarations
      } = req.body;
  
      const parsedBankingInfo = JSON.parse(bankingInfo);
      const parsedConsentAndDeclarations = JSON.parse(consentAndDeclarations);
  
      // Create driver without payment intent
      const result = await sequelize.transaction(async (t) => {
        const documentUrls = await this.uploadDriverDocuments(req.files);
  
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
          deliveryType: 'Meals', // Default value
          yearOfManufacture,
          vehicleColor,
          vehicleLicensePlate,
          driversLicenseClass,
          drivingAbstractDate,
          workEligibilityType,
          sinNumber,
          bankingInfo: parsedBankingInfo,
          consentAndDeclarations: parsedConsentAndDeclarations,
          paymentStatus: 'pending', // Set as pending
          ...documentUrls
        }, { transaction: t });
  
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
  

  async uploadDriverDocuments(files) {
    const documentUrls = {};
    const requiredDocuments = [
      'profilePhoto',
      'driversLicenseFront',
      'driversLicenseBack',
      'vehicleRegistration',
      'vehicleInsurance',
      'drivingAbstract',
      'criminalBackgroundCheck', // ADDED
      'workEligibility'
    ];
  
    for (const docType of requiredDocuments) {
      if (files[docType] && files[docType][0]) {
        documentUrls[`${docType}Url`] = files[docType][0].location;
      } else {
        throw new Error(`Missing required document: ${docType}`);
      }
    }
  
    if (files.sinCard && files.sinCard[0]) {
      documentUrls.sinCardUrl = files.sinCard[0].location;
    }
  
    return documentUrls;
  }
  

  async confirmPayment(req, res) {
    try {
      const { driverId, paymentIntentId } = req.body;
  
      // Verify the payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
  
      if (paymentIntent.status !== 'succeeded') {
        throw { status: 400, message: 'Payment not completed' };
      }
  
      // Find and update driver
      const driver = await Driver.findByPk(driverId);
      if (!driver) {
        throw { status: 404, message: 'Driver not found' };
      }
  
      // Verify this payment belongs to this driver
      if (driver.stripePaymentIntentId !== paymentIntentId) {
        throw { status: 400, message: 'Payment mismatch' };
      }
  
      // Update payment status and ensure it's saved
      await driver.update({ 
        paymentStatus: 'completed',
        stripePaymentIntentId: paymentIntentId
      });
  
      // Double check the update was successful
      const updatedDriver = await Driver.findByPk(driverId);
      if (updatedDriver.paymentStatus !== 'completed') {
        throw { status: 500, message: 'Failed to update payment status' };
      }
  
      // Initiate background check
      try {
        const applicant = await certnApi.createApplicant({
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          phoneNumber: driver.cellNumber,
          dateOfBirth: driver.dateOfBirth,
          address: {
            streetAddress: driver.streetNameNumber,
            unit: driver.appUniteNumber,
            city: driver.city,
            province: driver.province,
            postalCode: driver.postalCode,
            country: 'CA'
          },
          documents: {
            driverLicense: driver.driversLicenseNumber,
            sinNumber: driver.sinNumber
          }
        });
  
        const check = await certnApi.requestBackgroundCheck({
          type: 'criminal',
          applicantId: applicant.id,
          callbackUrl: `${process.env.API_URL}/api/drivers/background-check-webhook`
        });
  
        await driver.update({
          certnApplicantId: applicant.id,
          backgroundCheckStatus: 'in_progress'
        });
      } catch (bgError) {
        console.error('Background check initiation failed:', bgError);
        // Don't fail the payment confirmation if background check fails
      }
  
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
      const { type, data } = req.body;

      const driver = await Driver.findOne({
        where: { certnCheckId: data.checkId }
      });

      if (!driver) {
        throw { status: 404, message: 'Driver not found' };
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

      return this.handleSuccess(res, { message: 'Webhook processed' });

    } catch (error) {
      return this.handleError(error, res);
    }
  }
}

module.exports = new DriverController();
