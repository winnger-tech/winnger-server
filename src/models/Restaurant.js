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
    
    // Basic Account Information (always required)
    ownerName: {
      type: DataTypes.STRING,
      allowNull: false,
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
    
    // Step 1: Owner & Business Information
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
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
      allowNull: true
    },
    ownerAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    businessType: {
      type: DataTypes.ENUM('solo', 'corporate'),
      allowNull: true
    },
    restaurantName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    businessEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    businessPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidPhone(value) {
          if (value && !/^\+?1?\d{10,14}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
            throw new Error('Invalid phone number format');
          }
        }
      }
    },
    restaurantAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    province: {
      type: DataTypes.ENUM('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'),
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
      }
    },
    
    // Step 2: Banking & Tax Information
    bankingInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        hasRequiredFields(value) {
          if (value) {
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
    HSTNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    // Step 3: Documents
    drivingLicenseUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    voidChequeUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    HSTdocumentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    foodHandlingCertificateUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    articleofIncorporation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    articleofIncorporationExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    foodSafetyCertificateExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Step 4: Review & Confirmation fields
    agreedToTerms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    confirmationChecked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    additionalNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reviewCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Registration Progress Tracking (Updated for 5 steps)
    currentStep: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Current registration step (1-5)'
    },
    completedSteps: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
      comment: 'Array of completed step numbers [1,2,3,4,5]'
    },
    isRegistrationComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'True when all 5 steps are completed'
    },
    
    // Payment Information (Step 5)
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
      allowNull: false
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripePaymentMethodId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pendingPaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    registrationCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Status fields - UPDATED ENUM
    status: {
      type: DataTypes.ENUM('incomplete', 'pending', 'pending_approval', 'approved', 'rejected', 'suspended'),
      defaultValue: 'incomplete',
      allowNull: false,
      comment: 'Restaurant application status'
    },
    statusUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    
    // Email verification
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Restaurant Management (Post-registration)
    // menuDetails: {
    //   type: DataTypes.JSONB,
    //   allowNull: true,
    //   comment: 'Menu items and details'
    // },
    hoursOfOperation: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Operating hours for each day'
    },
    // taxInfo: {
    //   type: DataTypes.JSONB,
    //   allowNull: true,
    //   comment: 'Tax information and rates'
    // },
    
    // Admin fields
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
        fields: ['currentStep']
      },
      {
        fields: ['paymentStatus']
      },
      {
        fields: ['isRegistrationComplete']
      }
    ],
    hooks: {
      beforeSave: async (restaurant) => {
        // Hash password if changed
        if (restaurant.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          restaurant.password = await bcrypt.hash(restaurant.password, salt);
        }
        
        // Normalize phone numbers
        if (restaurant.phone) {
          restaurant.phone = restaurant.phone.replace(/[\s\-\(\)]/g, '');
        }
        if (restaurant.businessPhone) {
          restaurant.businessPhone = restaurant.businessPhone.replace(/[\s\-\(\)]/g, '');
        }
        
        // Ensure completedSteps is always an array
        if (!Array.isArray(restaurant.completedSteps)) {
          restaurant.completedSteps = [];
        }
        
        // Check if registration is complete (all 5 steps)
        const completedSteps = restaurant.completedSteps || [];
        const isComplete = completedSteps.includes(1) && 
                          completedSteps.includes(2) && 
                          completedSteps.includes(3) &&
                          completedSteps.includes(4) &&
                          completedSteps.includes(5);
        
        if (isComplete && !restaurant.isRegistrationComplete) {
          restaurant.isRegistrationComplete = true;
          restaurant.registrationCompletedAt = new Date();
        }
        
        // Update status based on progress
        if (restaurant.isRegistrationComplete && restaurant.status === 'incomplete') {
          restaurant.status = 'pending_approval';
          restaurant.statusUpdatedAt = new Date();
        }
      }
    }
  });

  return Restaurant;
};