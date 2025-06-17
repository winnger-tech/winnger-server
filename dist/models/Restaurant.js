const {
  Model,
  DataTypes
} = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = sequelize => {
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
      allowNull: false,
      validate: {
        notEmpty: true,
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
      allowNull: false,
      validate: {
        isValidPhone(value) {
          if (!/^\+?1?\d{10,14}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
            throw new Error('Invalid phone number format');
          }
        }
      }
    },
    identificationType: {
      type: DataTypes.ENUM('licence', 'pr_card', 'passport', 'medical_card', 'provincial_id'),
      allowNull: false
    },
    // Business Information
    restaurantName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
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
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    province: {
      type: DataTypes.ENUM('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'),
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
      }
    },
    // Banking Information
    bankingInfo: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        hasRequiredFields(value) {
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
    },
    // Tax Information - Dynamic based on province
    taxInfo: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        hasRequiredFieldsForProvince(value) {
          // Province-based tax validation
          const provinceTaxMap = {
            'AB': ['GST'],
            'BC': ['GST', 'PST'],
            'MB': ['GST', 'PST'],
            'NB': ['HST'],
            'NL': ['HST'],
            'NS': ['HST'],
            'NT': ['GST'],
            'NU': ['GST'],
            'ON': ['HST'],
            'PE': ['HST'],
            'QC': ['GST', 'QST'],
            'SK': ['GST', 'PST'],
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
    },
    // Document URLs
    businessDocumentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Bank statement or business card PDF'
    },
    // fssaiCertificateUrl: {
    //   type: DataTypes.STRING,
    //   allowNull: false
    // },
    // gstCertificateUrl: {
    //   type: DataTypes.STRING,
    //   allowNull: false
    // },
    // panCardUrl: {
    //   type: DataTypes.STRING,
    //   allowNull: false
    // },
    businessLicenseUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    voidChequeUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Menu Details
    menuDetails: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidMenuFormat(value) {
          if (!Array.isArray(value)) {
            throw new Error('Menu details must be an array');
          }
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
    },
    // Hours of Operation
    hoursOfOperation: {
      type: DataTypes.JSONB,
      allowNull: false,
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
      type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
      defaultValue: 'Pending',
      allowNull: false
    },
    amount: {
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
      type: DataTypes.ENUM('Submitted', 'Paid', 'Verified'),
      defaultValue: 'Submitted',
      allowNull: false
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    paranoid: true,
    // Soft deletes
    indexes: [{
      fields: ['email']
    }, {
      fields: ['restaurantName']
    }, {
      fields: ['status']
    }, {
      fields: ['province']
    }, {
      fields: ['city']
    }],
    hooks: {
      beforeSave: async restaurant => {
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
      beforeValidate: restaurant => {
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