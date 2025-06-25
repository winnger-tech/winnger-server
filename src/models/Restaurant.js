const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class Restaurant extends Model {
    static associate(models) {
      // Define associations here if needed
    }

    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }
  }

  Restaurant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    // Owner Information
    ownerName: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: {
        isValidPhone(value) {
          if (value && !/^\+?1?\d{10,14}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
            throw new Error('Invalid phone number format');
          }
        }
      }
    },
    identificationType: {
      type: DataTypes.ENUM('licence', 'pr_card', 'passport', 'medical_card', 'provincial_id'),
      allowNull: true // Allow null for initial registration
    },
    
    // Business Information
    restaurantName: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
    },
    // businessEmail: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     isEmail: true
    //   }
    // },
    // businessPhone: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     isValidPhone(value) {
    //       if (!/^\+?1?\d{10,14}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
    //         throw new Error('Invalid phone number format');
    //       }
    //     }
    //   }
    // },
    businessAddress: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    province: {
      type: DataTypes.ENUM(
        'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
      ),
      allowNull: true // Allow null for initial registration
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      validate: {
        is: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
      }
    },
    
    // Banking Information
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
            if (!/^\d{5}$/.test(value.transitNumber)) {
              throw new Error('Transit number must be 5 digits');
            }
            if (!/^\d{3}$/.test(value.institutionNumber)) {
              throw new Error('Institution number must be 3 digits');
            }
            if (!/^\d{7,12}$/.test(value.accountNumber)) {
              throw new Error('Account number must be 7-12 digits');
            }
          }
        }
      }
    },
    
    // Tax Information - Dynamic based on province
    taxInfo: {
      type: DataTypes.JSONB,
      allowNull: true, // Allow null for initial registration
      validate: {
        hasRequiredFieldsForProvince(value) {
          if (value && this.province) { // Only validate if both values exist
            // Province-based tax validation
            const provinceTaxMap = {
              'AB': ['GST'], 'BC': ['GST', 'PST'], 'MB': ['GST', 'PST'],
              'NB': ['HST'], 'NL': ['HST'], 'NS': ['HST'],
              'NT': ['GST'], 'NU': ['GST'], 'ON': ['HST'],
              'PE': ['HST'], 'QC': ['GST', 'QST'], 'SK': ['GST', 'PST'],
              'YT': ['GST']
            };
            
            const restaurant = this;
            const requiredTaxes = provinceTaxMap[restaurant.province] || [];
            
            for (const tax of requiredTaxes) {
              const fieldName = `${tax.toLowerCase()}Number`;
              if (!value[fieldName]) {
                throw new Error(`${tax} number is required for province ${restaurant.province}`);
              }
            }
          }
        }
      }
    },
    
    // Document URLs
    businessDocumentUrl: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for initial registration
      comment: 'Bank statement or business card PDF'
    },
    drivingLicenseUrl: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    voidChequeUrl: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for initial registration
    },
    
    // Menu Details
    menuDetails: {
      type: DataTypes.JSONB,
      allowNull: true, // Allow null for initial registration
      defaultValue: [],
      validate: {
        isValidMenuFormat(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Menu details must be an array');
          }
          if (value) {
            for (const item of value) {
              if (!item.name || !item.price || item.price <= 0) {
                throw new Error('Each menu item must have a name and valid price');
              }
              if (item.imageUrl && typeof item.imageUrl !== 'string') {
                throw new Error('Menu item image URL must be a string');
              }
            }
          }
        }
      }
    },
    
    // Hours of Operation
    hoursOfOperation: {
      type: DataTypes.JSONB,
      allowNull: true, // Allow null for initial registration
      defaultValue: [],
      validate: {
        isValidHoursFormat(value) {
          if (!Array.isArray(value)) {
            throw new Error('Hours of operation must be an array');
          }
          const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          for (const hours of value) {
            if (!validDays.includes(hours.day)) {
              throw new Error('Invalid day in hours of operation');
            }
            if (!hours.isClosed && (!hours.openTime || !hours.closeTime)) {
              throw new Error('Open and close times required when not closed');
            }
          }
        }
      }
    },
    
    // Payment Information
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
      allowNull: false
    },
    paymentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Status fields
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
      defaultValue: 'pending',
      allowNull: false
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    registrationStage: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      comment: 'Stage 1: Basic info, Stage 2: Business details, Stage 3: Documents, Stage 4: Menu & hours, Stage 5: Banking & tax'
    },
    isRegistrationComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'True when all required fields are completed'
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Additional metadata
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Admins',
        key: 'id'
      }
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal admin notes'
    }
  }, {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'restaurants',
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['restaurantName']
      },
      {
        fields: ['status']
      },
      {
        fields: ['province']
      },
      {
        fields: ['city']
      }
    ],
    hooks: {
      beforeSave: async (restaurant) => {
        // Hash password if changed
        if (restaurant.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          restaurant.password = await bcrypt.hash(restaurant.password, salt);
        }
        
        // Ensure banking info is properly formatted
        if (restaurant.changed('bankingInfo') && restaurant.bankingInfo) {
          restaurant.bankingInfo = {
            transitNumber: restaurant.bankingInfo.transitNumber,
            institutionNumber: restaurant.bankingInfo.institutionNumber,
            accountNumber: restaurant.bankingInfo.accountNumber
          };
        }
      },
      
      beforeValidate: (restaurant) => {
        // Normalize phone numbers
        if (restaurant.phone) {
          restaurant.phone = restaurant.phone.replace(/[\s\-\(\)]/g, '');
        }
        if (restaurant.businessPhone) {
          restaurant.businessPhone = restaurant.businessPhone.replace(/[\s\-\(\)]/g, '');
        }
      }
    }
  });

  return Restaurant;
};