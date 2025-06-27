# Restaurant Staged Registration API Documentation

## Overview
The restaurant staged registration system allows restaurants to register in three distinct stages, collecting information progressively to ensure a smooth onboarding experience.

## Base URL
```
POST /api/restaurant-staged
```

## Authentication
- JWT tokens are used for authentication
- Tokens are returned upon successful registration/login
- Include token in Authorization header: `Bearer <token>`

---

## Stage 1: Initial Registration

### Endpoint
```
POST /api/restaurant-staged/register
```

### Description
Creates a new restaurant account with basic owner information.

### Request Body
```json
{
  "ownerName": "John Doe",
  "email": "john@restaurant.com",
  "password": "SecurePassword123!"
}
```

### Response
```json
{
  "success": true,
  "message": "Restaurant registered successfully",
  "type": "restaurant",
  "restaurant": {
    "id": "uuid",
    "ownerName": "John Doe",
    "email": "john@restaurant.com",
    "registrationStage": 1,
    "isRegistrationComplete": false
  },
  "token": "jwt_token_here"
}
```

---

## Stage 1: Complete Basic Information

### Endpoint
```
PUT /api/restaurant-staged/update-stage
```

### Description
Completes Stage 1 by providing all required owner and business information.

### Request Body
```json
{
  "phone": "+1234567890",
  "identificationType": "licence",
  "ownerAddress": "123 Main St, Toronto, ON",
  "businessType": "solo",
  "restaurantName": "John's Delicious Food",
  "businessEmail": "info@johnsdelicious.com",
  "businessPhone": "+1234567891",
  "restaurantAddress": "456 Restaurant Ave, Toronto, ON",
  "city": "Toronto",
  "province": "ON",
  "postalCode": "M5V 3A8"
}
```

### Required Fields for Stage 1
- `phone`: Owner's phone number (10-14 digits)
- `identificationType`: One of ['licence', 'pr_card', 'passport', 'medical_card', 'provincial_id']
- `ownerAddress`: Owner's address
- `businessType`: One of ['solo', 'corporate']
- `restaurantName`: Name of the restaurant
- `businessEmail`: Business email address
- `businessPhone`: Business phone number (10-14 digits)
- `restaurantAddress`: Restaurant address
- `city`: City name
- `province`: One of Canadian provinces ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
- `postalCode`: Canadian postal code format

### Response
```json
{
  "success": true,
  "message": "Stage 1 completed successfully",
  "restaurant": {
    "id": "uuid",
    "ownerName": "John Doe",
    "email": "john@restaurant.com",
    "registrationStage": 2,
    "isRegistrationComplete": false
  },
  "nextStage": {
    "title": "Banking Information & HST Number",
    "description": "Please provide your banking information and HST number",
    "requiredFields": ["bankingInfo", "HSTNumber"]
  }
}
```

---

## Stage 2: Banking Information & HST Number

### Endpoint
```
PUT /api/restaurant-staged/update-stage
```

### Description
Completes Stage 2 by providing banking information and HST number.

### Request Body
```json
{
  "bankingInfo": {
    "transitNumber": "12345",
    "institutionNumber": "123",
    "accountNumber": "1234567890"
  },
  "HSTNumber": "123456789RT0001"
}
```

### Required Fields for Stage 2
- `bankingInfo.transitNumber`: 5-digit transit number
- `bankingInfo.institutionNumber`: 3-digit institution number
- `bankingInfo.accountNumber`: 7-12 digit account number
- `HSTNumber`: HST registration number

### Response
```json
{
  "success": true,
  "message": "Stage 2 completed successfully",
  "restaurant": {
    "id": "uuid",
    "ownerName": "John Doe",
    "email": "john@restaurant.com",
    "registrationStage": 3,
    "isRegistrationComplete": false
  },
  "nextStage": {
    "title": "Document Uploads",
    "description": "Upload required business documents",
    "requiredFields": ["drivingLicenseUrl", "voidChequeUrl", "HSTdocumentUrl", "foodHandlingCertificateUrl", "articleofIncorporation"]
  }
}
```

