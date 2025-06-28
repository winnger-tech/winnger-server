-- Create ENUM types first
CREATE TYPE "enum_drivers_status" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "enum_drivers_paymentStatus" AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE "enum_drivers_backgroundCheckStatus" AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE "enum_drivers_vehicleType" AS ENUM ('Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other');
CREATE TYPE "enum_drivers_deliveryType" AS ENUM ('Meals', 'Parcel', 'Grocery', 'Other');
CREATE TYPE "enum_drivers_workEligibilityType" AS ENUM ('passport', 'pr_card', 'work_permit', 'study_permit');

-- Drop existing table if it exists
DROP TABLE IF EXISTS "drivers" CASCADE;

-- Create the drivers table with all columns matching the Sequelize model
CREATE TABLE "drivers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "profilePhotoUrl" VARCHAR(255),
  "password" VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(255) NOT NULL,
  "middleName" VARCHAR(255),
  "lastName" VARCHAR(255) NOT NULL,
  "dateOfBirth" DATE,
  "cellNumber" VARCHAR(255),
  "streetNameNumber" VARCHAR(255),
  "appUniteNumber" VARCHAR(255),
  "city" VARCHAR(255),
  "province" VARCHAR(255),
  "postalCode" VARCHAR(255),
  "vehicleType" "enum_drivers_vehicleType",
  "vehicleMake" VARCHAR(255),
  "vehicleModel" VARCHAR(255),
  "deliveryType" "enum_drivers_deliveryType",
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
  "criminalBackgroundCheckUrl" VARCHAR(255),
  "criminalBackgroundCheckDate" DATE,
  "workEligibilityUrl" VARCHAR(255),
  "workEligibilityType" "enum_drivers_workEligibilityType",
  "sinNumber" VARCHAR(255),
  "sinCardUrl" VARCHAR(255),
  "accountNumber" VARCHAR(255),
  "backgroundCheckStatus" "enum_drivers_backgroundCheckStatus" DEFAULT 'pending',
  "certnApplicantId" VARCHAR(255),
  "stripePaymentIntentId" VARCHAR(255),
  "status" "enum_drivers_status" DEFAULT 'pending' NOT NULL,
  "paymentStatus" "enum_drivers_paymentStatus" DEFAULT 'pending' NOT NULL,
  "emailVerified" BOOLEAN DEFAULT false,
  "consentAndDeclarations" JSONB DEFAULT '{}' NOT NULL,
  "registrationStage" INTEGER DEFAULT 1 NOT NULL,
  "isRegistrationComplete" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX "drivers_email" ON "drivers" ("email");
CREATE INDEX "drivers_status" ON "drivers" ("status");
CREATE INDEX "drivers_paymentStatus" ON "drivers" ("paymentStatus");
CREATE INDEX "drivers_registrationStage" ON "drivers" ("registrationStage");
CREATE INDEX "drivers_isRegistrationComplete" ON "drivers" ("isRegistrationComplete");
CREATE INDEX "drivers_backgroundCheckStatus" ON "drivers" ("backgroundCheckStatus");

-- Add comments for documentation
COMMENT ON TABLE "drivers" IS 'Driver registration and profile information';
COMMENT ON COLUMN "drivers"."id" IS 'Unique identifier for the driver';
COMMENT ON COLUMN "drivers"."email" IS 'Driver email address (unique)';
COMMENT ON COLUMN "drivers"."profilePhotoUrl" IS 'URL to driver profile photo';
COMMENT ON COLUMN "drivers"."registrationStage" IS 'Current registration stage (1-5)';
COMMENT ON COLUMN "drivers"."isRegistrationComplete" IS 'Whether registration is fully complete';
COMMENT ON COLUMN "drivers"."status" IS 'Driver approval status';
COMMENT ON COLUMN "drivers"."paymentStatus" IS 'Payment processing status';
COMMENT ON COLUMN "drivers"."backgroundCheckStatus" IS 'Background check processing status'; 