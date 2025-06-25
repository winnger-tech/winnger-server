'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Admins table
    await queryInterface.createTable('Admins', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'super_admin'),
        defaultValue: 'admin'
      },
      lastLogin: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Drivers table
    await queryInterface.createTable('Drivers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profilePhotoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      middleName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dateOfBirth: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cellNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      streetNameNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      appUniteNumber: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      province: {
        type: Sequelize.STRING,
        allowNull: false
      },
      postalCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicleType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicleMake: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicleModel: {
        type: Sequelize.STRING,
        allowNull: false
      },
      yearOfManufacture: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      vehicleColor: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicleLicensePlate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      driversLicenseClass: {
        type: Sequelize.STRING,
        allowNull: false
      },
      driversLicenseFrontUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      driversLicenseBackUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicleRegistrationUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicleInsuranceUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deliveryType: {
        type: Sequelize.ENUM('Meals', 'Parcel', 'Grocery', 'Other'),
        allowNull: false
      },
      drivingAbstractUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      drivingAbstractDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      criminalBackgroundCheckUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      criminalBackgroundCheckDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      workEligibilityUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      workEligibilityType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sinNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sinCardUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bankingInfo: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      backgroundCheckStatus: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      certnApplicantId: {
        type: Sequelize.STRING
      },
      stripePaymentIntentId: {
        type: Sequelize.STRING
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      consentAndDeclarations: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Restaurants table
    await queryInterface.createTable('restaurants', { // lowercase to match model
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        ownerName: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        phone: { type: Sequelize.STRING, allowNull: false },
        identificationType: { type: Sequelize.ENUM('licence', 'pr_card', 'passport', 'medical_card', 'provincial_id'), allowNull: false },
        restaurantName: { type: Sequelize.STRING, allowNull: false },
        businessAddress: { type: Sequelize.STRING, allowNull: false },
        city: { type: Sequelize.STRING, allowNull: false },
        province: { type: Sequelize.ENUM('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'), allowNull: false },
        postalCode: { type: Sequelize.STRING, allowNull: false },
        bankingInfo: { type: Sequelize.JSONB, allowNull: false },
        taxInfo: { type: Sequelize.JSONB, allowNull: false },
        businessDocumentUrl: { type: Sequelize.STRING, allowNull: false },
        businessLicenseUrl: { type: Sequelize.STRING, allowNull: false },
        //drivingLicenseUrl: { type: Sequelize.STRING, allowNull: false },
        voidChequeUrl: { type: Sequelize.STRING, allowNull: false },
        menuDetails: { type: Sequelize.JSONB, allowNull: false },
        hoursOfOperation: { type: Sequelize.JSONB, allowNull: false },
        stripePaymentIntentId: { type: Sequelize.STRING, allowNull: true },
        paymentStatus: { type: Sequelize.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
        paymentAmount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 50.00 },
        paymentDate: { type: Sequelize.DATE, allowNull: true },
        status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'suspended'), defaultValue: 'pending' },
        emailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
        emailVerificationToken: { type: Sequelize.STRING, allowNull: true },
        emailVerificationExpires: { type: Sequelize.DATE, allowNull: true },
        approvedAt: { type: Sequelize.DATE, allowNull: true },
        approvedBy: { type: Sequelize.UUID, allowNull: true },
        rejectionReason: { type: Sequelize.TEXT, allowNull: true },
        notes: { type: Sequelize.TEXT, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        deletedAt: { type: Sequelize.DATE }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('restaurants');
    await queryInterface.dropTable('Drivers');
    await queryInterface.dropTable('Admins');
  }
};