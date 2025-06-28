# Restaurant API Documentation

## Base URL
```
http://localhost:3000/api/restaurants
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Register Restaurant (Basic Account)

### Endpoint
```
POST /api/restaurants/register
```

### Request Body
```json
{
  "ownerName": "string",
  "email": "string",
  "password": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Restaurant registration successful",
  "data": {
    "restaurantId": "number",
    "currentStep": 1,
    "message": "Restaurant account created successfully. Please complete the registration steps."
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## 2. Login Restaurant

### Endpoint
```
POST /api/restaurants/login
```

### Request Body
```json
{
  "email": "string",
  "password": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "message": "Login successful",
    "type": "restaurant",
    "restaurant": {
      "id": "number",
      "ownerName": "string",
      "email": "string",
      "currentStep": "number",
      "isRegistrationComplete": "boolean"
    },
    "stageMessage": "string",
    "token": "jwt_token"
  }
}
```

### Response (Error - 401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 3. Send Email Verification Code

### Endpoint
```
POST /api/restaurants/verify-email
```

### Request Body
```json
{
  "email": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "expiresIn": "number"
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## 4. Verify Email OTP

### Endpoint
```
POST /api/restaurants/verify-otp
```

### Request Body
```json
{
  "email": "string",
  "otp": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "OTP expired or invalid"
}
```

---

## 5. Create Payment Intent

### Endpoint
```
POST /api/restaurants/create-payment-intent
```

### Request Body
```json
{
  "email": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "clientSecret": "string",
  "paymentIntentId": "string"
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Please verify your email first"
}
```

---

## 6. Complete Payment

### Endpoint
```
POST /api/restaurants/complete-payment
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "paymentIntentId": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Payment marked as complete",
  "paymentStatus": "completed",
  "paymentIntentId": "string"
}
```

---

## 7. Update Step 1: Owner & Business Information

### Endpoint
```
PUT /api/restaurants/step1
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "phone": "string",
  "identificationType": "string",
  "ownerAddress": "string",
  "businessType": "string",
  "restaurantName": "string",
  "businessEmail": "string",
  "businessPhone": "string",
  "restaurantAddress": "string",
  "city": "string",
  "province": "string",
  "postalCode": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Step 1 updated successfully",
  "data": {
    "currentStep": 2,
    "completedSteps": [1],
    "message": "Step 1 completed successfully"
  }
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Restaurant not found"
}
```

---

## 8. Update Step 2: Banking & Tax Information

### Endpoint
```
PUT /api/restaurants/step2
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "bankingInfo": {
    "bankName": "string",
    "accountNumber": "string",
    "transitNumber": "string",
    "institutionNumber": "string"
  },
  "HSTNumber": "string"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Step 2 updated successfully",
  "data": {
    "currentStep": 3,
    "completedSteps": [1, 2],
    "message": "Step 2 completed successfully"
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Please complete Step 1 first"
}
```

---

## 9. Update Step 3: Document URLs

### Endpoint
```
PUT /api/restaurants/step3
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "drivingLicenseUrl": "string (optional)",
  "voidChequeUrl": "string (optional)",
  "HSTdocumentUrl": "string (optional)",
  "foodHandlingCertificateUrl": "string (optional)",
  "articleofIncorporation": "string (optional)"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Step 3 updated successfully",
  "data": {
    "currentStep": 3,
    "completedSteps": [1, 2, 3],
    "isRegistrationComplete": true,
    "message": "Registration completed successfully"
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Please complete Step 2 first"
}
```

---

## 10. Get Restaurant Profile

### Endpoint
```
GET /api/restaurants/profile
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "restaurant": {
      "id": "number",
      "ownerName": "string",
      "email": "string",
      "phone": "string",
      "identificationType": "string",
      "ownerAddress": "string",
      "businessType": "string",
      "restaurantName": "string",
      "businessEmail": "string",
      "businessPhone": "string",
      "restaurantAddress": "string",
      "city": "string",
      "province": "string",
      "postalCode": "string",
      "bankingInfo": "object",
      "HSTNumber": "string",
      "drivingLicenseUrl": "string",
      "voidChequeUrl": "string",
      "HSTdocumentUrl": "string",
      "foodHandlingCertificateUrl": "string",
      "articleofIncorporation": "string",
      "currentStep": "number",
      "completedSteps": "array",
      "isRegistrationComplete": "boolean",
      "paymentStatus": "string",
      "stripePaymentIntentId": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Restaurant not found"
}
```

---

## 11. Get Registration Progress

### Endpoint
```
GET /api/restaurants/progress
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Progress retrieved successfully",
  "data": {
    "currentStep": "number",
    "completedSteps": "array",
    "isRegistrationComplete": "boolean",
    "totalSteps": 3
  }
}
```

---

## 12. Update Menu Items

### Endpoint
```
PUT /api/restaurants/:restaurantId/menu
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "menuDetails": [
    {
      "name": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "imageUrl": "string (optional)"
    }
  ]
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Menu items updated successfully",
  "data": {
    "menuDetails": "array"
  }
}
```

---

## 13. Update Hours of Operation

### Endpoint
```
PUT /api/restaurants/:restaurantId/hours
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "hoursOfOperation": {
    "monday": {
      "open": "09:00",
      "close": "22:00",
      "isOpen": true
    },
    "tuesday": {
      "open": "09:00",
      "close": "22:00",
      "isOpen": true
    }
    // ... other days
  }
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Hours of operation updated successfully",
  "data": {
    "hoursOfOperation": "object"
  }
}
```

---

## 14. Update Tax Information

### Endpoint
```
PUT /api/restaurants/:restaurantId/tax
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Request Body
```json
{
  "taxInfo": {
    "taxRate": "number",
    "taxName": "string",
    "taxNumber": "string"
  }
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Tax information updated successfully",
  "data": {
    "taxInfo": "object"
  }
}
```

---

## Registration Flow Steps

### Step 1: Owner & Business Information
- **Title**: "Owner & Business Information"
- **Description**: "Complete your basic owner and business information"
- **Fields**: phone, identificationType, ownerAddress, businessType, restaurantName, businessEmail, businessPhone, restaurantAddress, city, province, postalCode

### Step 2: Banking & Tax Information
- **Title**: "Banking & Tax Information"
- **Description**: "Provide your banking information and HST number"
- **Fields**: bankingInfo, HSTNumber

### Step 3: Document URLs
- **Title**: "Document URLs"
- **Description**: "Provide URLs to your business documents"
- **Fields**: drivingLicenseUrl, voidChequeUrl, HSTdocumentUrl, foodHandlingCertificateUrl, articleofIncorporation

---

## Error Response Format

All error responses follow this structure:
```json
{
  "success": false,
  "message": "Error description",
  "status": "number (optional)"
}
```

## Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation errors, missing fields)
- **401**: Unauthorized (invalid credentials, missing token)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

---

## Notes for Frontend Development

1. **Document URLs**: Users provide direct URLs to their uploaded documents instead of file uploads
2. **JWT Token**: Store the token from login response and include in Authorization header
3. **Step Validation**: Each step requires previous steps to be completed
4. **Email Verification**: Required before payment processing
5. **Payment**: Uses Stripe for payment processing
6. **Progress Tracking**: Use the progress endpoint to show registration status
7. **Error Handling**: Always check the `success` field in responses
8. **Content-Type**: Use `application/json` for all endpoints (no multipart/form-data needed) 