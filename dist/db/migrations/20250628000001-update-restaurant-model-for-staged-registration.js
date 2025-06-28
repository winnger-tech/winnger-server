'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      // Add new fields for stepwise registration
      await queryInterface.addColumn('restaurants', 'ownerAddress', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'businessType', {
        type: Sequelize.ENUM('solo', 'corporate'),
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'businessEmail', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'businessPhone', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });

      // Check if restaurantAddress already exists, if not add it
      const tableDescription = await queryInterface.describeTable('restaurants');
      if (!tableDescription.restaurantAddress) {
        await queryInterface.addColumn('restaurants', 'restaurantAddress', {
          type: Sequelize.STRING,
          allowNull: true
        }, {
          transaction
        });
      }
      await queryInterface.addColumn('restaurants', 'HSTNumber', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'HSTdocumentUrl', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'foodHandlingCertificateUrl', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'articleofIncorporation', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'articleofIncorporationExpiryDate', {
        type: Sequelize.DATE,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'foodSafetyCertificateExpiryDate', {
        type: Sequelize.DATE,
        allowNull: true
      }, {
        transaction
      });

      // Add registration progress tracking fields
      await queryInterface.addColumn('restaurants', 'currentStep', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'completedSteps', {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      }, {
        transaction
      });

      // Remove old fields that are no longer needed
      await queryInterface.removeColumn('restaurants', 'taxInfo', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'menuDetails', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'hoursOfOperation', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'stripePaymentIntentId', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'paymentStatus', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'paymentAmount', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'paymentDate', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'registrationStage', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'businessDocumentUrl', {
        transaction
      });

      // Add index for currentStep
      await queryInterface.addIndex('restaurants', ['currentStep'], {
        transaction
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      // Remove new fields
      await queryInterface.removeColumn('restaurants', 'ownerAddress', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'businessType', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'businessEmail', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'businessPhone', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'restaurantAddress', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'HSTNumber', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'HSTdocumentUrl', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'foodHandlingCertificateUrl', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'articleofIncorporation', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'articleofIncorporationExpiryDate', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'foodSafetyCertificateExpiryDate', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'currentStep', {
        transaction
      });
      await queryInterface.removeColumn('restaurants', 'completedSteps', {
        transaction
      });

      // Restore old fields
      await queryInterface.addColumn('restaurants', 'taxInfo', {
        type: Sequelize.JSONB,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'menuDetails', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'hoursOfOperation', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'stripePaymentIntentId', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'paymentStatus', {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending',
        allowNull: false
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'paymentAmount', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'paymentDate', {
        type: Sequelize.DATE,
        allowNull: true
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'registrationStage', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      }, {
        transaction
      });
      await queryInterface.addColumn('restaurants', 'businessDocumentUrl', {
        type: Sequelize.STRING,
        allowNull: true
      }, {
        transaction
      });
    });
  }
};