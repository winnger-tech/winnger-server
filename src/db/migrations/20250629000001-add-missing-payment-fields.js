'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Add payment-related fields
      await queryInterface.addColumn('restaurants', 'paymentStatus', {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending',
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('restaurants', 'stripePaymentIntentId', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('restaurants', 'stripePaymentMethodId', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('restaurants', 'pendingPaymentIntentId', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('restaurants', 'paymentCompletedAt', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('restaurants', 'registrationCompletedAt', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      // Add review & confirmation fields
      await queryInterface.addColumn('restaurants', 'agreedToTerms', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('restaurants', 'confirmationChecked', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('restaurants', 'additionalNotes', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('restaurants', 'reviewCompletedAt', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      // Update status enum to include 'pending_approval'
      await queryInterface.changeColumn('restaurants', 'status', {
        type: Sequelize.ENUM('pending', 'pending_approval', 'approved', 'rejected', 'suspended'),
        defaultValue: 'pending',
        allowNull: false
      }, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Remove payment-related fields
      await queryInterface.removeColumn('restaurants', 'paymentStatus', { transaction });
      await queryInterface.removeColumn('restaurants', 'stripePaymentIntentId', { transaction });
      await queryInterface.removeColumn('restaurants', 'stripePaymentMethodId', { transaction });
      await queryInterface.removeColumn('restaurants', 'pendingPaymentIntentId', { transaction });
      await queryInterface.removeColumn('restaurants', 'paymentCompletedAt', { transaction });
      await queryInterface.removeColumn('restaurants', 'registrationCompletedAt', { transaction });

      // Remove review & confirmation fields
      await queryInterface.removeColumn('restaurants', 'agreedToTerms', { transaction });
      await queryInterface.removeColumn('restaurants', 'confirmationChecked', { transaction });
      await queryInterface.removeColumn('restaurants', 'additionalNotes', { transaction });
      await queryInterface.removeColumn('restaurants', 'reviewCompletedAt', { transaction });

      // Revert status enum
      await queryInterface.changeColumn('restaurants', 'status', {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'suspended'),
        defaultValue: 'pending',
        allowNull: false
      }, { transaction });
    });
  }
}; 