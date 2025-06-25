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
      unique: true,
      validate: { isEmail: true }
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
      allowNull: true, // Allow null for initial registration
      validate: { len: [2, 50] }
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: { len: [2, 50] }
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null for initial registration
      validate: {
        isAdult(value) {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 18) {
            throw new Error('Must be at least 18 years old');
          }
        }
      }
    },
    cellNumber: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: { is: /^\+1-\d{3}-\d{3}-\d{4}$/ }
    },
    streetNameNumber: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    appUniteNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: {
        isIn: [['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']]
      }
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: { is: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/ }
    },
    vehicleType: {
      type: DataTypes.ENUM('Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other'),
      allowNull: true // Allow null for initial registration
    },
    vehicleMake: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    vehicleModel: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    deliveryType: {
      type: DataTypes.ENUM('Meals', 'Parcel', 'Grocery', 'Other'),
      allowNull: true // Allow null for initial registration
    },
    yearOfManufacture: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for initial registration
      validate: {
        isValidYear(value) {
          if (value) { // Only validate if value exists
            const currentYear = new Date().getFullYear();
            const vehicleAge = currentYear - value;
            // Check if delivery type is meals and apply 25 year rule
            if (this.deliveryType === 'Meals' && vehicleAge > 25) {
              throw new Error('Vehicle must not be older than 25 years for meals delivery');
            }
          }
        }
      }
    },
    vehicleColor: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    vehicleLicensePlate: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: { is: /^[A-Z0-9\s-]+$/i }
    },
    driversLicenseClass: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: {
        isValidClass(value) {
          if (value && this.province) { // Only validate if both values exist
            if (this.province === 'ON') {
              if (!['G', 'G2'].includes(value)) {
                throw new Error('Ontario drivers must have Class G or G2 license');
              }
            } else {
              if (value !== '5') {
                throw new Error('Drivers must have Class 5 license');
              }
            }
          }
        }
      }
    },
    driversLicenseFrontUrl: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    driversLicenseBackUrl: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    vehicleRegistrationUrl: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    vehicleInsuranceUrl: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    drivingAbstractUrl: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    drivingAbstractDate: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null for initial registration
      validate: {
        isWithinThreeMonths(value) {
          if (value) { // Only validate if value exists
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            if (new Date(value) < threeMonthsAgo) {
              throw new Error('Driving abstract must be from the last 3 months');
            }
          }
        }
      }
    },
    criminalBackgroundCheckUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    criminalBackgroundCheckDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isWithinSixMonths(value) {
          if (value) {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            if (new Date(value) < sixMonthsAgo) {
              throw new Error('Criminal background check must be from the last 6 months');
            }
          }
        }
      }
    },
    workEligibilityUrl: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    workEligibilityType: {
      type: DataTypes.ENUM('passport', 'pr_card', 'work_permit', 'study_permit'),
      allowNull: true // Allow null for initial registration
    },
    sinNumber: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: { is: /^\d{9}$/ }
    },
    sinCardUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankingInfo: {
      type: DataTypes.JSONB,
      allowNull: true, // Allow null for initial registration
      validate: {
        hasRequiredFields(value) {
          if (value) { // Only validate if value exists
            const required = ['transitNumber', 'institutionNumber', 'accountNumber'];
            for (const field of required) {
              if (!value[field]) {
                throw new Error(`Banking info missing ${field}`);
              }
            }
            if (!/^\d{3}$/.test(value.transitNumber)) {
              throw new Error('Transit number must be 3 digits');
            }
            if (!/^\d{5}$/.test(value.institutionNumber)) {
              throw new Error('Institution number must be 5 digits');
            }
            if (!/^\d{7,12}$/.test(value.accountNumber)) {
              throw new Error('Account number must be 7-12 digits');
            }
          }
        }
      }
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
    // amount: {
    //   type: DataTypes.DECIMAL(10, 2),
    //   defaultValue: 0.00,
    //   allowNull: true

    // },
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
    // remarks: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    //   comment: 'Internal admin notes or rejection reason'
    // },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    registrationStage: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      comment: 'Stage 1: Basic info, Stage 2: Personal details, Stage 3: Vehicle info, Stage 4: Documents, Stage 5: Banking & consent'
    },
    isRegistrationComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'True when all required fields are completed'
    },
    consentAndDeclarations: {
      type: DataTypes.JSONB,
      allowNull: true, // Allow null for initial registration
      defaultValue: {},
      validate: {
        hasRequiredConsent(value) {
          if (value && Object.keys(value).length > 0) { // Only validate if value exists and not empty
            const required = [
              'termsAndConditions',
              'backgroundScreening',
              'privacyPolicy',
              'electronicCommunication'
            ];
            for (const field of required) {
              if (!value[field]) {
                throw new Error(`Consent missing for ${field}`);
              }
            }
          }
        }
      }
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
