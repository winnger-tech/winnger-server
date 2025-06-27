# Driver Staged Registration API Documentation

## Overview

The Driver Staged Registration API allows drivers to complete their registration process in 5 distinct stages. Each stage collects specific information and validates it before allowing progression to the next stage. **File uploads are handled by the frontend, and URLs are sent directly to the backend.**

## Registration Stages

### Stage 1: Basic Information (Registration)
- **Fields**: firstName, lastName, email, password
- **Status**: Always completed during initial registration

### Stage 2: Personal Details
- **Fields**: firstName, lastName, middleName, email, dateOfBirth, cellNumber, streetNameNumber, appUniteNumber, city, province, postalCode, profilePhotoUrl
- **Required**: dateOfBirth, profilePhotoUrl, cellNumber, streetNameNumber, city, province, postalCode, firstName, lastName, middleName, email
- **Optional**: appUniteNumber

### Stage 3: Vehicle Information
- **Fields**: vehicleType, vehicleMake, vehicleModel, deliveryType, yearOfManufacture, vehicleColor, vehicleLicensePlate, driversLicenseClass, vehicleInsuranceUrl, vehicleRegistrationUrl
- **Required**: All fields
- **Enums**: 
  - vehicleType: ['Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other']
  - deliveryType: ['Meals', 'Parcel', 'Grocery', 'Other']

### Stage 4: Documents Upload (URLs)
- **Fields**: driversLicenseFrontUrl, driversLicenseBackUrl, vehicleRegistrationUrl, vehicleInsuranceUrl, drivingAbstractUrl, drivingAbstractDate, workEligibilityUrl, workEligibilityType, sinCardUrl, sinCardNumber
- **Required**: All fields
- **Enums**: workEligibilityType: ['passport', 'pr_card', 'work_permit', 'study_permit']
- **Note**: All document URLs are provided by the frontend after file upload

### Stage 5: Banking & Consent
- **Fields**: bankingInfo, consentAndDeclarations
- **Required**: Both fields
- **Format**: JSON objects

## API Endpoints

### Public Endpoints

#### 1. Register Driver (Stage 1)
```http
POST /api/drivers/staged/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver registered successfully. Please complete your profile.",
  "data": {
    "driver": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "registrationStage": 1,
      "isRegistrationComplete": false
    },
    "token": "jwt_token",
    "nextStage": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "profilePhotoUrl", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "firstName", "lastName", "middleName", "email"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

#### 2. Login Driver
```http
POST /api/drivers/staged/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "driver": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "registrationStage": 2,
      "isRegistrationComplete": false
    },
    "stageMessage": "You are currently on Stage 2: Personal Details. Please provide your personal and address information",
    "token": "jwt_token",
    "nextStage": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "profilePhotoUrl", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "firstName", "lastName", "middleName", "email"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

### Protected Endpoints (Require Authentication)

