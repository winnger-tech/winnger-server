# Admin API Documentation

## Overview
This document describes all the available API endpoints for the admin panel to manage drivers and restaurants.

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
http://localhost:3000/api/admin
```

## Public Endpoints

### Admin Login
**POST** `/login`
- **Description**: Authenticate admin user
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "type": "admin",
    "token": "jwt-token-here",
    "data": {
      "id": "uuid",
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "admin",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Admin Registration
**POST** `/register`
- **Description**: Register a new admin user
- **Body**:
  ```json
  {
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "type": "admin",
    "token": "jwt-token-here",
    "data": {
      "id": "uuid",
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
  ```

## Protected Endpoints (Require Authentication)

### Dashboard Statistics
**GET** `/dashboard`
- **Description**: Get dashboard statistics
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "drivers": {
        "total": 150,
        "pending": 25,
        "approved": 100,
        "rejected": 15,
        "paymentCompleted": 80
      },
      "restaurants": {
        "total": 75,
        "pending": 10,
        "approved": 50,
        "rejected": 5,
        "paymentCompleted": 40
      }
    }
  }
  ```

### Driver Management

#### Get All Drivers (Paginated)
**GET** `/drivers`
- **Description**: Get paginated list of all drivers
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by status (pending, approved, rejected)
  - `paymentStatus` (optional): Filter by payment status (pending, completed, failed)
  - `search` (optional): Search in name, email, or phone
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date
- **Response**:
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
        "cellNumber": "+1-555-123-4567",
        "status": "approved",
        "paymentStatus": "completed",
        "vehicleType": "Car",
        "deliveryType": "Meals",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### Get All Drivers (Detailed - No Pagination)
**GET** `/drivers/detailed`
- **Description**: Get all drivers with detailed information for admin dashboard
- **Query Parameters**:
  - `status` (optional): Filter by status
  - `paymentStatus` (optional): Filter by payment status
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date
- **Response**:
  ```json
  {
    "success": true,
    "count": 150,
    "data": [
      {
        "id": "uuid",
        "email": "driver@example.com",
        "profilePhotoUrl": "https://example.com/photo.jpg",
        "firstName": "John",
        "middleName": "Michael",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "cellNumber": "+1-555-123-4567",
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
        "status": "approved",
        "paymentStatus": "completed",
        "remarks": "All documents verified",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### Get Driver by ID
**GET** `/drivers/:id`
- **Description**: Get detailed information for a specific driver
- **Response**:
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
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "cellNumber": "+1-555-123-4567",
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
      "status": "approved",
      "paymentStatus": "completed",
      "remarks": "All documents verified",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### Update Driver Status
**PUT** `/drivers/:id/status`
- **Description**: Update driver approval status
- **Body**:
  ```json
  {
    "status": "approved",
    "remarks": "All documents verified successfully"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "approved",
      "remarks": "All documents verified successfully"
    }
  }
  ```

#### Update Driver Payment Status
**PUT** `/drivers/:id/payment`
- **Description**: Update driver payment status
- **Body**:
  ```json
  {
    "action": "approve"
  }
  ```
- **Actions**: `approve`, `reject`, `retry`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "paymentStatus": "completed"
    }
  }
  ```

### Restaurant Management

#### Get All Restaurants (Paginated)
**GET** `/restaurants`
- **Description**: Get paginated list of all restaurants
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by status (pending, approved, rejected)
  - `paymentStatus` (optional): Filter by payment status (pending, completed, failed)
  - `search` (optional): Search in restaurant name, owner name, email, or phone
- **Response**:
  ```json
  {
    "success": true,
    "total": 75,
    "count": 10,
    "totalPages": 7,
    "currentPage": 1,
    "data": [
      {
        "id": "uuid",
        "ownerName": "Jane Smith",
        "email": "restaurant@example.com",
        "phone": "+1-555-987-6543",
        "restaurantName": "Delicious Diner",
        "businessAddress": "456 Food St",
        "city": "Toronto",
        "province": "ON",
        "status": "approved",
        "paymentStatus": "completed",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### Get All Restaurants (Detailed - No Pagination)
**GET** `/restaurants/detailed`
- **Description**: Get all restaurants with detailed information for admin dashboard
- **Query Parameters**:
  - `status` (optional): Filter by status
  - `paymentStatus` (optional): Filter by payment status
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date
- **Response**:
  ```json
  {
    "success": true,
    "count": 75,
    "data": [
      {
        "id": "uuid",
        "ownerName": "Jane Smith",
        "email": "restaurant@example.com",
        "phone": "+1-555-987-6543",
        "identificationType": "licence",
        "restaurantName": "Delicious Diner",
        "businessAddress": "456 Food St",
        "city": "Toronto",
        "province": "ON",
        "postalCode": "M5V 3A8",
        "bankingInfo": {
          "transitNumber": "12345",
          "institutionNumber": "123",
          "accountNumber": "1234567890"
        },
        "taxInfo": {
          "hstNumber": "123456789RT0001"
        },
        "businessDocumentUrl": "https://example.com/business-doc.pdf",
        "drivingLicenseUrl": "https://example.com/license.jpg",
        "voidChequeUrl": "https://example.com/void-cheque.jpg",
        "menuDetails": [
          {
            "name": "Burger",
            "price": 12.99,
            "imageUrl": "https://example.com/burger.jpg"
          }
        ],
        "hoursOfOperation": {
          "monday": {"open": "09:00", "close": "22:00"},
          "tuesday": {"open": "09:00", "close": "22:00"}
        },
        "status": "approved",
        "paymentStatus": "completed",
        "rejectionReason": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### Get Restaurant by ID
**GET** `/restaurants/:id`
- **Description**: Get detailed information for a specific restaurant
- **Response**: Same as detailed restaurant data above

#### Update Restaurant Status
**PUT** `/restaurants/:id/status`
- **Description**: Update restaurant approval status
- **Body**:
  ```json
  {
    "status": "approved",
    "remarks": "All documents verified successfully"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "approved",
      "rejectionReason": null
    }
  }
  ```

#### Update Restaurant Payment Status
**PUT** `/restaurants/:id/payment`
- **Description**: Update restaurant payment status
- **Body**:
  ```json
  {
    "action": "approve"
  }
  ```
- **Actions**: `approve`, `reject`, `retry`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "paymentStatus": "completed"
    }
  }
  ```

### Data Export

#### Export Data
**GET** `/export`
- **Description**: Export driver or restaurant data
- **Query Parameters**:
  - `type`: `drivers` or `restaurants`
  - `format` (optional): `csv` or `excel` (default: `csv`)
  - `status` (optional): Filter by status
  - `paymentStatus` (optional): Filter by payment status
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date
- **Response**: File download (CSV or Excel)

### Admin Profile

#### Get Current Admin
**GET** `/me`
- **Description**: Get current admin user information
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "admin",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

## Error Responses

All endpoints return error responses in the following format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource not found)
- `500`: Internal Server Error

## Usage Examples

### Frontend Integration

```javascript
// Login
const loginResponse = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
});

const { token } = await loginResponse.json();

// Get all drivers
const driversResponse = await fetch('/api/admin/drivers?page=1&limit=10&status=approved', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get specific driver details
const driverResponse = await fetch('/api/admin/drivers/driver-uuid-here', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Update driver status
const updateResponse = await fetch('/api/admin/drivers/driver-uuid-here/status', {
  method: 'PUT',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ status: 'approved', remarks: 'All good!' })
});
```

## Notes

1. All timestamps are in ISO 8601 format
2. File URLs are S3 presigned URLs or direct links
3. Sensitive information like passwords is always excluded from responses
4. Search functionality uses case-insensitive partial matching
5. Date filtering supports both start and end dates for range queries
6. Payment status actions trigger email notifications to users
