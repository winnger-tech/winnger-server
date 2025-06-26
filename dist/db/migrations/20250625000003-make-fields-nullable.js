const {
  DataTypes
} = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make fields nullable for initial signup in Drivers table
    await queryInterface.changeColumn('Drivers', 'dateOfBirth', {
      type: DataTypes.DATE,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'cellNumber', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'firstName', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'lastName', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'streetNameNumber', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'city', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'province', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('Drivers', 'postalCode', {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Check if Restaurants table exists and make similar changes
    const [results] = await queryInterface.sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Restaurants'");
    if (results.length > 0) {
      await queryInterface.changeColumn('Restaurants', 'phoneNumber', {
        type: DataTypes.STRING,
        allowNull: true
      });
      await queryInterface.changeColumn('Restaurants', 'ownerName', {
        type: DataTypes.STRING,
        allowNull: true
      });
      await queryInterface.changeColumn('Restaurants', 'restaurantName', {
        type: DataTypes.STRING,
        allowNull: true
      });
    }
  },
  async down(queryInterface, Sequelize) {
    // Revert back to NOT NULL (be careful with this in production!)
    await queryInterface.changeColumn('Drivers', 'dateOfBirth', {
      type: DataTypes.DATE,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'cellNumber', {
      type: DataTypes.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'firstName', {
      type: DataTypes.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'lastName', {
      type: DataTypes.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'streetNameNumber', {
      type: DataTypes.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'city', {
      type: DataTypes.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'province', {
      type: DataTypes.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('Drivers', 'postalCode', {
      type: DataTypes.STRING,
      allowNull: false
    });

    // Revert Restaurants table changes if it exists
    const [results] = await queryInterface.sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Restaurants'");
    if (results.length > 0) {
      await queryInterface.changeColumn('Restaurants', 'phoneNumber', {
        type: DataTypes.STRING,
        allowNull: false
      });
      await queryInterface.changeColumn('Restaurants', 'ownerName', {
        type: DataTypes.STRING,
        allowNull: false
      });
      await queryInterface.changeColumn('Restaurants', 'restaurantName', {
        type: DataTypes.STRING,
        allowNull: false
      });
    }
  }
};