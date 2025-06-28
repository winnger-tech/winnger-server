// updated_adminController.js
const {
  Driver,
  Restaurant,
  Admin
} = require('../models'); // ✅ use this instead of individual files

//const Driver = require('../models/Driver');
//const Restaurant = require('../models/Restaurant');
//const {Admin} = require('../models');
const jwt = require('jsonwebtoken');
const {
  sendEmail
} = require('../utils/email');
const {
  Op
} = require('sequelize');
const ExcelJS = require('exceljs');
const json2csv = require('json2csv').parse;
exports.login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    if (!email || !password) return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
    const admin = await Admin.findOne({
      where: {
        email
      }
    });
    if (!admin || !(await admin.comparePassword(password))) return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
    admin.lastLogin = new Date();
    await admin.save();
    const token = jwt.sign({
      id: admin.id,
      role: admin.role
    }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
    res.status(200).json({
      success: true,
      type: 'admin',
      token,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {
      drivers: {
        total: await Driver.count(),
        pending: await Driver.count({
          where: {
            status: 'pending'
          }
        }),
        approved: await Driver.count({
          where: {
            status: 'approved'
          }
        }),
        rejected: await Driver.count({
          where: {
            status: 'rejected'
          }
        }),
        paymentCompleted: await Driver.count({
          where: {
            paymentStatus: 'completed'
          }
        }),
        registrationComplete: await Driver.count({
          where: {
            isRegistrationComplete: true
          }
        }),
        registrationInProgress: await Driver.count({
          where: {
            isRegistrationComplete: false
          }
        })
      },
      restaurants: {
        total: await Restaurant.count(),
        pending: await Restaurant.count({
          where: {
            status: 'pending'
          }
        }),
        approved: await Restaurant.count({
          where: {
            status: 'approved'
          }
        }),
        rejected: await Restaurant.count({
          where: {
            status: 'rejected'
          }
        }),
        suspended: await Restaurant.count({
          where: {
            status: 'suspended'
          }
        }),
        registrationComplete: await Restaurant.count({
          where: {
            isRegistrationComplete: true
          }
        }),
        registrationInProgress: await Restaurant.count({
          where: {
            isRegistrationComplete: false
          }
        })
      }
    };
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAllDrivers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const where = {};

    // Filter by status
    if (req.query.status) where.status = req.query.status;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
    if (req.query.registrationComplete !== undefined) {
      where.isRegistrationComplete = req.query.registrationComplete === 'true';
    }
    if (req.query.registrationStage) where.registrationStage = parseInt(req.query.registrationStage);

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }

    // Search functionality
    if (req.query.search) {
      where[Op.or] = [{
        firstName: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }, {
        lastName: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }, {
        email: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }, {
        cellNumber: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }];
    }
    const total = await Driver.count({
      where
    });
    const drivers = await Driver.findAll({
      where,
      attributes: {
        exclude: ['password']
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({
      success: true,
      total,
      count: drivers.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAllRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const where = {};

    // Filter by status
    if (req.query.status) where.status = req.query.status;
    if (req.query.registrationComplete !== undefined) {
      where.isRegistrationComplete = req.query.registrationComplete === 'true';
    }
    if (req.query.currentStep) where.currentStep = parseInt(req.query.currentStep);

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }

    // Search functionality
    if (req.query.search) {
      where[Op.or] = [{
        restaurantName: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }, {
        ownerName: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }, {
        email: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }, {
        phone: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }, {
        businessEmail: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }];
    }
    const total = await Restaurant.count({
      where
    });
    const restaurants = await Restaurant.findAll({
      where,
      attributes: {
        exclude: ['password']
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Add document URLs and computed fields for each restaurant
    const restaurantsWithDocs = restaurants.map(restaurant => {
      const restaurantData = restaurant.toJSON();

      // Add all document URLs
      restaurantData.documents = {
        drivingLicense: restaurant.drivingLicenseUrl,
        voidCheque: restaurant.voidChequeUrl,
        hstDocument: restaurant.HSTdocumentUrl,
        foodHandlingCertificate: restaurant.foodHandlingCertificateUrl,
        articleOfIncorporation: restaurant.articleofIncorporation
      };

      // Add document expiry dates
      restaurantData.documentExpiryDates = {
        articleOfIncorporation: restaurant.articleofIncorporationExpiryDate,
        foodSafetyCertificate: restaurant.foodSafetyCertificateExpiryDate
      };

      // Add registration progress
      restaurantData.registrationProgress = {
        currentStep: restaurant.currentStep,
        totalSteps: 5,
        isComplete: restaurant.isRegistrationComplete,
        completedSteps: restaurant.completedSteps || [],
        progressPercentage: Math.round(restaurant.currentStep / 5 * 100)
      };
      return restaurantData;
    });
    res.status(200).json({
      success: true,
      total,
      count: restaurantsWithDocs.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: restaurantsWithDocs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get detailed driver information by ID
exports.getDriverById = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const driver = await Driver.findByPk(id, {
      attributes: {
        exclude: ['password']
      }
    });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Add computed fields for better admin view
    const driverData = driver.toJSON();

    // Add full name
    driverData.fullName = `${driver.firstName || ''} ${driver.middleName || ''} ${driver.lastName || ''}`.trim();

    // Add all document URLs
    driverData.documents = {
      profilePhoto: driver.profilePhotoUrl || null,
      driversLicenseFront: driver.driversLicenseFrontUrl || null,
      driversLicenseBack: driver.driversLicenseBackUrl || null,
      vehicleRegistration: driver.vehicleRegistrationUrl || null,
      vehicleInsurance: driver.vehicleInsuranceUrl || null,
      drivingAbstract: driver.drivingAbstractUrl || null,
      criminalBackgroundCheck: driver.criminalBackgroundCheckUrl || null,
      workEligibility: driver.workEligibilityUrl || null,
      sinCard: driver.sinCardUrl || null
    };

    // Add document dates
    driverData.documentDates = {
      drivingAbstract: driver.drivingAbstractDate || null,
      criminalBackgroundCheck: driver.criminalBackgroundCheckDate || null
    };

    // Add vehicle information
    driverData.vehicle = {
      type: driver.vehicleType || null,
      make: driver.vehicleMake || null,
      model: driver.vehicleModel || null,
      year: driver.yearOfManufacture || null,
      color: driver.vehicleColor || null,
      licensePlate: driver.vehicleLicensePlate || null,
      licenseClass: driver.driversLicenseClass || null
    };

    // Add address information
    driverData.address = {
      street: driver.streetNameNumber || null,
      unit: driver.appUniteNumber || null,
      city: driver.city || null,
      province: driver.province || null,
      postalCode: driver.postalCode || null
    };

    // Add registration progress
    driverData.registrationProgress = {
      currentStage: driver.registrationStage,
      totalStages: 5,
      // Assuming 5 stages
      isComplete: driver.isRegistrationComplete,
      progressPercentage: Math.round(driver.registrationStage / 5 * 100)
    };

    // Add payment information
    driverData.payment = {
      status: driver.paymentStatus || null,
      stripePaymentIntentId: driver.stripePaymentIntentId || null
    };

    // Add background check information
    driverData.backgroundCheck = {
      status: driver.backgroundCheckStatus || null,
      certnApplicantId: driver.certnApplicantId || null
    };

    // Add personal information
    driverData.personal = {
      dateOfBirth: driver.dateOfBirth || null,
      sinNumber: driver.sinNumber || null,
      workEligibilityType: driver.workEligibilityType || null,
      accountNumber: driver.accountNumber || null
    };
    res.status(200).json({
      success: true,
      data: driverData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get detailed restaurant information by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const restaurant = await Restaurant.findByPk(id, {
      attributes: {
        exclude: ['password']
      }
    });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Add computed fields for better admin view
    const restaurantData = restaurant.toJSON();

    // Add all document URLs
    restaurantData.documents = {
      drivingLicense: restaurant.drivingLicenseUrl,
      voidCheque: restaurant.voidChequeUrl,
      hstDocument: restaurant.HSTdocumentUrl,
      foodHandlingCertificate: restaurant.foodHandlingCertificateUrl,
      articleOfIncorporation: restaurant.articleofIncorporation
    };

    // Add document expiry dates
    restaurantData.documentExpiryDates = {
      articleOfIncorporation: restaurant.articleofIncorporationExpiryDate,
      foodSafetyCertificate: restaurant.foodSafetyCertificateExpiryDate
    };

    // Add banking information
    restaurantData.banking = restaurant.bankingInfo || {};

    // Add business information
    restaurantData.business = {
      name: restaurant.restaurantName,
      type: restaurant.businessType,
      email: restaurant.businessEmail,
      phone: restaurant.businessPhone,
      address: restaurant.restaurantAddress,
      city: restaurant.city,
      province: restaurant.province,
      postalCode: restaurant.postalCode
    };

    // Add owner information
    restaurantData.owner = {
      name: restaurant.ownerName,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.ownerAddress,
      identificationType: restaurant.identificationType
    };

    // Add tax information
    restaurantData.tax = {
      hstNumber: restaurant.HSTNumber
    };

    // Add registration progress
    restaurantData.registrationProgress = {
      currentStep: restaurant.currentStep,
      totalSteps: 5,
      isComplete: restaurant.isRegistrationComplete,
      completedSteps: restaurant.completedSteps || [],
      progressPercentage: Math.round(restaurant.currentStep / 5 * 100)
    };

    // Add payment information
    restaurantData.payment = {
      status: restaurant.paymentStatus,
      stripePaymentIntentId: restaurant.stripePaymentIntentId,
      stripePaymentMethodId: restaurant.stripePaymentMethodId,
      pendingPaymentIntentId: restaurant.pendingPaymentIntentId,
      completedAt: restaurant.paymentCompletedAt
    };

    // Add review and confirmation information
    restaurantData.review = {
      agreedToTerms: restaurant.agreedToTerms,
      confirmationChecked: restaurant.confirmationChecked,
      additionalNotes: restaurant.additionalNotes,
      reviewCompletedAt: restaurant.reviewCompletedAt
    };

    // Add operating hours
    restaurantData.operations = {
      hoursOfOperation: restaurant.hoursOfOperation
    };

    // Add admin management information
    restaurantData.admin = {
      approvedAt: restaurant.approvedAt,
      approvedBy: restaurant.approvedBy,
      rejectionReason: restaurant.rejectionReason,
      notes: restaurant.notes,
      statusUpdatedAt: restaurant.statusUpdatedAt
    };
    res.status(200).json({
      success: true,
      data: restaurantData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all drivers with detailed information (no pagination for admin dashboard)
exports.getAllDriversDetailed = async (req, res) => {
  try {
    const where = {};

    // Filter by status
    if (req.query.status) where.status = req.query.status;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
    if (req.query.registrationComplete !== undefined) {
      where.isRegistrationComplete = req.query.registrationComplete === 'true';
    }
    if (req.query.registrationStage) where.registrationStage = parseInt(req.query.registrationStage);

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }
    const drivers = await Driver.findAll({
      where,
      attributes: {
        exclude: ['password']
      },
      order: [['createdAt', 'DESC']]
    });

    // Add computed fields for each driver
    const driversWithProgress = drivers.map(driver => {
      const driverData = driver.toJSON();

      // Add full name
      driverData.fullName = `${driver.firstName || ''} ${driver.middleName || ''} ${driver.lastName || ''}`.trim();

      // Add all document URLs
      driverData.documents = {
        profilePhoto: driver.profilePhotoUrl || null,
        driversLicenseFront: driver.driversLicenseFrontUrl || null,
        driversLicenseBack: driver.driversLicenseBackUrl || null,
        vehicleRegistration: driver.vehicleRegistrationUrl || null,
        vehicleInsurance: driver.vehicleInsuranceUrl || null,
        drivingAbstract: driver.drivingAbstractUrl || null,
        criminalBackgroundCheck: driver.criminalBackgroundCheckUrl || null,
        workEligibility: driver.workEligibilityUrl || null,
        sinCard: driver.sinCardUrl || null
      };

      // Add document dates
      driverData.documentDates = {
        drivingAbstract: driver.drivingAbstractDate || null,
        criminalBackgroundCheck: driver.criminalBackgroundCheckDate || null
      };

      // Add vehicle information
      driverData.vehicle = {
        type: driver.vehicleType || null,
        make: driver.vehicleMake || null,
        model: driver.vehicleModel || null,
        year: driver.yearOfManufacture || null,
        color: driver.vehicleColor || null,
        licensePlate: driver.vehicleLicensePlate || null,
        licenseClass: driver.driversLicenseClass || null
      };

      // Add address information
      driverData.address = {
        street: driver.streetNameNumber || null,
        unit: driver.appUniteNumber || null,
        city: driver.city || null,
        province: driver.province || null,
        postalCode: driver.postalCode || null
      };

      // Add registration progress
      driverData.registrationProgress = {
        currentStage: driver.registrationStage || 1,
        totalStages: 5,
        isComplete: driver.isRegistrationComplete || false,
        progressPercentage: Math.round((driver.registrationStage || 1) / 5 * 100)
      };

      // Add payment information
      driverData.payment = {
        status: driver.paymentStatus || null,
        stripePaymentIntentId: driver.stripePaymentIntentId || null
      };

      // Add background check information
      driverData.backgroundCheck = {
        status: driver.backgroundCheckStatus || null,
        certnApplicantId: driver.certnApplicantId || null
      };

      // Add personal information
      driverData.personal = {
        dateOfBirth: driver.dateOfBirth || null,
        sinNumber: driver.sinNumber || null,
        workEligibilityType: driver.workEligibilityType || null,
        accountNumber: driver.accountNumber || null
      };
      return driverData;
    });
    res.status(200).json({
      success: true,
      count: driversWithProgress.length,
      data: driversWithProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all restaurants with detailed information (no pagination for admin dashboard)
exports.getAllRestaurantsDetailed = async (req, res) => {
  try {
    const where = {};

    // Filter by status
    if (req.query.status) where.status = req.query.status;
    if (req.query.registrationComplete !== undefined) {
      where.isRegistrationComplete = req.query.registrationComplete === 'true';
    }
    if (req.query.currentStep) where.currentStep = parseInt(req.query.currentStep);

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }
    const restaurants = await Restaurant.findAll({
      where,
      attributes: {
        exclude: ['password']
      },
      order: [['createdAt', 'DESC']]
    });

    // Add computed fields for each restaurant
    const restaurantsWithProgress = restaurants.map(restaurant => {
      const restaurantData = restaurant.toJSON();

      // Add all document URLs
      restaurantData.documents = {
        drivingLicense: restaurant.drivingLicenseUrl,
        voidCheque: restaurant.voidChequeUrl,
        hstDocument: restaurant.HSTdocumentUrl,
        foodHandlingCertificate: restaurant.foodHandlingCertificateUrl,
        articleOfIncorporation: restaurant.articleofIncorporation
      };

      // Add document expiry dates
      restaurantData.documentExpiryDates = {
        articleOfIncorporation: restaurant.articleofIncorporationExpiryDate,
        foodSafetyCertificate: restaurant.foodSafetyCertificateExpiryDate
      };

      // Add banking information
      restaurantData.banking = restaurant.bankingInfo || {};

      // Add business information
      restaurantData.business = {
        name: restaurant.restaurantName,
        type: restaurant.businessType,
        email: restaurant.businessEmail,
        phone: restaurant.businessPhone,
        address: restaurant.restaurantAddress,
        city: restaurant.city,
        province: restaurant.province,
        postalCode: restaurant.postalCode
      };

      // Add owner information
      restaurantData.owner = {
        name: restaurant.ownerName,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.ownerAddress,
        identificationType: restaurant.identificationType
      };

      // Add tax information
      restaurantData.tax = {
        hstNumber: restaurant.HSTNumber
      };

      // Add registration progress
      restaurantData.registrationProgress = {
        currentStep: restaurant.currentStep,
        totalSteps: 5,
        isComplete: restaurant.isRegistrationComplete,
        completedSteps: restaurant.completedSteps || [],
        progressPercentage: Math.round(restaurant.currentStep / 5 * 100)
      };

      // Add payment information
      restaurantData.payment = {
        status: restaurant.paymentStatus,
        stripePaymentIntentId: restaurant.stripePaymentIntentId,
        stripePaymentMethodId: restaurant.stripePaymentMethodId,
        pendingPaymentIntentId: restaurant.pendingPaymentIntentId,
        completedAt: restaurant.paymentCompletedAt
      };

      // Add review and confirmation information
      restaurantData.review = {
        agreedToTerms: restaurant.agreedToTerms,
        confirmationChecked: restaurant.confirmationChecked,
        additionalNotes: restaurant.additionalNotes,
        reviewCompletedAt: restaurant.reviewCompletedAt
      };

      // Add operating hours
      restaurantData.operations = {
        hoursOfOperation: restaurant.hoursOfOperation
      };

      // Add admin management information
      restaurantData.admin = {
        approvedAt: restaurant.approvedAt,
        approvedBy: restaurant.approvedBy,
        rejectionReason: restaurant.rejectionReason,
        notes: restaurant.notes,
        statusUpdatedAt: restaurant.statusUpdatedAt
      };
      return restaurantData;
    });
    res.status(200).json({
      success: true,
      count: restaurantsWithProgress.length,
      data: restaurantsWithProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.updateDriverStatus = async (req, res) => {
  try {
    const {
      status,
      remarks
    } = req.body;
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({
      success: false,
      message: 'Driver not found'
    });
    const previousStatus = driver.status;
    driver.status = status;
    if (remarks) driver.remarks = remarks;
    await driver.save();
    await sendEmail({
      email: driver.email,
      subject: `Status Update: ${status.toUpperCase()}`,
      message: `Your status is now: ${status.toUpperCase()}. ${remarks || ''}`
    });
    res.status(200).json({
      success: true,
      message: `Driver status updated from ${previousStatus} to ${status}`,
      data: {
        id: driver.id,
        email: driver.email,
        name: `${driver.firstName || ''} ${driver.lastName || ''}`.trim(),
        previousStatus,
        currentStatus: driver.status,
        remarks: driver.remarks,
        updatedAt: driver.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.updateRestaurantStatus = async (req, res) => {
  try {
    const {
      status,
      remarks,
      notes
    } = req.body;
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
    const previousStatus = restaurant.status;
    restaurant.status = status;
    if (remarks) {
      restaurant.rejectionReason = remarks;
    }
    if (notes) {
      restaurant.notes = notes;
    }

    // Set approval details if status is approved
    if (status === 'approved') {
      restaurant.approvedAt = new Date();
      restaurant.approvedBy = req.admin.id;
    }
    await restaurant.save();
    await sendEmail({
      email: restaurant.email,
      subject: `Status Update: ${status.toUpperCase()}`,
      message: `Your status is now: ${status.toUpperCase()}. ${remarks || ''}`
    });
    res.status(200).json({
      success: true,
      message: `Restaurant status updated from ${previousStatus} to ${status}`,
      data: {
        id: restaurant.id,
        email: restaurant.email,
        name: restaurant.restaurantName || restaurant.ownerName,
        previousStatus,
        currentStatus: restaurant.status,
        rejectionReason: restaurant.rejectionReason,
        notes: restaurant.notes,
        approvedAt: restaurant.approvedAt,
        approvedBy: restaurant.approvedBy,
        updatedAt: restaurant.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.exportData = async (req, res) => {
  try {
    const {
      type,
      format = 'csv',
      status,
      paymentStatus,
      startDate,
      endDate,
      registrationComplete
    } = req.query;
    if (!['drivers', 'restaurants'].includes(type)) return res.status(400).json({
      success: false,
      message: 'Invalid export type'
    });
    const Model = type === 'drivers' ? Driver : Restaurant;
    const where = {};
    if (status) where.status = status;
    if (registrationComplete !== undefined) {
      where.isRegistrationComplete = registrationComplete === 'true';
    }

    // Only apply payment status filter for drivers
    if (type === 'drivers' && paymentStatus) where.paymentStatus = paymentStatus;
    if (startDate && endDate) where.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
    const data = await Model.findAll({
      where,
      attributes: {
        exclude: ['password']
      }
    });
    const formatted = data.map(item => {
      const baseData = {
        ID: item.id,
        Email: item.email,
        Status: item.status,
        'Registration Complete': item.isRegistrationComplete ? 'Yes' : 'No',
        'Created At': item.createdAt.toISOString(),
        'Updated At': item.updatedAt.toISOString()
      };
      if (type === 'drivers') {
        return {
          ...baseData,
          Name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
          Phone: item.cellNumber,
          'Registration Stage': item.registrationStage,
          'Total Stages': item.noofstages || 5,
          'Payment Status': item.paymentStatus,
          'Vehicle Type': item.vehicleType,
          'Delivery Type': item.deliveryType,
          'Background Check Status': item.backgroundCheckStatus,
          'Email Verified': item.emailVerified ? 'Yes' : 'No'
        };
      } else {
        return {
          ...baseData,
          'Restaurant Name': item.restaurantName,
          'Owner Name': item.ownerName,
          Phone: item.phone,
          'Business Email': item.businessEmail,
          'Business Phone': item.businessPhone,
          'Current Step': item.currentStep,
          'Completed Steps': (item.completedSteps || []).join(', '),
          City: item.city,
          Province: item.province,
          'Business Type': item.businessType,
          'HST Number': item.HSTNumber,
          'Email Verified': item.emailVerified ? 'Yes' : 'No',
          'Approved At': item.approvedAt ? item.approvedAt.toISOString() : '',
          'Rejection Reason': item.rejectionReason || ''
        };
      }
    });
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(type);
      sheet.addRow(Object.keys(formatted[0]));
      formatted.forEach(row => sheet.addRow(Object.values(row)));
      sheet.getRow(1).font = {
        bold: true
      };
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
    } else {
      const csv = json2csv(formatted);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.csv`);
      res.send(csv);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update driver payment status
exports.updateDriverPayment = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      action
    } = req.body;
    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }
    let paymentStatus;
    switch (action) {
      case 'approve':
        paymentStatus = 'completed';
        break;
      case 'reject':
        paymentStatus = 'failed';
        break;
      case 'retry':
        paymentStatus = 'pending';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
    await driver.update({
      paymentStatus
    });
    await sendEmail({
      email: driver.email,
      subject: `Payment Status Update: ${paymentStatus.toUpperCase()}`,
      message: `Your payment status has been updated to: ${paymentStatus.toUpperCase()}`
    });
    res.json({
      success: true,
      data: {
        id,
        paymentStatus
      }
    });
  } catch (error) {
    console.error('Error updating driver payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment status'
    });
  }
};

// Note: Restaurant payment methods removed as restaurants no longer have payment fields

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: {
        email
      }
    });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin' // Default to 'admin' if role not specified
    });

    // Generate token
    const token = jwt.sign({
      id: admin.id,
      role: admin.role
    }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
    res.status(201).json({
      success: true,
      type: 'admin',
      token,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk update driver statuses
exports.bulkUpdateDriverStatus = async (req, res) => {
  try {
    const {
      driverIds,
      status,
      remarks
    } = req.body;
    if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of driver IDs'
      });
    }
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status'
      });
    }
    const drivers = await Driver.findAll({
      where: {
        id: driverIds
      }
    });
    if (drivers.length !== driverIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some driver IDs were not found'
      });
    }
    const updatePromises = drivers.map(async driver => {
      driver.status = status;
      if (remarks) driver.remarks = remarks;
      await driver.save();

      // Send email notification
      await sendEmail({
        email: driver.email,
        subject: `Status Update: ${status.toUpperCase()}`,
        message: `Your status has been updated to: ${status.toUpperCase()}. ${remarks || ''}`
      });
      return driver;
    });
    const updatedDrivers = await Promise.all(updatePromises);
    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedDrivers.length} drivers`,
      data: updatedDrivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk update restaurant statuses
exports.bulkUpdateRestaurantStatus = async (req, res) => {
  try {
    const {
      restaurantIds,
      status,
      remarks,
      notes
    } = req.body;
    if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of restaurant IDs'
      });
    }
    if (!status || !['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status'
      });
    }
    const restaurants = await Restaurant.findAll({
      where: {
        id: restaurantIds
      }
    });
    if (restaurants.length !== restaurantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some restaurant IDs were not found'
      });
    }
    const updatePromises = restaurants.map(async restaurant => {
      restaurant.status = status;
      if (remarks) restaurant.rejectionReason = remarks;
      if (notes) restaurant.notes = notes;

      // Set approval details if status is approved
      if (status === 'approved') {
        restaurant.approvedAt = new Date();
        restaurant.approvedBy = req.admin.id;
      }
      await restaurant.save();

      // Send email notification
      await sendEmail({
        email: restaurant.email,
        subject: `Status Update: ${status.toUpperCase()}`,
        message: `Your status has been updated to: ${status.toUpperCase()}. ${remarks || ''}`
      });
      return restaurant;
    });
    const updatedRestaurants = await Promise.all(updatePromises);
    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedRestaurants.length} restaurants`,
      data: updatedRestaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk update payment statuses
exports.bulkUpdateDriverPayment = async (req, res) => {
  try {
    const {
      driverIds,
      action
    } = req.body;
    if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of driver IDs'
      });
    }
    if (!action || !['approve', 'reject', 'retry'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid action'
      });
    }
    let paymentStatus;
    switch (action) {
      case 'approve':
        paymentStatus = 'completed';
        break;
      case 'reject':
        paymentStatus = 'failed';
        break;
      case 'retry':
        paymentStatus = 'pending';
        break;
    }
    const drivers = await Driver.findAll({
      where: {
        id: driverIds
      }
    });
    if (drivers.length !== driverIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some driver IDs were not found'
      });
    }
    const updatePromises = drivers.map(async driver => {
      await driver.update({
        paymentStatus
      });

      // Send email notification
      await sendEmail({
        email: driver.email,
        subject: `Payment Status Update: ${paymentStatus.toUpperCase()}`,
        message: `Your payment status has been updated to: ${paymentStatus.toUpperCase()}`
      });
      return {
        id: driver.id,
        paymentStatus
      };
    });
    const updatedDrivers = await Promise.all(updatePromises);
    res.status(200).json({
      success: true,
      message: `Successfully updated payment status for ${updatedDrivers.length} drivers`,
      data: updatedDrivers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Note: Restaurant payment bulk update method removed as restaurants no longer have payment fields

// Get detailed admin information by ID
exports.getAdminById = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const admin = await Admin.findByPk(id, {
      attributes: {
        exclude: ['password']
      }
    });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Add computed fields for better admin view
    const adminData = admin.toJSON();

    // Add admin information
    adminData.adminInfo = {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin
    };

    // Add account information
    adminData.account = {
      id: admin.id,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };
    res.status(200).json({
      success: true,
      data: adminData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all admins with detailed information
exports.getAllAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const where = {};

    // Filter by role
    if (req.query.role) where.role = req.query.role;

    // Search functionality
    if (req.query.search) {
      where[Op.or] = [{
        name: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }, {
        email: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }];
    }
    const total = await Admin.count({
      where
    });
    const admins = await Admin.findAll({
      where,
      attributes: {
        exclude: ['password']
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Add computed fields for each admin
    const adminsWithInfo = admins.map(admin => {
      const adminData = admin.toJSON();

      // Add admin information
      adminData.adminInfo = {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      };

      // Add account information
      adminData.account = {
        id: admin.id,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      };
      return adminData;
    });
    res.status(200).json({
      success: true,
      total,
      count: adminsWithInfo.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: adminsWithInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};