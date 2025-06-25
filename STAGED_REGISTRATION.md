# Staged Registration System

This document explains the staged registration system for drivers and restaurants in the Winnger platform.

## Overview

The staged registration system allows users to:
1. Register with basic information (name, email, password)
2. Login and continue filling their forms in stages
3. Resume from where they left off
4. Complete registration at their own pace

## Architecture

### Models Updated
- **Driver Model**: Modified to allow null values for most fields during initial registration
- **Restaurant Model**: Modified to allow null values for most fields during initial registration

### New Fields Added
- `registrationStage`: Integer field tracking current stage (1-5)
- `isRegistrationComplete`: Boolean indicating if all required fields are completed

## Driver Registration Stages

### Stage 1: Basic Information (Auto-completed after registration)
- firstName
- lastName  
- email
- password

### Stage 2: Personal Details
**Required Fields:**
- dateOfBirth
- cellNumber
- streetNameNumber
- city
- province
- postalCode

**Optional Fields:**
- appUniteNumber

### Stage 3: Vehicle Information
**Required Fields:**
- vehicleType
- vehicleMake
- vehicleModel
- deliveryType
- yearOfManufacture
- vehicleColor
- vehicleLicensePlate
- driversLicenseClass

### Stage 4: Documents Upload
**Required Fields:**
- driversLicenseFrontUrl
- driversLicenseBackUrl
- vehicleRegistrationUrl
- vehicleInsuranceUrl
- drivingAbstractUrl
- drivingAbstractDate
- workEligibilityUrl
- workEligibilityType
- sinNumber

**Optional Fields:**
- sinCardUrl
- criminalBackgroundCheckUrl
- criminalBackgroundCheckDate

### Stage 5: Banking & Consent (Final Stage)
**Required Fields:**
- bankingInfo
- consentAndDeclarations

## Restaurant Registration Stages

### Stage 1: Basic Information (Auto-completed after registration)
- ownerName
- email
- password

### Stage 2: Business Details
**Required Fields:**
- phone
- identificationType
- restaurantName
- businessAddress
- city
- province
- postalCode

### Stage 3: Documents Upload
**Required Fields:**
- businessDocumentUrl
- businessLicenseUrl
- voidChequeUrl

### Stage 4: Menu & Hours
**Required Fields:**
- menuDetails
- hoursOfOperation

### Stage 5: Banking & Tax Information (Final Stage)
**Required Fields:**
- bankingInfo
- taxInfo

## API Endpoints

### Driver Endpoints

#### POST `/api/drivers-staged/register`
Register a new driver with basic information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "StrongPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Driver registered successfully",
    "driver": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "registrationStage": 1,
      "isRegistrationComplete": false
    },
    "token": "jwt_token"
  }
}
```

#### POST `/api/drivers-staged/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "StrongPassword123!"
}
```

#### GET `/api/drivers-staged/profile`
Get current driver profile and next stage information.
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "driver": { /* full driver object */ },
    "nextStage": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

#### PUT `/api/drivers-staged/update-stage`
Update current stage with new information.
**Headers:** `Authorization: Bearer {token}`

**Request Body (Stage 2 example):**
```json
{
  "dateOfBirth": "1990-01-01",
  "cellNumber": "+1-555-123-4567",
  "streetNameNumber": "123 Main St",
  "city": "Toronto",
  "province": "ON",
  "postalCode": "M1M 1M1"
}
```

#### GET `/api/drivers-staged/stages`
Get information about all registration stages.
**Headers:** `Authorization: Bearer {token}`

### Restaurant Endpoints

#### POST `/api/restaurants-staged/register`
Register a new restaurant with basic information.

**Request Body:**
```json
{
  "ownerName": "Jane Smith",
  "email": "jane.smith@restaurant.com",
  "password": "StrongPassword123!"
}
```

#### POST `/api/restaurants-staged/login`
Login with email and password.

#### GET `/api/restaurants-staged/profile`
Get current restaurant profile and next stage information.

#### PUT `/api/restaurants-staged/update-stage`
Update current stage with new information.

#### GET `/api/restaurants-staged/stages`
Get information about all registration stages.

## Usage Flow

### For New Users
1. **Register**: Call register endpoint with basic info (firstName, lastName, email, password)
2. **Receive Token**: Use the returned JWT token for subsequent requests
3. **Check Profile**: Call profile endpoint to see current stage and required fields
4. **Update Stage**: Submit stage data using update-stage endpoint
5. **Repeat**: Continue until `isRegistrationComplete` is true

### For Returning Users
1. **Login**: Call login endpoint with email and password
2. **Check Profile**: Call profile endpoint to see where they left off
3. **Continue**: Use update-stage endpoint to continue from their current stage

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

The token contains:
- User ID
- Email
- User type ('driver' or 'restaurant')

## Validation

- **Stage 1**: Validates basic registration fields
- **Other Stages**: Uses flexible validation that only checks fields if they're provided
- **Stage Progression**: Automatically advances to next stage when all required fields are provided

## Database Changes

### Driver Model Changes
- Most fields changed from `allowNull: false` to `allowNull: true`
- Added conditional validation that only runs when values are present
- Added `registrationStage` and `isRegistrationComplete` fields

### Restaurant Model Changes  
- Most fields changed from `allowNull: false` to `allowNull: true`
- Added conditional validation that only runs when values are present
- Added `registrationStage` and `isRegistrationComplete` fields

## Testing

Run the test suite:
```bash
npm test staged-registration.test.js
```

The tests cover:
- Basic registration for both drivers and restaurants
- Login functionality
- Profile retrieval with stage information
- Stage progression
- Field validation

## Error Handling

The system includes comprehensive error handling for:
- Invalid credentials
- Missing required fields
- Validation errors
- Database errors
- Authentication errors

All errors return appropriate HTTP status codes and descriptive messages.
