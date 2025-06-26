'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make fields nullable for staged registration
    await queryInterface.changeColumn('Drivers', 'dateOfBirth', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'cellNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'streetNameNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'province', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'postalCode', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    // Revert back to NOT NULL (this might fail if there are null values)
    await queryInterface.changeColumn('Drivers', 'dateOfBirth', {
      type: Sequelize.DATE,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'cellNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'streetNameNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'city', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'province', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'postalCode', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};