# Driver Registration API Documentation

**Base URL:** `http://localhost:5001/api/drivers-staged`

## Table of Contents
- [Authentication](#authentication)
- [Registration Flow](#registration-flow)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Frontend Implementation Guide](#frontend-implementation-guide)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Registration Flow

The driver registration process consists of 5 stages:

1. **Stage 1:** Basic Information (Registration)
2. **Stage 2:** Personal Details
3. **Stage 3:** Vehicle Information
4. **Stage 4:** Documents Upload
5. **Stage 5:** Banking & Consent

## API Endpoints

### 1. Driver Registration (Stage 1)

**Endpoint:** `POST /register`

**Request:**
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
      "id": "e6aca656-30a4-4b22-9ade-a0c3b1fcb549",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "registrationStage": 1,
      "isRegistrationComplete": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "nextStage": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "profilePhotoUrl"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

### 2. Driver Login

**Endpoint:** `POST /login`

**Request:**
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
      "id": "e6aca656-30a4-4b22-9ade-a0c3b1fcb549",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "registrationStage": 1,
      "isRegistrationComplete": false
    },
    "stageMessage": "You are currently on Stage 1: Basic Information. Complete your basic profile information",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "nextStage": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "profilePhotoUrl"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

### 3. Get Driver Profile

**Endpoint:** `GET /profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "driver": {
      "id": "e6aca656-30a4-4b22-9ade-a0c3b1fcb549",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "middleName": null,
      "dateOfBirth": null,
      "cellNumber": null,
      "streetNameNumber": null,
      "appUniteNumber": null,
      "city": null,
      "province": null,
      "postalCode": null,
      "profilePhotoUrl": null,
      "vehicleType": null,
      "vehicleMake": null,
      "vehicleModel": null,
      "deliveryType": null,
      "yearOfManufacture": null,
      "vehicleColor": null,
      "vehicleLicensePlate": null,
      "driversLicenseClass": null,
      "driversLicenseFrontUrl": null,
      "driversLicenseBackUrl": null,
      "vehicleRegistrationUrl": null,
      "vehicleInsuranceUrl": null,
      "drivingAbstractUrl": null,
      "drivingAbstractDate": null,
      "criminalBackgroundCheckUrl": null,
      "criminalBackgroundCheckDate": null,
      "workEligibilityUrl": null,
      "workEligibilityType": null,
      "sinNumber": null,
      "sinCardUrl": null,
      "bankingInfo": null,
      "backgroundCheckStatus": "pending",
      "certnApplicantId": null,
      "stripePaymentIntentId": null,
      "status": "pending",
      "paymentStatus": "pending",
      "emailVerified": false,
      "consentAndDeclarations": {},
      "registrationStage": 1,
      "isRegistrationComplete": false,
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z"
    },
    "nextStage": {
      "title": "Personal Details",
      "description": "Please provide your personal and address information",
      "requiredFields": ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "profilePhotoUrl"],
      "optionalFields": ["appUniteNumber"]
    }
  }
}
```

### 4. Get Dashboard Information

**Endpoint:** `GET /dashboard`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "driver": {
      // Same as profile response
    },
    "currentStage": 1,
    "isRegistrationComplete": false,
    "stages": {
      "1": {
        "title": "Basic Information",
        "description": "Complete your basic profile information",
        "fields": ["firstName", "lastName", "email", "password"],
        "completed": true,
        "isCurrentStage": true
      },
      "2": {
        "title": "Personal Details",
        "description": "Provide your personal and address information",
        "fields": ["dateOfBirth", "cellNumber", "streetNameNumber", "appUniteNumber", "city", "province", "postalCode", "profilePhotoUrl"],
        "completed": false,
        "isCurrentStage": false
      },
      "3": {
        "title": "Vehicle Information",
        "description": "Tell us about your vehicle and delivery preferences",
        "fields": ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"],
        "completed": false,
        "isCurrentStage": false
      },
      "4": {
        "title": "Documents Upload",
        "description": "Upload required documents for verification",
        "fields": ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinCardUrl", "sinCardNumber"],
        "completed": false,
        "isCurrentStage": false
      },
      "5": {
        "title": "Banking & Consent",
        "description": "Complete banking information and consent forms",
        "fields": ["bankingInfo", "consentAndDeclarations"],
        "completed": false,
        "isCurrentStage": false
      }
    },
    "currentStageInfo": {
      "title": "Basic Information",
      "description": "Complete your basic profile information"
    },
    "progress": {
      "totalStages": 5,
      "completedStages": 0,
      "currentStage": 1,
      "percentage": 0
    }
  }
}
```

### 5. Update Stage 1 (Personal Details)

**Endpoint:** `PUT /stage/1`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
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
  "profilePhotoUrl": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stage 1 completed successfully. Please proceed to Stage 2.",
  "data": {
    "driver": {
      // Updated driver object
      "registrationStage": 2
    },
    "nextStage": {
      "title": "Vehicle Information",
      "description": "Tell us about your vehicle and delivery preferences",
      "requiredFields": ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"]
    }
  }
}
```

