const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add registrationStage column to Drivers table
    await queryInterface.addColumn('Drivers', 'registrationStage', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    // Add isRegistrationComplete column to Drivers table
    await queryInterface.addColumn('Drivers', 'isRegistrationComplete', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Check if Restaurants table exists before adding columns
    const [results] = await queryInterface.sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Restaurants'"
    );
    
    if (results.length > 0) {
      // Add registrationStage column to Restaurants table
      await queryInterface.addColumn('Restaurants', 'registrationStage', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      });

      // Add isRegistrationComplete column to Restaurants table
      await queryInterface.addColumn('Restaurants', 'isRegistrationComplete', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Drivers', 'registrationStage');
    await queryInterface.removeColumn('Drivers', 'isRegistrationComplete');
    
    // Check if Restaurants table exists before removing columns
    const [results] = await queryInterface.sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Restaurants'"
    );
    
    if (results.length > 0) {
      await queryInterface.removeColumn('Restaurants', 'registrationStage');
      await queryInterface.removeColumn('Restaurants', 'isRegistrationComplete');
    }
  }
};
