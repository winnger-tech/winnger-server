const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing fields for staged registration to drivers table
    
    // Add sinCardNumber field (replacing sinNumber for stage 3)
    await queryInterface.addColumn('drivers', 'sinCardNumber', {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Add transitNumber field for banking information
    await queryInterface.addColumn('drivers', 'transitNumber', {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Add institutionNumber field for banking information
    await queryInterface.addColumn('drivers', 'institutionNumber', {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Add noofstages field to track total stages
    await queryInterface.addColumn('drivers', 'noofstages', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    });

    // Update existing records to have proper default values
    await queryInterface.sequelize.query(`
      UPDATE drivers 
      SET 
        "registrationStage" = 1,
        "isRegistrationComplete" = false,
        noofstages = 5
      WHERE "registrationStage" IS NULL OR "isRegistrationComplete" IS NULL
    `);

    // Make some fields nullable for staged registration
    await queryInterface.changeColumn('drivers', 'vehicleType', {
      type: DataTypes.ENUM('Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other'),
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'vehicleMake', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'vehicleModel', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'deliveryType', {
      type: DataTypes.ENUM('Meals', 'Parcel', 'Grocery', 'Other'),
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'yearOfManufacture', {
      type: DataTypes.INTEGER,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'vehicleColor', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'vehicleLicensePlate', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'driversLicenseClass', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'driversLicenseFrontUrl', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'driversLicenseBackUrl', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'vehicleRegistrationUrl', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'vehicleInsuranceUrl', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'drivingAbstractUrl', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'drivingAbstractDate', {
      type: DataTypes.DATE,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'workEligibilityUrl', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'workEligibilityType', {
      type: DataTypes.ENUM('passport', 'pr_card', 'work_permit', 'study_permit'),
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'sinNumber', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'sinCardUrl', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'bankingInfo', {
      type: DataTypes.JSONB,
      allowNull: true
    });

    await queryInterface.changeColumn('drivers', 'consentAndDeclarations', {
      type: DataTypes.JSONB,
      allowNull: true
    });

    console.log('✅ Migration completed: Added missing staged registration fields');
  },

  async down(queryInterface, Sequelize) {
    // Remove added columns
    await queryInterface.removeColumn('drivers', 'sinCardNumber');
    await queryInterface.removeColumn('drivers', 'transitNumber');
    await queryInterface.removeColumn('drivers', 'institutionNumber');
    await queryInterface.removeColumn('drivers', 'noofstages');

    // Revert nullable changes back to NOT NULL (be careful in production!)
    await queryInterface.changeColumn('drivers', 'vehicleType', {
      type: DataTypes.ENUM('Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other'),
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'vehicleMake', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'vehicleModel', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'deliveryType', {
      type: DataTypes.ENUM('Meals', 'Parcel', 'Grocery', 'Other'),
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'yearOfManufacture', {
      type: DataTypes.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'vehicleColor', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'vehicleLicensePlate', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'driversLicenseClass', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'driversLicenseFrontUrl', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'driversLicenseBackUrl', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'vehicleRegistrationUrl', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'vehicleInsuranceUrl', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'drivingAbstractUrl', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'drivingAbstractDate', {
      type: DataTypes.DATE,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'workEligibilityUrl', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'workEligibilityType', {
      type: DataTypes.ENUM('passport', 'pr_card', 'work_permit', 'study_permit'),
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'sinNumber', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'sinCardUrl', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'bankingInfo', {
      type: DataTypes.JSONB,
      allowNull: false
    });

    await queryInterface.changeColumn('drivers', 'consentAndDeclarations', {
      type: DataTypes.JSONB,
      allowNull: false
    });

    console.log('✅ Migration reverted: Removed staged registration fields');
  }
}; 