### 6. Update Stage 2 (Vehicle Information)

**Endpoint:** `PUT /stage/2`

**Request:**
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
  "vehicleInsuranceUrl": "https://example.com/insurance.pdf",
  "vehicleRegistrationUrl": "https://example.com/registration.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stage 2 completed successfully. Please proceed to Stage 3.",
  "data": {
    "driver": {
      "registrationStage": 3
    },
    "nextStage": {
      "title": "Documents Upload",
      "description": "Upload required documents for verification",
      "requiredFields": ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinCardUrl", "sinCardNumber"]
    }
  }
}
```

### 7. Update Stage 3 (Documents Upload)

**Endpoint:** `PUT /stage/3`

**Request:**
```json
{
  "driversLicenseFrontUrl": "https://example.com/license-front.jpg",
  "driversLicenseBackUrl": "https://example.com/license-back.jpg",
  "vehicleRegistrationUrl": "https://example.com/registration.pdf",
  "vehicleInsuranceUrl": "https://example.com/insurance.pdf",
  "drivingAbstractUrl": "https://example.com/abstract.pdf",
  "drivingAbstractDate": "2023-01-01",
  "workEligibilityUrl": "https://example.com/work-permit.pdf",
  "workEligibilityType": "work_permit",
  "sinCardUrl": "https://example.com/sin-card.jpg",
  "sinCardNumber": "123-456-789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stage 3 completed successfully. Please proceed to Stage 4.",
  "data": {
    "driver": {
      "registrationStage": 4
    },
    "nextStage": {
      "title": "Banking & Consent",
      "description": "Complete banking information and consent forms",
      "requiredFields": ["bankingInfo", "consentAndDeclarations"]
    }
  }
}
```

### 8. Update Stage 4 (Banking Information)

**Endpoint:** `PUT /stage/4`

**Request:**
```json
{
  "bankingInfo": {
    "accountNumber": "1234567890",
    "accountHolderName": "John Doe",
    "bankName": "Royal Bank of Canada",
    "transitNumber": "12345",
    "institutionNumber": "003"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stage 4 completed successfully. Please proceed to final stage.",
  "data": {
    "driver": {
      "registrationStage": 5
    },
    "nextStage": {
      "title": "Banking & Consent",
      "description": "Complete banking information and consent forms",
      "requiredFields": ["consentAndDeclarations"]
    }
  }
}
```

### 9. Update Stage 5 (Consent & Declarations)

**Endpoint:** `PUT /stage/5`

**Request:**
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
  "message": "Stage 5 completed successfully. Registration complete!",
  "data": {
    "driver": {
      "registrationStage": 5,
      "isRegistrationComplete": true
    },
    "isRegistrationComplete": true
  }
}
```

### 10. Get Registration Stages Info

**Endpoint:** `GET /stages`

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
      },
      "3": {
        "title": "Vehicle Information",
        "description": "Tell us about your vehicle and delivery preferences",
        "fields": ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"]
      },
      "4": {
        "title": "Documents Upload",
        "description": "Upload required documents for verification",
        "fields": ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinCardUrl", "sinCardNumber"]
      },
      "5": {
        "title": "Banking & Consent",
        "description": "Complete banking information and consent forms",
        "fields": ["bankingInfo", "consentAndDeclarations"]
      }
    }
  }
}
```

### 11. Get Specific Stage Data

**Endpoint:** `GET /stage/:stage`

**Example:** `GET /stage/2`

**Response:**
```json
{
  "success": true,
  "data": {
    "stage": 2,
    "data": {
      "vehicleType": "Car",
      "vehicleMake": "Toyota",
      "vehicleModel": "Camry",
      "deliveryType": "Meals",
      "yearOfManufacture": 2020,
      "vehicleColor": "Silver",
      "vehicleLicensePlate": "ABC123",
      "driversLicenseClass": "G",
      "vehicleInsuranceUrl": "https://example.com/insurance.pdf",
      "vehicleRegistrationUrl": "https://example.com/registration.pdf"
    },
    "stageInfo": {
      "title": "Vehicle Information",
      "description": "Tell us about your vehicle and delivery preferences",
      "requiredFields": ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"]
    }
  }
}
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created (registration) |
| `400` | Bad Request (validation errors) |
| `401` | Unauthorized (invalid token) |
| `404` | Not Found |
| `500` | Internal Server Error |