---

## Stage 3: Document Uploads

### Endpoint
```
PUT /api/restaurant-staged/update-stage
```

### Description
Completes Stage 3 by uploading all required documents.

### Request Body
```json
{
  "drivingLicenseUrl": "https://example.com/documents/driving-license.pdf",
  "voidChequeUrl": "https://example.com/documents/void-cheque.pdf",
  "HSTdocumentUrl": "https://example.com/documents/hst-document.pdf",
  "foodHandlingCertificateUrl": "https://example.com/documents/food-handling.pdf",
  "articleofIncorporation": "https://example.com/documents/incorporation.pdf",
  "articleofIncorporationExpiryDate": "2025-12-31",
  "foodSafetyCertificateExpiryDate": "2025-06-30"
}
```

### Required Fields for Stage 3
- `drivingLicenseUrl`: URL to driving license document
- `voidChequeUrl`: URL to void cheque document
- `HSTdocumentUrl`: URL to HST registration document
- `foodHandlingCertificateUrl`: URL to food handling certificate
- `articleofIncorporation`: URL to article of incorporation (for corporate businesses)

### Optional Fields for Stage 3
- `articleofIncorporationExpiryDate`: Expiry date for article of incorporation
- `foodSafetyCertificateExpiryDate`: Expiry date for food safety certificate

### Response
```json
{
  "success": true,
  "message": "Stage 3 completed successfully",
  "restaurant": {
    "id": "uuid",
    "ownerName": "John Doe",
    "email": "john@restaurant.com",
    "registrationStage": 3,
    "isRegistrationComplete": true
  },
  "nextStage": null
}
```

---

## Additional Endpoints

### Login
```
POST /api/restaurant-staged/login
```

### Get Profile
```
GET /api/restaurant-staged/profile
```

### Get Dashboard
```
GET /api/restaurant-staged/dashboard
```

### Get Registration Stages Info
```
GET /api/restaurant-staged/stages
```

### Get Specific Stage Data
```
GET /api/restaurant-staged/stage/:stage
```

### Update Specific Stage
```
PUT /api/restaurant-staged/update-specific-stage
```

---

## Error Responses

### Missing Required Fields
```json
{
  "success": false,
  "message": "Missing required fields: phone, identificationType, businessEmail"
}
```

### Invalid Data Format
```json
{
  "success": false,
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Valid email is required",
      "path": "businessEmail",
      "location": "body"
    }
  ]
}
```

### Stage Validation Error
```json
{
  "success": false,
  "message": "Cannot proceed to next stage. Please complete current stage requirements."
}
```

---

## Field Validation Rules

### Phone Numbers
- Format: `+?1?\d{10,14}`
- Examples: `+1234567890`, `1234567890`, `+1-234-567-8900`

### Postal Code
- Format: `[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d`
- Examples: `M5V 3A8`, `M5V3A8`

### Banking Information
- Transit Number: Exactly 5 digits
- Institution Number: Exactly 3 digits
- Account Number: 7-12 digits

### URLs
- Must be valid URL format
- Should point to uploaded documents

### Dates
- Must be in ISO 8601 format: `YYYY-MM-DD`

---

## Registration Flow

1. **Initial Registration**: Create account with basic info
2. **Stage 1**: Complete owner and business information
3. **Stage 2**: Provide banking information and HST number
4. **Stage 3**: Upload required documents
5. **Complete**: Registration is complete and ready for admin review

## Status Tracking

- `registrationStage`: Current stage (1-3)
- `isRegistrationComplete`: Boolean indicating if all stages are complete
- Progress percentage available in dashboard endpoint

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire based on configuration
- All sensitive data is validated and sanitized
- File uploads should be validated for security 