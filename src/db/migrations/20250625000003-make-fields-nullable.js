const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make fields nullable for initial signup in drivers table
    await queryInterface.changeColumn('drivers', 'dateOfBirth', {
      type: DataTypes.DATE,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'cellNumber', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'firstName', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'lastName', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'streetNameNumber', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'city', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'province', {
      type: DataTypes.STRING,
      allowNull: true
    });
    
    await queryInterface.changeColumn('drivers', 'postalCode', {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Check if restaurants table exists and make similar changes
    const [results] = await queryInterface.sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurants'"
    );
    
    if (results.length > 0) {
      await queryInterface.changeColumn('restaurants', 'phoneNumber', {
        type: DataTypes.STRING,
        allowNull: true
      });
      
      await queryInterface.changeColumn('restaurants', 'ownerName', {
        type: DataTypes.STRING,
        allowNull: true
      });
      
      await queryInterface.changeColumn('restaurants', 'restaurantName', {
        type: DataTypes.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert back to NOT NULL (be careful with this in production!)
    await queryInterface.changeColumn('drivers', 'dateOfBirth', {
      type: DataTypes.DATE,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'cellNumber', {
      type: DataTypes.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'firstName', {
      type: DataTypes.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'lastName', {
      type: DataTypes.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'streetNameNumber', {
      type: DataTypes.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'city', {
      type: DataTypes.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'province', {
      type: DataTypes.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('drivers', 'postalCode', {
      type: DataTypes.STRING,
      allowNull: false
    });

    // Revert restaurants table changes if it exists
    const [results] = await queryInterface.sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurants'"
    );
    
    if (results.length > 0) {
      await queryInterface.changeColumn('restaurants', 'phoneNumber', {
        type: DataTypes.STRING,
        allowNull: false
      });
      
      await queryInterface.changeColumn('restaurants', 'ownerName', {
        type: DataTypes.STRING,
        allowNull: false
      });
      
      await queryInterface.changeColumn('restaurants', 'restaurantName', {
        type: DataTypes.STRING,
        allowNull: false
      });
    }
  }
};
