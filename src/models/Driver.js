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
      allowNull: false
    },
    cellNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    streetNameNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    appUniteNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleType: {
      type: DataTypes.ENUM('Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other'),
      allowNull: false
    },
    vehicleMake: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleModel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deliveryType: {
      type: DataTypes.ENUM('Meals', 'Parcel', 'Grocery', 'Other'),
      allowNull: false
    },
    yearOfManufacture: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    vehicleColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleLicensePlate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    driversLicenseClass: {
      type: DataTypes.STRING,
      allowNull: false
    },
    driversLicenseFrontUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    driversLicenseBackUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleRegistrationUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleInsuranceUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    drivingAbstractUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    drivingAbstractDate: {
      type: DataTypes.DATE,
      allowNull: false
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
      allowNull: false
    },
    workEligibilityType: {
      type: DataTypes.ENUM('passport', 'pr_card', 'work_permit', 'study_permit'),
      allowNull: false
    },
    sinNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sinCardUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankingInfo: {
      type: DataTypes.JSONB,
      allowNull: false
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
    }
  }, {
    sequelize,
    modelName: 'Driver',
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
