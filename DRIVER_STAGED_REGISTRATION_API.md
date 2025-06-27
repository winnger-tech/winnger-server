# Driver Staged Registration API Documentation

## Overview
The driver staged registration system allows drivers to register in five distinct stages, collecting information progressively to ensure a smooth onboarding experience.

## Base URL
```
POST /api/driver-staged
```

## Authentication
- JWT tokens are used for authentication
- Tokens are returned upon successful registration/login
- Include token in Authorization header: `Bearer <token>`

---

## Stage 1: Initial Registration

### Endpoint
```
POST /api/driver-staged/register
```

### Description
Creates a new driver account with basic information.

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@driver.com",
  "password": "SecurePassword123!"
}
```

### Response
```json
{
  "success": true,
  "message": "Driver registered successfully. Please complete your profile.",
  "type": "driver",
  "driver": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@driver.com",
    "registrationStage": 1,
    "isRegistrationComplete": false
  },
  "token": "jwt_token_here",
  "nextStage": {
    "title": "Personal Details",
    "description": "Please provide your personal and address information",
    "requiredFields": ["dateOfBirth", "cellNumber", "streetNameNumber", "city", "province", "postalCode", "profilePhotoUrl"]
  }
}
```

---

## Stage 1: Complete Personal Details

### Endpoint
```
PUT /api/driver-staged/stage/1
```

### Description
Completes Stage 1 by providing all required personal and address information.

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "email": "john.doe@driver.com",
  "dateOfBirth": "1990-05-15",
  "cellNumber": "+1-234-567-8900",
  "streetNameNumber": "123 Main Street",
  "appUniteNumber": "Apt 4B",
  "city": "Toronto",
  "province": "ON",
  "postalCode": "M5V 3A8",
  "profilePhotoUrl": "https://example.com/photos/profile.jpg"
}
```

### Required Fields for Stage 1
- `firstName`: Driver's first name
- `lastName`: Driver's last name
- `middleName`: Driver's middle name
- `email`: Driver's email address
- `dateOfBirth`: Date of birth (YYYY-MM-DD format)
- `cellNumber`: Phone number (format: +1-XXX-XXX-XXXX)
- `streetNameNumber`: Street address
- `city`: City name
- `province`: One of Canadian provinces ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
- `postalCode`: Canadian postal code format
- `profilePhotoUrl`: URL to profile photo

### Optional Fields for Stage 1
- `appUniteNumber`: Apartment/unit number

### Response
```json
{
  "success": true,
  "message": "Stage 1 completed successfully. Please proceed to Stage 2.",
  "driver": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@driver.com",
    "registrationStage": 2,
    "isRegistrationComplete": false
  },
  "nextStage": {
    "title": "Vehicle Information",
    "description": "Tell us about your vehicle and delivery preferences",
    "requiredFields": ["vehicleType", "vehicleMake", "vehicleModel", "deliveryType", "yearOfManufacture", "vehicleColor", "vehicleLicensePlate", "driversLicenseClass", "vehicleInsuranceUrl", "vehicleRegistrationUrl"]
  }
}
```

---

## Stage 2: Vehicle Information

### Endpoint
```
PUT /api/driver-staged/stage/2
```

### Description
Completes Stage 2 by providing vehicle and delivery information.

### Request Body
```json
{
  "vehicleType": "Car",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "deliveryType": "Meals",
  "yearOfManufacture": "2020",
  "vehicleColor": "Silver",
  "vehicleLicensePlate": "ABC123",
  "driversLicenseClass": "G",
  "vehicleInsuranceUrl": "https://example.com/documents/insurance.pdf",
  "vehicleRegistrationUrl": "https://example.com/documents/registration.pdf"
}
```

### Required Fields for Stage 2
- `vehicleType`: One of ['Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other']
- `vehicleMake`: Vehicle manufacturer
- `vehicleModel`: Vehicle model
- `deliveryType`: One of ['Meals', 'Parcel', 'Grocery', 'Other']
- `yearOfManufacture`: Year the vehicle was manufactured
- `vehicleColor`: Vehicle color
- `vehicleLicensePlate`: License plate number
- `driversLicenseClass`: Driver's license class
- `vehicleInsuranceUrl`: URL to vehicle insurance document
- `vehicleRegistrationUrl`: URL to vehicle registration document

### Response
```json
{
  "success": true,
  "message": "Stage 2 completed successfully. Please proceed to Stage 3.",
  "driver": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@driver.com",
    "registrationStage": 3,
    "isRegistrationComplete": false
  },
  "nextStage": {
    "title": "Documents Upload",
    "description": "Upload required documents for verification",
    "requiredFields": ["driversLicenseFrontUrl", "driversLicenseBackUrl", "vehicleRegistrationUrl", "vehicleInsuranceUrl", "drivingAbstractUrl", "drivingAbstractDate", "workEligibilityUrl", "workEligibilityType", "sinCardUrl", "sinCardNumber"]
  }
}
```

---

## Stage 3: Documents Upload

### Endpoint
```
PUT /api/driver-staged/stage/3
```

### Description
Completes Stage 3 by uploading all required documents.

### Request Body
```json
{
  "driversLicenseFrontUrl": "https://example.com/documents/license-front.jpg",
  "driversLicenseBackUrl": "https://example.com/documents/license-back.jpg",
  "driversLicenseClass": "G",
  "vehicleRegistrationUrl": "https://example.com/documents/registration.pdf",
  "vehicleInsuranceUrl": "https://example.com/documents/insurance.pdf",
  "drivingAbstractUrl": "https://example.com/documents/abstract.pdf",
  "drivingAbstractDate": "2024-01-15",
  "workEligibilityUrl": "https://example.com/documents/work-permit.pdf",
  "workEligibilityType": "work_permit",
  "sinCardUrl": "https://example.com/documents/sin-card.jpg",
  "sinCardNumber": "123-456-789"
}
```

