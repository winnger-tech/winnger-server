'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('drivers', 'registrationStage', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false
    });

    await queryInterface.addColumn('drivers', 'isRegistrationComplete', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('drivers', 'registrationStage');
    await queryInterface.removeColumn('drivers', 'isRegistrationComplete');
  }
}; 