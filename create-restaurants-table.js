const { sequelize } = require('./src/config/database');

async function createRestaurantsTable() {
  try {
    console.log('Creating restaurants table...');
    
    // Create the restaurants table with all fields from the Restaurant model
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "restaurants" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        -- Basic Account Information
        "ownerName" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        
        -- Step 1: Owner & Business Information
        "phone" VARCHAR(255),
        "identificationType" VARCHAR(50),
        "ownerAddress" VARCHAR(255),
        "businessType" VARCHAR(50),
        "restaurantName" VARCHAR(255),
        "businessEmail" VARCHAR(255),
        "businessPhone" VARCHAR(255),
        "restaurantAddress" VARCHAR(255),
        "city" VARCHAR(255),
        "province" VARCHAR(10),
        "postalCode" VARCHAR(10),
        
        -- Step 2: Banking & Tax Information
        "bankingInfo" JSONB,
        "HSTNumber" VARCHAR(255),
        
        -- Step 3: Documents
        "drivingLicenseUrl" VARCHAR(255),
        "voidChequeUrl" VARCHAR(255),
        "HSTdocumentUrl" VARCHAR(255),
        "foodHandlingCertificateUrl" VARCHAR(255),
        "articleofIncorporation" VARCHAR(255),
        "articleofIncorporationExpiryDate" TIMESTAMP,
        "foodSafetyCertificateExpiryDate" TIMESTAMP,
        
        -- Step 4: Review & Confirmation fields
        "agreedToTerms" BOOLEAN DEFAULT false,
        "confirmationChecked" BOOLEAN DEFAULT false,
        "additionalNotes" TEXT,
        "reviewCompletedAt" TIMESTAMP,
        
        -- Registration Progress Tracking
        "currentStep" INTEGER DEFAULT 1 NOT NULL,
        "completedSteps" JSONB DEFAULT '[]' NOT NULL,
        "isRegistrationComplete" BOOLEAN DEFAULT false,
        
        -- Payment Information (Step 5)
        "paymentStatus" VARCHAR(50) DEFAULT 'pending' NOT NULL,
        "stripePaymentIntentId" VARCHAR(255),
        "stripePaymentMethodId" VARCHAR(255),
        "pendingPaymentIntentId" VARCHAR(255),
        "paymentCompletedAt" TIMESTAMP,
        "registrationCompletedAt" TIMESTAMP,
        
        -- Status fields
        "status" VARCHAR(50) DEFAULT 'incomplete' NOT NULL,
        "statusUpdatedAt" TIMESTAMP,
        "emailVerified" BOOLEAN DEFAULT false,
        
        -- Email verification
        "emailVerificationToken" VARCHAR(255),
        "emailVerificationExpires" TIMESTAMP,
        
        -- Restaurant Management (Post-registration)
        "hoursOfOperation" JSONB,
        
        -- Admin fields
        "approvedAt" TIMESTAMP,
        "approvedBy" UUID,
        "rejectionReason" TEXT,
        "notes" TEXT,
        
        -- Timestamps
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        "deletedAt" TIMESTAMP
      );
    `);
    
    // Add indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "restaurants_email" ON "restaurants" ("email");
      CREATE INDEX IF NOT EXISTS "restaurants_restaurantName" ON "restaurants" ("restaurantName");
      CREATE INDEX IF NOT EXISTS "restaurants_status" ON "restaurants" ("status");
      CREATE INDEX IF NOT EXISTS "restaurants_currentStep" ON "restaurants" ("currentStep");
      CREATE INDEX IF NOT EXISTS "restaurants_paymentStatus" ON "restaurants" ("paymentStatus");
      CREATE INDEX IF NOT EXISTS "restaurants_isRegistrationComplete" ON "restaurants" ("isRegistrationComplete");
    `);
    
    console.log('✅ Restaurants table created successfully!');
    
    // Verify the table was created
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\nRestaurants table structure:');
    console.table(results);
    
  } catch (error) {
    console.error('❌ Error creating restaurants table:', error.message);
  } finally {
    await sequelize.close();
  }
}

createRestaurantsTable(); 