### Required Fields for Stage 3
- `driversLicenseFrontUrl`: URL to front of driver's license
- `driversLicenseBackUrl`: URL to back of driver's license
- `driversLicenseClass`: Driver's license class
- `vehicleRegistrationUrl`: URL to vehicle registration document
- `vehicleInsuranceUrl`: URL to vehicle insurance document
- `drivingAbstractUrl`: URL to driving abstract document
- `drivingAbstractDate`: Date of driving abstract (YYYY-MM-DD)
- `workEligibilityUrl`: URL to work eligibility document
- `workEligibilityType`: One of ['passport', 'pr_card', 'work_permit', 'study_permit']
- `sinCardUrl`: URL to SIN card document
- `sinCardNumber`: SIN card number (format: XXX-XXX-XXX)

### Response
```json
{
  "success": true,
  "message": "Stage 3 completed successfully. Please proceed to Stage 4.",
  "driver": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@driver.com",
    "registrationStage": 4,
    "isRegistrationComplete": false
  },
  "nextStage": {
    "title": "Banking & Consent",
    "description": "Complete banking information and consent forms",
    "requiredFields": ["bankingInfo", "consentAndDeclarations"]
  }
}
```

---

## Stage 4: Banking Information

### Endpoint
```
PUT /api/driver-staged/stage/4
```

### Description
Completes Stage 4 by providing banking information.

### Request Body
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

### Required Fields for Stage 4
- `bankingInfo.accountNumber`: Bank account number
- `bankingInfo.accountHolderName`: Name on the account
- `transitNumber`: 5-digit transit number
- `institutionNumber`: 3-digit institution number

### Optional Fields for Stage 4
- `bankingInfo.bankName`: Bank name

### Response
```json
{
  "success": true,
  "message": "Stage 4 completed successfully. Please proceed to final stage.",
  "driver": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@driver.com",
    "registrationStage": 5,
    "isRegistrationComplete": false
  },
  "nextStage": {
    "title": "Registration Complete",
    "description": "Your registration is complete and ready for review",
    "requiredFields": []
  }
}
```

---

## Stage 5: Consent and Declarations

### Endpoint
```
PUT /api/driver-staged/stage/5
```

### Description
Completes Stage 5 by providing consent and declarations.

### Request Body
```json
{
  "consentAndDeclarations": {
    "backgroundCheck": true,
    "termsOfService": true,
    "privacyPolicy": true,
    "dataCollection": true
  }
}
```

### Required Fields for Stage 5
- `consentAndDeclarations.backgroundCheck`: Consent for background check
- `consentAndDeclarations.termsOfService`: Agreement to terms of service
- `consentAndDeclarations.privacyPolicy`: Agreement to privacy policy
- `consentAndDeclarations.dataCollection`: Consent for data collection

### Response
```json
{
  "success": true,
  "message": "Registration completed successfully! Your account is now active.",
  "driver": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@driver.com",
    "registrationStage": 5,
    "isRegistrationComplete": true
  },
  "isRegistrationComplete": true
}
```

---

## Additional Endpoints

### Login
```
POST /api/driver-staged/login
```

### Get Profile
```
GET /api/driver-staged/profile
```

### Get Dashboard
```
GET /api/driver-staged/dashboard
```

### Get Registration Stages Info
```
GET /api/driver-staged/stages
```

### Get Specific Stage Data
```
GET /api/driver-staged/stage/:stage
```

### Update Specific Stage
```
PUT /api/driver-staged/update-specific-stage
```

### Legacy Update Stage (Backward Compatibility)
```
PUT /api/driver-staged/update-stage
```

---

## Error Responses

### Missing Required Fields
```json
{
  "success": false,
  "message": "Missing required fields: dateOfBirth, cellNumber, streetNameNumber"
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
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Stage Validation Error
```json
{
  "success": false,
  "message": "Please complete Stage 1 first"
}
```

### Invalid Enum Values
```json
{
  "success": false,
  "message": "Invalid vehicle type"
}
```

---

## Field Validation Rules

### Phone Numbers
- Format: `+1-XXX-XXX-XXXX`
- Example: `+1-234-567-8900`

### Postal Code
- Format: `[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d`
- Examples: `M5V 3A8`, `M5V3A8`

### Dates
- Format: `YYYY-MM-DD`
- Example: `1990-05-15`

### URLs
- Must be valid URL format
- Should point to uploaded documents

### Vehicle Types
- Valid values: `['Walk', 'Scooter', 'Bike', 'Car', 'Van', 'Other']`

### Delivery Types
- Valid values: `['Meals', 'Parcel', 'Grocery', 'Other']`

### Work Eligibility Types
- Valid values: `['passport', 'pr_card', 'work_permit', 'study_permit']`

### Provinces
- Valid values: `['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']`

---

## Registration Flow

1. **Initial Registration**: Create account with basic info
2. **Stage 1**: Complete personal details and address
3. **Stage 2**: Provide vehicle information
4. **Stage 3**: Upload required documents
5. **Stage 4**: Complete banking information
6. **Stage 5**: Provide consent and declarations
7. **Complete**: Registration is complete and ready for admin review

## Status Tracking

- `registrationStage`: Current stage (1-5)
- `isRegistrationComplete`: Boolean indicating if all stages are complete
- Progress percentage available in dashboard endpoint

## Stage Progression Logic

After each successful stage submission:
- `registrationStage` is incremented to the next stage
- `nextStage` information is returned in the response
- Frontend can use this information to proceed to the next stage

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire based on configuration
- All sensitive data is validated and sanitized
- File uploads should be validated for security
- SIN numbers and banking information are encrypted 