#### 3. Get Driver Profile
```http
GET /api/drivers/staged/profile
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "driver": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "registrationStage": 2,
      "isRegistrationComplete": false,
      "dateOfBirth": "1990-01-01",
      "cellNumber": "+1234567890",
      // ... other fields
    },
    "nextStage": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "profilePhotoUrl", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "firstName", "lastName", "middleName", "email"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

#### 4. Get Dashboard
```http
GET /api/drivers/staged/dashboard
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "driver": {
      // driver object
    },
    "currentStage": 2,
    "isRegistrationComplete": false,
    "stages": {
      "1": {
        "title": "Basic Information",
        "description": "Complete your basic profile information",
        "fields": ["firstName", "lastName", "email", "password"],
        "completed": true,
        "isCurrentStage": false
      },
      "2": {
        "title": "Personal Details",
        "description": "Provide your personal and address information",
        "fields": ["dateOfBirth", "cellNumber", "streetNameNumber", "appUniteNumber", "city", "province", "postalCode", "profilePhotoUrl"],
        "completed": false,
        "isCurrentStage": true
      }
      // ... other stages
    },
    "currentStageInfo": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "profilePhotoUrl", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "firstName", "lastName", "middleName", "email"],
      "optionalFields": ["appUniteNumber"]
    },
    "progress": {
      "totalStages": 5,
      "completedStages": 1,
      "currentStage": 2,
      "percentage": 20
    }
  }
}
```

#### 5. Update Stage 1 (Personal Details)
```http
PUT /api/drivers/staged/stage/1
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "email": "john.doe@example.com",
  "dateOfBirth": "1990-01-01",
  "cellNumber": "+1234567890",
  "streetNameNumber": "123 Main St",
  "appUniteNumber": "Apt 4B",
  "city": "Toronto",
  "province": "ON",
  "postalCode": "M5V 2H1",
  "profilePhotoUrl": "https://example.com/photos/profile.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stage 1 completed successfully. Please proceed to Stage 2.",
  "data": {
    "driver": {
      // updated driver object
    },
    "nextStage": {
      "title": "Vehicle Information",
      "description": "Tell us about your vehicle and delivery preferences",
      "requiredFields": ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"]
    }
  }
}
```

#### 6. Update Stage 2 (Vehicle Information)
```http
PUT /api/drivers/staged/stage/2
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "vehicleType": "Car",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "deliveryType": "Meals",
  "yearOfManufacture": 2020,
  "vehicleColor": "Silver",
  "vehicleLicensePlate": "ABC123",
  "driversLicenseClass": "G",
  "vehicleInsuranceUrl": "https://example.com/documents/insurance.pdf",
  "vehicleRegistrationUrl": "https://example.com/documents/registration.pdf"
}
```

#### 7. Update Stage 3 (Documents - URLs from Frontend)
```http
PUT /api/drivers/staged/stage/3
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "driversLicenseFrontUrl": "https://example.com/documents/license-front.jpg",
  "driversLicenseBackUrl": "https://example.com/documents/license-back.jpg",
  "vehicleRegistrationUrl": "https://example.com/documents/registration.pdf",
  "vehicleInsuranceUrl": "https://example.com/documents/insurance.pdf",
  "drivingAbstractUrl": "https://example.com/documents/abstract.pdf",
  "drivingAbstractDate": "2023-01-01",
  "workEligibilityUrl": "https://example.com/documents/work-permit.pdf",
  "workEligibilityType": "work_permit",
  "sinCardUrl": "https://example.com/documents/sin-card.jpg",
  "sinCardNumber": "123-456-789"
}
```

**Note**: All document URLs are provided by the frontend after file upload to your preferred storage service (S3, Cloudinary, etc.)

#### 8. Update Stage 4 (Banking Information)
```http
PUT /api/drivers/staged/stage/4
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "bankingInfo": {
    "accountNumber": "1234567890",
    "accountHolderName": "John Doe",
    "bankName": "Royal Bank of Canada"
  },
  "transitNumber": "12345",
  "institutionNumber": "003"
}
```

#### 9. Update Stage 5 (Consent & Declarations)
```http
PUT /api/drivers/staged/stage/5
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "consentAndDeclarations": {
    "backgroundCheck": true,
    "termsOfService": true,
    "privacyPolicy": true,
    "dataCollection": true,
    "additionalConsents": {
      "marketing": false,
      "thirdPartySharing": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration completed successfully! Your account is now active.",
  "data": {
    "driver": {
      // driver object with isRegistrationComplete: true
    },
    "isRegistrationComplete": true
  }
}
```

#### 10. Get Stage Data
```http
GET /api/drivers/staged/stage/:stage
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stage": 2,
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "Michael",
      "email": "john.doe@example.com",
      "dateOfBirth": "1990-01-01",
      "cellNumber": "+1234567890",
      "streetNameNumber": "123 Main St",
      "city": "Toronto",
      "province": "ON",
      "postalCode": "M5V 2H1",
      "profilePhotoUrl": "https://example.com/photos/profile.jpg"
    },
    "stageInfo": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "profilePhotoUrl", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "firstName", "lastName", "middleName", "email"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

#### 11. Get All Stages Information
```http
GET /api/drivers/staged/stages
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stages": {
      "1": {
        "title": "Basic Information",
        "description": "Complete your basic profile information",
        "fields": ["firstName", "lastName", "email", "password"],
        "completed": true
      },
      "2": {
        "title": "Personal Details",
        "description": "Provide your personal and address information",
        "fields": ["dateOfBirth", "cellNumber", "streetNameNumber", "appUniteNumber", "city", "province", "postalCode", "profilePhotoUrl"]
      }
      // ... other stages
    }
  }
}
```

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "message": "Missing required fields: dateOfBirth, cellNumber",
  "status": 400
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Invalid credentials",
  "status": 401
}
```

### Authorization Errors
```json
{
  "success": false,
  "message": "Please complete Stage 1 first",
  "status": 400
}
```

### URL Validation Errors
```json
{
  "success": false,
  "message": "Missing required documents: vehicleRegistrationUrl, vehicleInsuranceUrl",
  "status": 400
}
```

## Stage Progression Rules

1. **Stage 1**: Automatically completed during registration
2. **Stage 2**: Requires all required fields from Stage 1
3. **Stage 3**: Requires all required fields from Stage 2
4. **Stage 4**: Requires all required fields and document URLs from Stage 3
5. **Stage 5**: Requires all required fields from Stage 4

## File Upload Strategy

### Frontend Responsibility
- Handle file uploads to your preferred storage service (S3, Cloudinary, etc.)
- Provide URLs to the backend API
- Validate file types and sizes before upload
- Handle upload progress and error states

### Backend Responsibility
- Validate that all required document URLs are provided
- Store URLs in the database
- No file processing or storage on the backend

## Environment Variables

Make sure the following environment variables are set:

```env
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Usage Examples

### Frontend Integration:

```javascript
// Register a new driver
const registerDriver = async (driverData) => {
  const response = await fetch('/api/drivers/staged/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(driverData)
  });
  return response.json();
};

// Update stage 1 with profile photo URL
const updateStage1 = async (stageData, token) => {
  const response = await fetch('/api/drivers/staged/stage/1', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(stageData)
  });
  return response.json();
};

// Update stage 3 with document URLs (after frontend uploads)
const updateStage3 = async (documentUrls, token) => {
  const response = await fetch('/api/drivers/staged/stage/3', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(documentUrls)
  });
  return response.json();
};
```

This API provides a complete staged registration system for drivers with proper validation and URL-based document handling. 