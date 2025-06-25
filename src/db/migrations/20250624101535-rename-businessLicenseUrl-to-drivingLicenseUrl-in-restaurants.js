'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // This is the forward migration: rename the column
    await queryInterface.renameColumn('restaurants', 'businessLicenseUrl', 'drivingLicenseUrl');
  },

  async down (queryInterface, Sequelize) {
    // This is the rollback migration: rename the column back
    await queryInterface.renameColumn('restaurants', 'drivingLicenseUrl', 'businessLicenseUrl');
  }
};
