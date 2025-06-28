-- Create the drivers table
CREATE TABLE "drivers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(255),
  "dateOfBirth" DATE,
  "address" VARCHAR(255),
  "city" VARCHAR(255),
  "province" VARCHAR(255),
  "postalCode" VARCHAR(255),
  "sinCardNumber" VARCHAR(255),
  "driversLicenseNumber" VARCHAR(255),
  "driversLicenseExpiry" DATE,
  "vehicleMake" VARCHAR(255),
  "vehicleModel" VARCHAR(255),
  "vehicleYear" INTEGER,
  "vehicleColor" VARCHAR(255),
  "licensePlate" VARCHAR(255),
  "insuranceProvider" VARCHAR(255),
  "insurancePolicyNumber" VARCHAR(255),
  "insuranceExpiry" DATE,
  "transitNumber" VARCHAR(255),
  "institutionNumber" VARCHAR(255),
  "accountNumber" VARCHAR(255),
  "currentStep" INTEGER DEFAULT 1 NOT NULL,
  "completedSteps" JSONB DEFAULT '[]' NOT NULL,
  "isRegistrationComplete" BOOLEAN DEFAULT false NOT NULL,
  "status" VARCHAR(255) DEFAULT 'pending' NOT NULL,
  "paymentStatus" VARCHAR(255) DEFAULT 'pending',
  "registrationStage" INTEGER DEFAULT 1,
  "noofstages" INTEGER DEFAULT 5,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

-- Add indexes
CREATE INDEX "drivers_email" ON "drivers" ("email");
CREATE INDEX "drivers_status" ON "drivers" ("status");
CREATE INDEX "drivers_paymentStatus" ON "drivers" ("paymentStatus");
CREATE INDEX "drivers_registrationStage" ON "drivers" ("registrationStage");
CREATE INDEX "drivers_isRegistrationComplete" ON "drivers" ("isRegistrationComplete"); 