'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      
      // Owner Information
      ownerName: {
        type: Sequelize.STRING,
        allowNull: true
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
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      identificationType: {
        type: Sequelize.ENUM('licence', 'pr_card', 'passport', 'medical_card', 'provincial_id'),
        allowNull: true
      },
      
      // Business Information
      restaurantName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      businessAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      province: {
        type: Sequelize.ENUM('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'),
        allowNull: true
      },
      postalCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      
      // Banking Information
      bankingInfo: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      
      // Tax Information
      taxInfo: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      
      // Document URLs
      businessDocumentUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      drivingLicenseUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      voidChequeUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      
      // Menu Details
      menuDetails: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      
      // Hours of Operation
      hoursOfOperation: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      
      // Payment Information
      stripePaymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending',
        allowNull: false
      },
      paymentAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      // Status fields
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'suspended'),
        defaultValue: 'pending',
        allowNull: false
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      registrationStage: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      isRegistrationComplete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      emailVerificationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emailVerificationExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      
      // Additional metadata
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      // Timestamps
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('restaurants', ['email']);
    await queryInterface.addIndex('restaurants', ['restaurantName']);
    await queryInterface.addIndex('restaurants', ['status']);
    await queryInterface.addIndex('restaurants', ['province']);
    await queryInterface.addIndex('restaurants', ['city']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('restaurants');
  }
}; 