### Common Error Messages

- `"Email and password are required"` - Missing login credentials
- `"Invalid credentials"` - Wrong email/password
- `"Driver with this email already exists"` - Email already registered
- `"Driver not found"` - Invalid driver ID
- `"Missing required fields: field1, field2"` - Validation errors
- `"Please complete Stage X first"` - Trying to skip stages

## Frontend Implementation Guide

### 1. Authentication Flow

```javascript
// Store token after login/registration
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5001/api/drivers-staged/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token
      localStorage.setItem('driverToken', data.data.token);
      // Store driver info
      localStorage.setItem('driverInfo', JSON.stringify(data.data.driver));
      // Navigate based on registration stage
      navigateToStage(data.data.driver.registrationStage);
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 2. Protected API Calls

```javascript
// Helper function for authenticated requests
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('driverToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    ...options
  };
  
  const response = await fetch(`http://localhost:5001/api/drivers-staged${endpoint}`, config);
  return response.json();
};

// Example usage
const getProfile = async () => {
  const data = await makeAuthenticatedRequest('/profile');
  return data;
};
```

### 3. Stage Navigation

```javascript
// Navigate to appropriate stage based on registration progress
const navigateToStage = (registrationStage) => {
  switch (registrationStage) {
    case 1:
      // Show personal details form
      break;
    case 2:
      // Show vehicle information form
      break;
    case 3:
      // Show documents upload form
      break;
    case 4:
      // Show banking information form
      break;
    case 5:
      // Show consent form
      break;
    default:
      // Registration complete
      break;
  }
};
```

### 4. Progress Tracking

```javascript
// Get dashboard for progress tracking
const getDashboard = async () => {
  const data = await makeAuthenticatedRequest('/dashboard');
  
  if (data.success) {
    const { stages, progress, currentStage } = data.data;
    
    // Update progress bar
    updateProgressBar(progress.percentage);
    
    // Update stage indicators
    updateStageIndicators(stages);
    
    // Show current stage form
    showStageForm(currentStage);
  }
};
```

### 5. Form Validation

```javascript
// Validate required fields based on nextStage info
const validateStageForm = (formData, nextStage) => {
  const { requiredFields } = nextStage;
  const missingFields = requiredFields.filter(field => !formData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  return true;
};
```

### 6. File Upload Handling

```javascript
// For document uploads, you'll need to handle file uploads separately
// and then use the returned URLs in the stage update requests

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/upload-endpoint', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.fileUrl; // Use this URL in stage updates
};
```

### 7. Error Handling

```javascript
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverInfo');
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 400) {
    // Validation error
    const errorData = error.response.data;
    showValidationErrors(errorData.message);
  } else {
    // Generic error
    showErrorMessage('Something went wrong. Please try again.');
  }
};
```

## Data Models

### Driver Object Structure

```typescript
interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  middleName?: string;
  dateOfBirth?: string;
  cellNumber?: string;
  streetNameNumber?: string;
  appUniteNumber?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  profilePhotoUrl?: string;
  vehicleType?: 'Walk' | 'Scooter' | 'Bike' | 'Car' | 'Van' | 'Other';
  vehicleMake?: string;
  vehicleModel?: string;
  deliveryType?: 'Meals' | 'Parcel' | 'Grocery' | 'Other';
  yearOfManufacture?: number;
  vehicleColor?: string;
  vehicleLicensePlate?: string;
  driversLicenseClass?: string;
  driversLicenseFrontUrl?: string;
  driversLicenseBackUrl?: string;
  vehicleRegistrationUrl?: string;
  vehicleInsuranceUrl?: string;
  drivingAbstractUrl?: string;
  drivingAbstractDate?: string;
  criminalBackgroundCheckUrl?: string;
  criminalBackgroundCheckDate?: string;
  workEligibilityUrl?: string;
  workEligibilityType?: 'passport' | 'pr_card' | 'work_permit' | 'study_permit';
  sinNumber?: string;
  sinCardUrl?: string;
  bankingInfo?: {
    accountNumber: string;
    accountHolderName: string;
    bankName: string;
    transitNumber?: string;
    institutionNumber?: string;
  };
  backgroundCheckStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  certnApplicantId?: string;
  stripePaymentIntentId?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'pending' | 'completed' | 'failed';
  emailVerified: boolean;
  consentAndDeclarations: Record<string, any>;
  registrationStage: number;
  isRegistrationComplete: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Next Stage Object Structure

```typescript
interface NextStage {
  title: string;
  description: string;
  requiredFields: string[];
  optionalFields?: string[];
}
```

This documentation provides everything needed to implement the driver registration flow in your frontend application. 