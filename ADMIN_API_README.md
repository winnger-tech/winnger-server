# Admin API Documentation

## Overview
This API provides comprehensive admin management functionality for the restaurant registration system, including driver and restaurant management, status updates, and data export capabilities.

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
http://localhost:3000/api/admin
```

## Endpoints

### Authentication

#### Admin Login
```http
POST /login
```
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "type": "admin",
  "token": "jwt_token_here",
  "data": {
    "id": "uuid",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Admin Registration
```http
POST /register
```
**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Dashboard

#### Get Dashboard Statistics
```http
GET /dashboard
```
**Response:**
```json
{
  "success": true,
  "data": {
    "drivers": {
      "total": 150,
      "pending": 45,
      "approved": 95,
      "rejected": 10,
      "paymentCompleted": 85,
      "registrationComplete": 90,
      "registrationInProgress": 60
    },
    "restaurants": {
      "total": 75,
      "pending": 20,
      "approved": 45,
      "rejected": 5,
      "suspended": 5,
      "registrationComplete": 50,
      "registrationInProgress": 25
    }
  }
}
```

### Driver Management

#### Get All Drivers (Paginated)
```http
GET /drivers?page=1&limit=10&status=pending&paymentStatus=completed&search=john
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending, approved, rejected)
- `paymentStatus` (optional): Filter by payment status (pending, completed, failed)
- `registrationComplete` (optional): Filter by registration completion (true/false)
- `registrationStage` (optional): Filter by registration stage (1-5)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `search` (optional): Search in name, email, phone

**Response:**
```json
{
  "success": true,
  "total": 150,
  "count": 10,
  "totalPages": 15,
  "currentPage": 1,
  "data": [
    {
      "id": "uuid",
      "email": "driver@example.com",
      "profilePhotoUrl": "https://example.com/profile.jpg",
      "firstName": "John",
      "middleName": "Michael",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "cellNumber": "+1234567890",
      "streetNameNumber": "123 Main St",
      "appUniteNumber": "Apt 4B",
      "city": "Toronto",
      "province": "ON",
      "postalCode": "M5V 3A8",
      "vehicleType": "Car",
      "vehicleMake": "Toyota",
      "vehicleModel": "Camry",
      "deliveryType": "Meals",
      "yearOfManufacture": 2020,
      "vehicleColor": "Blue",
      "vehicleLicensePlate": "ABC123",
      "driversLicenseClass": "G",
      "driversLicenseFrontUrl": "https://example.com/license-front.jpg",
      "driversLicenseBackUrl": "https://example.com/license-back.jpg",
      "vehicleRegistrationUrl": "https://example.com/registration.jpg",
      "vehicleInsuranceUrl": "https://example.com/insurance.jpg",
      "drivingAbstractUrl": "https://example.com/abstract.jpg",
      "drivingAbstractDate": "2024-01-01T00:00:00.000Z",
      "criminalBackgroundCheckUrl": "https://example.com/background.jpg",
      "criminalBackgroundCheckDate": "2024-01-01T00:00:00.000Z",
      "workEligibilityUrl": "https://example.com/work-eligibility.jpg",
      "workEligibilityType": "pr_card",
      "sinNumber": "123456789",
      "sinCardUrl": "https://example.com/sin.jpg",
      "accountNumber": "1234567890",
      "backgroundCheckStatus": "completed",
      "certnApplicantId": "certn_123",
      "stripePaymentIntentId": "pi_123",
      "status": "pending",
      "paymentStatus": "completed",
      "emailVerified": true,
      "consentAndDeclarations": {},
      "registrationStage": 4,
      "isRegistrationComplete": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "fullName": "John Michael Doe",
      "documents": {
        "profilePhoto": "https://example.com/profile.jpg",
        "driversLicenseFront": "https://example.com/license-front.jpg",
        "driversLicenseBack": "https://example.com/license-back.jpg",
        "vehicleRegistration": "https://example.com/registration.jpg",
        "vehicleInsurance": "https://example.com/insurance.jpg",
        "drivingAbstract": "https://example.com/abstract.jpg",
        "criminalBackgroundCheck": "https://example.com/background.jpg",
        "workEligibility": "https://example.com/work-eligibility.jpg",
        "sinCard": "https://example.com/sin.jpg"
      },
      "documentDates": {
        "drivingAbstract": "2024-01-01T00:00:00.000Z",
        "criminalBackgroundCheck": "2024-01-01T00:00:00.000Z"
      },
      "vehicle": {
        "type": "Car",
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "color": "Blue",
        "licensePlate": "ABC123",
        "licenseClass": "G"
      },
      "address": {
        "street": "123 Main St",
        "unit": "Apt 4B",
        "city": "Toronto",
        "province": "ON",
        "postalCode": "M5V 3A8"
      },
      "registrationProgress": {
        "currentStage": 4,
        "totalStages": 5,
        "isComplete": false,
        "progressPercentage": 80
      },
      "payment": {
        "status": "completed",
        "stripePaymentIntentId": "pi_123"
      },
      "backgroundCheck": {
        "status": "completed",
        "certnApplicantId": "certn_123"
      },
      "personal": {
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "sinNumber": "123456789",
        "workEligibilityType": "pr_card",
        "accountNumber": "1234567890"
      }
    }
  ]
}
```

