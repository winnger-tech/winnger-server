# Admin API Documentation

This document outlines all the admin API endpoints for managing drivers and restaurants with the new staged registration system.

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### Admin Login
**POST** `/login`

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

### Admin Registration
**POST** `/register`

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "type": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "uuid",
    "name": "New Admin",
    "email": "newadmin@example.com",
    "role": "admin"
  }
}
```

### Get Current Admin
**GET** `/me`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 📊 Dashboard

### Get Dashboard Statistics
**GET** `/dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "drivers": {
      "total": 150,
      "pending": 45,
      "approved": 80,
      "rejected": 25,
      "paymentCompleted": 75,
      "registrationComplete": 60,
      "registrationInProgress": 90
    },
    "restaurants": {
      "total": 75,
      "pending": 20,
      "approved": 40,
      "rejected": 10,
      "suspended": 5,
      "registrationComplete": 35,
      "registrationInProgress": 40
    }
  }
}
```

---

## 🚗 Driver Management

### Get All Drivers (Paginated)
**GET** `/drivers`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string: "pending", "approved", "rejected")
- `paymentStatus` (string: "pending", "completed", "failed")
- `registrationComplete` (boolean: true/false)
- `registrationStage` (number: 1-5)
- `startDate` (string: ISO date)
- `endDate` (string: ISO date)
- `search` (string: search in name, email, phone)

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
      "firstName": "John",
      "lastName": "Doe",
      "cellNumber": "+1234567890",
      "status": "pending",
      "paymentStatus": "pending",
      "registrationStage": 2,
      "isRegistrationComplete": false,
      "vehicleType": "Car",
      "deliveryType": "Meals",
      "backgroundCheckStatus": "pending",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get All Drivers Detailed (No Pagination)
**GET** `/drivers/detailed`

**Query Parameters:**
- `status` (string: "pending", "approved", "rejected")
- `paymentStatus` (string: "pending", "completed", "failed")
- `registrationComplete` (boolean: true/false)
- `registrationStage` (number: 1-5)
- `startDate` (string: ISO date)
- `endDate` (string: ISO date)

**Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "id": "uuid",
      "email": "driver@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "cellNumber": "+1234567890",
      "status": "pending",
      "paymentStatus": "pending",
      "registrationStage": 2,
      "isRegistrationComplete": false,
      "vehicleType": "Car",
      "deliveryType": "Meals",
      "backgroundCheckStatus": "pending",
      "emailVerified": false,
      "registrationProgress": {
        "currentStage": 2,
        "totalStages": 5,
        "isComplete": false,
        "progressPercentage": 40
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Driver by ID
**GET** `/drivers/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "driver@example.com",
    "profilePhotoUrl": "https://example.com/photo.jpg",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
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
    "workEligibilityUrl": "https://example.com/eligibility.jpg",
    "workEligibilityType": "passport",
    "sinNumber": "123-456-789",
    "sinCardUrl": "https://example.com/sin.jpg",
    "accountNumber": "1234567890",
    "backgroundCheckStatus": "pending",
    "certnApplicantId": "certn_123",
    "stripePaymentIntentId": "pi_123",
    "status": "pending",
    "paymentStatus": "pending",
    "emailVerified": false,
    "consentAndDeclarations": {
      "termsAccepted": true,
      "privacyAccepted": true
    },
    "registrationStage": 2,
    "isRegistrationComplete": false,
    "noofstages": 5,
    "sinCardNumber": "123456789",
    "transitNumber": "12345",
    "institutionNumber": "123",
    "fullName": "John Doe",
    "registrationProgress": {
      "currentStage": 2,
      "totalStages": 5,
      "isComplete": false,
      "progressPercentage": 40
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Driver Status
**PUT** `/drivers/:id/status`

**Request Body:**
```json
{
  "status": "approved",
  "remarks": "All documents verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver status updated from pending to approved",
  "data": {
    "id": "uuid",
    "email": "driver@example.com",
    "name": "John Doe",
    "previousStatus": "pending",
    "currentStatus": "approved",
    "remarks": "All documents verified successfully",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Driver Payment Status
**PUT** `/drivers/:id/payment`

**Request Body:**
```json
{
  "action": "approve"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "paymentStatus": "completed"
  }
}
```

### Bulk Update Driver Status
**PUT** `/drivers/bulk/status`

**Request Body:**
```json
{
  "driverIds": ["uuid1", "uuid2", "uuid3"],
  "status": "approved",
  "remarks": "Bulk approval completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully updated 3 drivers",
  "data": [
    {
      "id": "uuid1",
      "status": "approved",
      "remarks": "Bulk approval completed"
    }
  ]
}
```

### Bulk Update Driver Payment
**PUT** `/drivers/bulk/payment`

**Request Body:**
```json
{
  "driverIds": ["uuid1", "uuid2", "uuid3"],
  "action": "approve"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully updated payment status for 3 drivers",
  "data": [
    {
      "id": "uuid1",
      "paymentStatus": "completed"
    }
  ]
}
```

---

## 🍽️ Restaurant Management

### Get All Restaurants (Paginated)
**GET** `/restaurants`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string: "pending", "approved", "rejected", "suspended")
- `registrationComplete` (boolean: true/false)
- `currentStep` (number: 1-3)
- `startDate` (string: ISO date)
- `endDate` (string: ISO date)
- `search` (string: search in restaurant name, owner name, email, phone, business email)

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
      "ownerName": "Jane Smith",
      "email": "restaurant@example.com",
      "phone": "+1234567890",
      "identificationType": "licence",
      "ownerAddress": "456 Business Ave",
      "businessType": "solo",
      "restaurantName": "Tasty Bites",
      "businessEmail": "info@tastybites.com",
      "businessPhone": "+1234567891",
      "restaurantAddress": "789 Food Street",
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
      "voidChequeUrl": "https://example.com/cheque.jpg",
      "HSTdocumentUrl": "https://example.com/hst.jpg",
      "foodHandlingCertificateUrl": "https://example.com/food.jpg",
      "articleofIncorporation": "https://example.com/incorporation.jpg",
      "articleofIncorporationExpiryDate": "2025-01-15T00:00:00.000Z",
      "foodSafetyCertificateExpiryDate": "2025-01-15T00:00:00.000Z",
      "currentStep": 2,
      "completedSteps": [1, 2],
      "isRegistrationComplete": false,
      "status": "pending",
      "emailVerified": false,
      "emailVerificationToken": "token123",
      "emailVerificationExpires": "2024-01-16T10:30:00.000Z",
      "approvedAt": null,
      "approvedBy": null,
      "rejectionReason": null,
      "notes": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get All Restaurants Detailed (No Pagination)
**GET** `/restaurants/detailed`

**Query Parameters:**
- `status` (string: "pending", "approved", "rejected", "suspended")
- `registrationComplete` (boolean: true/false)
- `currentStep` (number: 1-3)
- `startDate` (string: ISO date)
- `endDate` (string: ISO date)

**Response:**
```json
{
  "success": true,
  "count": 75,
  "data": [
    {
      "id": "uuid",
      "ownerName": "Jane Smith",
      "email": "restaurant@example.com",
      "restaurantName": "Tasty Bites",
      "status": "pending",
      "currentStep": 2,
      "isRegistrationComplete": false,
      "registrationProgress": {
        "currentStep": 2,
        "totalSteps": 3,
        "isComplete": false,
        "completedSteps": [1, 2],
        "progressPercentage": 67
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Restaurant by ID
**GET** `/restaurants/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ownerName": "Jane Smith",
    "email": "restaurant@example.com",
    "phone": "+1234567890",
    "identificationType": "licence",
    "ownerAddress": "456 Business Ave",
    "businessType": "solo",
    "restaurantName": "Tasty Bites",
    "businessEmail": "info@tastybites.com",
    "businessPhone": "+1234567891",
    "restaurantAddress": "789 Food Street",
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
    "voidChequeUrl": "https://example.com/cheque.jpg",
    "HSTdocumentUrl": "https://example.com/hst.jpg",
    "foodHandlingCertificateUrl": "https://example.com/food.jpg",
    "articleofIncorporation": "https://example.com/incorporation.jpg",
    "articleofIncorporationExpiryDate": "2025-01-15T00:00:00.000Z",
    "foodSafetyCertificateExpiryDate": "2025-01-15T00:00:00.000Z",
    "currentStep": 2,
    "completedSteps": [1, 2],
    "isRegistrationComplete": false,
    "status": "pending",
    "emailVerified": false,
    "emailVerificationToken": "token123",
    "emailVerificationExpires": "2024-01-16T10:30:00.000Z",
    "approvedAt": null,
    "approvedBy": null,
    "rejectionReason": null,
    "notes": null,
    "registrationProgress": {
      "currentStep": 2,
      "totalSteps": 3,
      "isComplete": false,
      "completedSteps": [1, 2],
      "progressPercentage": 67
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Restaurant Status
**PUT** `/restaurants/:id/status`

**Request Body:**
```json
{
  "status": "approved",
  "remarks": "All documents verified successfully",
  "notes": "Internal note: High-quality restaurant with good reviews"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant status updated from pending to approved",
  "data": {
    "id": "uuid",
    "email": "restaurant@example.com",
    "name": "Tasty Bites",
    "previousStatus": "pending",
    "currentStatus": "approved",
    "rejectionReason": "All documents verified successfully",
    "notes": "Internal note: High-quality restaurant with good reviews",
    "approvedAt": "2024-01-15T10:30:00.000Z",
    "approvedBy": "admin-uuid",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Bulk Update Restaurant Status
**PUT** `/restaurants/bulk/status`

**Request Body:**
```json
{
  "restaurantIds": ["uuid1", "uuid2", "uuid3"],
  "status": "approved",
  "remarks": "Bulk approval completed",
  "notes": "Internal note: All restaurants passed verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully updated 3 restaurants",
  "data": [
    {
      "id": "uuid1",
      "status": "approved",
      "rejectionReason": "Bulk approval completed",
      "notes": "Internal note: All restaurants passed verification",
      "approvedAt": "2024-01-15T10:30:00.000Z",
      "approvedBy": "admin-uuid"
    }
  ]
}
```

---

## 📤 Export Data

### Export Data
**GET** `/export`

**Query Parameters:**
- `type` (string: "drivers" or "restaurants")
- `format` (string: "csv" or "excel", default: "csv")
- `status` (string: filter by status)
- `paymentStatus` (string: filter by payment status - drivers only)
- `registrationComplete` (boolean: true/false)
- `startDate` (string: ISO date)
- `endDate` (string: ISO date)

**Response:**
- Returns a downloadable file (CSV or Excel) with the requested data
- File includes all relevant fields including registration progress

**Example CSV Headers for Drivers:**
```
ID,Name,Email,Phone,Status,Registration Complete,Registration Stage,Total Stages,Payment Status,Vehicle Type,Delivery Type,Background Check Status,Email Verified,Created At,Updated At
```

**Example CSV Headers for Restaurants:**
```
ID,Restaurant Name,Owner Name,Email,Phone,Business Email,Business Phone,Status,Registration Complete,Current Step,Completed Steps,City,Province,Business Type,HST Number,Email Verified,Approved At,Rejection Reason,Created At,Updated At
```

---

## 🔧 Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Driver not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Notes for Frontend Implementation

### Registration Progress Display
- Use the `registrationProgress` object to display progress bars
- `progressPercentage` gives you the percentage (0-100)
- `isComplete` boolean indicates if registration is finished
- For drivers: `currentStage` (1-5) vs `totalStages` (5)
- For restaurants: `currentStep` (1-3) vs `totalSteps` (3)

### Status Management
- Drivers: `pending`, `approved`, `rejected`
- Restaurants: `pending`, `approved`, `rejected`, `suspended`
- Payment status (drivers only): `pending`, `completed`, `failed`

### Filtering Options
- Use query parameters for filtering lists
- Combine multiple filters for advanced search
- Date ranges use ISO date format

### Bulk Operations
- Send arrays of IDs for bulk operations
- All bulk operations send email notifications automatically
- Restaurant approvals automatically set `approvedAt` and `approvedBy`

### File Downloads
- Export endpoint returns actual files, not JSON
- Set appropriate headers for file download in frontend
- Handle both CSV and Excel formats

---

## 🚀 Getting Started

1. **Login** using `/login` endpoint
2. **Store the JWT token** from the response
3. **Include token** in Authorization header for all subsequent requests
4. **Use dashboard** endpoint to get overview statistics
5. **Implement filtering** using query parameters for better UX
6. **Handle registration progress** to show user-friendly progress indicators

This API now fully supports the staged registration system with comprehensive tracking and management capabilities! 