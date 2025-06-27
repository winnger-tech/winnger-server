const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class Driver extends Model {
    static associate(models) {}

    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }
  }

  Driver.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    profilePhotoUrl: {
      type: DataTypes.STRING,
      allowNull: true // No live capture required
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cellNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    streetNameNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appUniteNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vehicleType: {
      type: DataTypes.ENUM('Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other'),
      allowNull: true
    },
    vehicleMake: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vehicleModel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    deliveryType: {
      type: DataTypes.ENUM('Meals', 'Parcel', 'Grocery', 'Other'),
      allowNull: true
    },
    yearOfManufacture: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    vehicleColor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vehicleLicensePlate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    driversLicenseClass: {
      type: DataTypes.STRING,
      allowNull: true
    },
    driversLicenseFrontUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    driversLicenseBackUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vehicleRegistrationUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vehicleInsuranceUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    drivingAbstractUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    drivingAbstractDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    criminalBackgroundCheckUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    criminalBackgroundCheckDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    workEligibilityUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    workEligibilityType: {
      type: DataTypes.ENUM('passport', 'pr_card', 'work_permit', 'study_permit'),
      allowNull: true
    },
    sinNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sinCardUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    backgroundCheckStatus: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    certnApplicantId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
      allowNull: false
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    consentAndDeclarations: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    registrationStage: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    isRegistrationComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Driver',
    tableName: 'drivers',
    hooks: {
      beforeSave: async (driver) => {
        if (driver.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          driver.password = await bcrypt.hash(driver.password, salt);
        }
      }
    }
  });

  return Driver;
};