#### Get Driver by ID
```http
GET /drivers/:id
```
**Response:** Same structure as above for a single driver with all fields.

#### Get All Drivers Detailed (No Pagination)
```http
GET /drivers/detailed?status=pending&paymentStatus=completed
```
**Response:** Array of drivers with all fields (same structure as above).

#### Update Driver Status
```http
PUT /drivers/:id/status
```
**Request Body:**
```json
{
  "status": "approved",
  "remarks": "All documents verified successfully"
}
```

#### Update Driver Payment Status
```http
PUT /drivers/:id/payment
```
**Request Body:**
```json
{
  "action": "approve"
}
```
**Actions:** `approve`, `reject`, `retry`

#### Bulk Update Driver Status
```http
PUT /drivers/bulk/status
```
**Request Body:**
```json
{
  "driverIds": ["uuid1", "uuid2", "uuid3"],
  "status": "approved",
  "remarks": "Bulk approval"
}
```

#### Bulk Update Driver Payment
```http
PUT /drivers/bulk/payment
```
**Request Body:**
```json
{
  "driverIds": ["uuid1", "uuid2", "uuid3"],
  "action": "approve"
}
```

### Restaurant Management

#### Get All Restaurants (Paginated)
```http
GET /restaurants?page=1&limit=10&status=pending&search=pizza
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (incomplete, pending, pending_approval, approved, rejected, suspended)
- `registrationComplete` (optional): Filter by registration completion (true/false)
- `currentStep` (optional): Filter by current step (1-5)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `search` (optional): Search in restaurant name, owner name, email, phone

**Response:**
```json
{
  "success": true,
  "total": 75,
  "count": 10,
  "totalPages": 8,
  "currentPage": 1,
  "data": [
    {
      "id": "uuid",
      "ownerName": "John Smith",
      "email": "owner@restaurant.com",
      "phone": "+1234567890",
      "identificationType": "licence",
      "ownerAddress": "123 Owner St, Toronto, ON",
      "businessType": "corporate",
      "restaurantName": "Pizza Palace",
      "businessEmail": "info@pizzapalace.com",
      "businessPhone": "+1234567891",
      "restaurantAddress": "456 Restaurant Ave, Toronto, ON",
      "city": "Toronto",
      "province": "ON",
      "postalCode": "M5V 3A8",
      "bankingInfo": {
        "transitNumber": "12345",
        "institutionNumber": "123",
        "accountNumber": "1234567890"
      },
      "HSTNumber": "123456789RT0001",
      "drivingLicenseUrl": "https://example.com/license.jpg",
      "voidChequeUrl": "https://example.com/void-cheque.jpg",
      "HSTdocumentUrl": "https://example.com/hst-doc.jpg",
      "foodHandlingCertificateUrl": "https://example.com/food-cert.jpg",
      "articleofIncorporation": "https://example.com/incorporation.jpg",
      "articleofIncorporationExpiryDate": "2025-01-01T00:00:00.000Z",
      "foodSafetyCertificateExpiryDate": "2025-01-01T00:00:00.000Z",
      "agreedToTerms": true,
      "confirmationChecked": true,
      "additionalNotes": "Additional notes here",
      "reviewCompletedAt": "2024-01-01T00:00:00.000Z",
      "currentStep": 5,
      "completedSteps": [1, 2, 3, 4, 5],
      "isRegistrationComplete": true,
      "paymentStatus": "completed",
      "stripePaymentIntentId": "pi_123",
      "stripePaymentMethodId": "pm_123",
      "pendingPaymentIntentId": "pi_pending_123",
      "paymentCompletedAt": "2024-01-01T00:00:00.000Z",
      "registrationCompletedAt": "2024-01-01T00:00:00.000Z",
      "status": "approved",
      "statusUpdatedAt": "2024-01-01T00:00:00.000Z",
      "emailVerified": true,
      "emailVerificationToken": "token123",
      "emailVerificationExpires": "2024-01-01T00:00:00.000Z",
      "hoursOfOperation": {
        "monday": {"open": "09:00", "close": "22:00"},
        "tuesday": {"open": "09:00", "close": "22:00"}
      },
      "approvedAt": "2024-01-01T00:00:00.000Z",
      "approvedBy": "admin-uuid",
      "rejectionReason": null,
      "notes": "Admin notes here",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "documents": {
        "drivingLicense": "https://example.com/license.jpg",
        "voidCheque": "https://example.com/void-cheque.jpg",
        "hstDocument": "https://example.com/hst-doc.jpg",
        "foodHandlingCertificate": "https://example.com/food-cert.jpg",
        "articleOfIncorporation": "https://example.com/incorporation.jpg"
      },
      "documentExpiryDates": {
        "articleOfIncorporation": "2025-01-01T00:00:00.000Z",
        "foodSafetyCertificate": "2025-01-01T00:00:00.000Z"
      },
      "banking": {
        "transitNumber": "12345",
        "institutionNumber": "123",
        "accountNumber": "1234567890"
      },
      "business": {
        "name": "Pizza Palace",
        "type": "corporate",
        "email": "info@pizzapalace.com",
        "phone": "+1234567891",
        "address": "456 Restaurant Ave, Toronto, ON",
        "city": "Toronto",
        "province": "ON",
        "postalCode": "M5V 3A8"
      },
      "owner": {
        "name": "John Smith",
        "email": "owner@restaurant.com",
        "phone": "+1234567890",
        "address": "123 Owner St, Toronto, ON",
        "identificationType": "licence"
      },
      "tax": {
        "hstNumber": "123456789RT0001"
      },
      "registrationProgress": {
        "currentStep": 5,
        "totalSteps": 5,
        "isComplete": true,
        "completedSteps": [1, 2, 3, 4, 5],
        "progressPercentage": 100
      },
      "payment": {
        "status": "completed",
        "stripePaymentIntentId": "pi_123",
        "stripePaymentMethodId": "pm_123",
        "pendingPaymentIntentId": "pi_pending_123",
        "completedAt": "2024-01-01T00:00:00.000Z"
      },
      "review": {
        "agreedToTerms": true,
        "confirmationChecked": true,
        "additionalNotes": "Additional notes here",
        "reviewCompletedAt": "2024-01-01T00:00:00.000Z"
      },
      "operations": {
        "hoursOfOperation": {
          "monday": {"open": "09:00", "close": "22:00"},
          "tuesday": {"open": "09:00", "close": "22:00"}
        }
      },
      "admin": {
        "approvedAt": "2024-01-01T00:00:00.000Z",
        "approvedBy": "admin-uuid",
        "rejectionReason": null,
        "notes": "Admin notes here",
        "statusUpdatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

#### Get Restaurant by ID
```http
GET /restaurants/:id
```
**Response:** Same structure as above for a single restaurant with all fields.

#### Get All Restaurants Detailed (No Pagination)
```http
GET /restaurants/detailed?status=pending&registrationComplete=false
```
**Response:** Array of restaurants with all fields (same structure as above).

#### Update Restaurant Status
```http
PUT /restaurants/:id/status
```
**Request Body:**
```json
{
  "status": "approved",
  "remarks": "All documents verified successfully",
  "notes": "Internal admin notes"
}
```

#### Bulk Update Restaurant Status
```http
PUT /restaurants/bulk/status
```
**Request Body:**
```json
{
  "restaurantIds": ["uuid1", "uuid2", "uuid3"],
  "status": "approved",
  "remarks": "Bulk approval",
  "notes": "Bulk approval notes"
}
```

### Admin Management

#### Get All Admins (Paginated)
```http
GET /admins?page=1&limit=10&role=admin&search=john
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (admin, super_admin)
- `search` (optional): Search in name, email

**Response:**
```json
{
  "success": true,
  "total": 10,
  "count": 10,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "John Admin",
      "role": "admin",
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "adminInfo": {
        "name": "John Admin",
        "email": "admin@example.com",
        "role": "admin",
        "lastLogin": "2024-01-01T00:00:00.000Z"
      },
      "account": {
        "id": "uuid",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

#### Get Admin by ID
```http
GET /admins/:id
```
**Response:** Same structure as above for a single admin with all fields.

### Data Export

#### Export Data
```http
GET /export?type=drivers&format=csv&status=pending&startDate=2024-01-01&endDate=2024-12-31
```
**Query Parameters:**
- `type`: Export type (drivers, restaurants)
- `format`: Export format (csv, excel)
- `status` (optional): Filter by status
- `paymentStatus` (optional): Filter by payment status (drivers only)
- `registrationComplete` (optional): Filter by registration completion
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering

**Response:** CSV or Excel file download

### Current Admin Profile

#### Get Current Admin
```http
GET /me
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "admin",
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource not found)
- `500`: Internal Server Error

## Field Descriptions

### Driver Fields
- **Personal Information**: `firstName`, `middleName`, `lastName`, `dateOfBirth`, `email`, `cellNumber`
- **Address**: `streetNameNumber`, `appUniteNumber`, `city`, `province`, `postalCode`
- **Vehicle**: `vehicleType`, `vehicleMake`, `vehicleModel`, `yearOfManufacture`, `vehicleColor`, `vehicleLicensePlate`, `driversLicenseClass`
- **Documents**: All document URLs for licenses, registrations, background checks, etc.
- **Registration**: `registrationStage`, `isRegistrationComplete`, `completedSteps`
- **Payment**: `paymentStatus`, `stripePaymentIntentId`
- **Background Check**: `backgroundCheckStatus`, `certnApplicantId`

### Restaurant Fields
- **Owner Information**: `ownerName`, `email`, `phone`, `identificationType`, `ownerAddress`
- **Business Information**: `restaurantName`, `businessType`, `businessEmail`, `businessPhone`, `restaurantAddress`, `city`, `province`, `postalCode`
- **Banking**: `bankingInfo` (JSON with transit, institution, account numbers)
- **Tax**: `HSTNumber`
- **Documents**: All document URLs for licenses, certificates, incorporation, etc.
- **Registration**: `currentStep`, `isRegistrationComplete`, `completedSteps`
- **Payment**: `paymentStatus`, `stripePaymentIntentId`, `stripePaymentMethodId`
- **Operations**: `hoursOfOperation` (JSON)
- **Admin Management**: `approvedAt`, `approvedBy`, `rejectionReason`, `notes`

### Admin Fields
- **Basic Information**: `name`, `email`, `role`
- **Account**: `id`, `createdAt`, `updatedAt`, `lastLogin` 