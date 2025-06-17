'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Drivers', 'consentAndDeclarations', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Drivers', 'consentAndDeclarations');
  }
};