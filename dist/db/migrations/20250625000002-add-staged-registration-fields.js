const {
  DataTypes
} = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add registrationStage column to drivers table
    await queryInterface.addColumn('drivers', 'registrationStage', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    // Add isRegistrationComplete column to drivers table
    await queryInterface.addColumn('drivers', 'isRegistrationComplete', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Check if restaurants table exists before adding columns
    const [results] = await queryInterface.sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurants'");
    if (results.length > 0) {
      // Add registrationStage column to restaurants table
      await queryInterface.addColumn('restaurants', 'registrationStage', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      });

      // Add isRegistrationComplete column to restaurants table
      await queryInterface.addColumn('restaurants', 'isRegistrationComplete', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('drivers', 'registrationStage');
    await queryInterface.removeColumn('drivers', 'isRegistrationComplete');

    // Check if restaurants table exists before removing columns
    const [results] = await queryInterface.sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurants'");
    if (results.length > 0) {
      await queryInterface.removeColumn('restaurants', 'registrationStage');
      await queryInterface.removeColumn('restaurants', 'isRegistrationComplete');
    }
  }
};