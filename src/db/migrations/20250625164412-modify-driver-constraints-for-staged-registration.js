'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Make fields nullable for staged registration
    await queryInterface.changeColumn('drivers', 'dateOfBirth', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'cellNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'streetNameNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'province', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'postalCode', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert back to NOT NULL (this might fail if there are null values)
    await queryInterface.changeColumn('drivers', 'dateOfBirth', {
      type: Sequelize.DATE,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'cellNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'streetNameNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'city', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'province', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'postalCode', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
