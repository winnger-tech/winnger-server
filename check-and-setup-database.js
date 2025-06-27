const { sequelize } = require('./src/config/database');

async function checkAndSetupDatabase() {
  try {
    console.log('🔍 Checking database setup...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Check if drivers table exists
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'drivers';
    `);

    if (results.length === 0) {
      console.log('⚠️  Drivers table does not exist. Creating initial setup...\n');
      
      // Create the drivers table with basic structure
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS drivers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          "profilePhotoUrl" VARCHAR(255),
          password VARCHAR(255) NOT NULL,
          "firstName" VARCHAR(255),
          "middleName" VARCHAR(255),
          "lastName" VARCHAR(255),
          "dateOfBirth" DATE,
          "cellNumber" VARCHAR(255),
          "streetNameNumber" VARCHAR(255),
          "appUniteNumber" VARCHAR(255),
          city VARCHAR(255),
          province VARCHAR(255),
          "postalCode" VARCHAR(255),
          "vehicleType" VARCHAR(50),
          "vehicleMake" VARCHAR(255),
          "vehicleModel" VARCHAR(255),
          "deliveryType" VARCHAR(50),
          "yearOfManufacture" INTEGER,
          "vehicleColor" VARCHAR(255),
          "vehicleLicensePlate" VARCHAR(255),
          "driversLicenseClass" VARCHAR(255),
          "driversLicenseFrontUrl" VARCHAR(255),
          "driversLicenseBackUrl" VARCHAR(255),
          "vehicleRegistrationUrl" VARCHAR(255),
          "vehicleInsuranceUrl" VARCHAR(255),
          "drivingAbstractUrl" VARCHAR(255),
          "drivingAbstractDate" DATE,
          "workEligibilityUrl" VARCHAR(255),
          "workEligibilityType" VARCHAR(50),
          "sinNumber" VARCHAR(255),
          "sinCardUrl" VARCHAR(255),
          "sinCardNumber" VARCHAR(255),
          "bankingInfo" JSONB,
          "transitNumber" VARCHAR(255),
          "institutionNumber" VARCHAR(255),
          "consentAndDeclarations" JSONB,
          "registrationStage" INTEGER NOT NULL DEFAULT 1,
          "isRegistrationComplete" BOOLEAN NOT NULL DEFAULT false,
          "noofstages" INTEGER NOT NULL DEFAULT 5,
          "backgroundCheckStatus" VARCHAR(50) DEFAULT 'pending',
          "certnApplicantId" VARCHAR(255),
          "stripePaymentIntentId" VARCHAR(255),
          status VARCHAR(50) DEFAULT 'pending',
          "paymentStatus" VARCHAR(50) DEFAULT 'pending',
          "emailVerified" BOOLEAN DEFAULT false,
          "criminalBackgroundCheckUrl" VARCHAR(255),
          "criminalBackgroundCheckDate" DATE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
      `);

      console.log('✅ Drivers table created successfully!\n');
    } else {
      console.log('✅ Drivers table already exists.\n');
    }

    // Check current table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'drivers' 
      ORDER BY ordinal_position;
    `);

    console.log('📋 Current drivers table structure:');
    console.table(columns.map(row => ({
      column: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable,
      default: row.column_default
    })));

    // Check for staged registration fields
    const stagedFields = [
      'registrationStage',
      'isRegistrationComplete', 
      'noofstages',
      'sinCardNumber',
      'transitNumber',
      'institutionNumber'
    ];

    const existingFields = columns.map(row => row.column_name);
    const missingFields = stagedFields.filter(field => !existingFields.includes(field));

    if (missingFields.length > 0) {
      console.log('\n⚠️  Missing staged registration fields:', missingFields);
      console.log('💡 Run the migration script to add these fields: node run-migration.js');
    } else {
      console.log('\n✅ All staged registration fields are present!');
    }

    console.log('\n🎉 Database setup check completed!');
    console.log('📝 The staged registration system is ready to use.');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkAndSetupDatabase();
}

module.exports = { checkAndSetupDatabase }; 