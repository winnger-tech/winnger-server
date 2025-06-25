const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add registrationStage column
    await queryInterface.addColumn('Drivers', 'registrationStage', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    // Add isRegistrationComplete column
    await queryInterface.addColumn('Drivers', 'isRegistrationComplete', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Add registrationStage column to Restaurants table as well
    await queryInterface.addColumn('Restaurants', 'registrationStage', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    // Add isRegistrationComplete column to Restaurants table as well
    await queryInterface.addColumn('Restaurants', 'isRegistrationComplete', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Drivers', 'registrationStage');
    await queryInterface.removeColumn('Drivers', 'isRegistrationComplete');
    await queryInterface.removeColumn('Restaurants', 'registrationStage');
    await queryInterface.removeColumn('Restaurants', 'isRegistrationComplete');
  }
};
