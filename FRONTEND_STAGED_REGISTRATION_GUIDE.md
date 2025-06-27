# Frontend Staged Registration Implementation Guide

## Overview
This guide provides all the API endpoints, request/response examples, and implementation flow for staged registration in the frontend. The system supports both driver and restaurant registration with multiple stages.

## Base URLs
- **Driver Staged Registration**: `POST /api/drivers/staged`
- **Restaurant Staged Registration**: `POST /api/restaurants/staged`
- **Stage Progression**: `PUT /api/drivers/staged/:id/progress` or `PUT /api/restaurants/staged/:id/progress`

---

## Driver Staged Registration

### Stage 1: Basic Information

#### Request
```json
POST /api/drivers/staged
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "registrationStage": 1,
    "isRegistrationComplete": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Stage 1 completed successfully"
}
```

### Stage 2: Personal Details

#### Request
```json
PUT /api/drivers/staged/uuid/progress
{
  "dateOfBirth": "1990-05-15",
  "cellNumber": "+1-234-567-8900",
  "streetNameNumber": "123 Main Street",
  "appUniteNumber": "Apt 4B",
  "city": "Toronto",
  "province": "ON",
  "postalCode": "M5V 3A8"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "cellNumber": "+1-234-567-8900",
    "streetNameNumber": "123 Main Street",
    "appUniteNumber": "Apt 4B",
    "city": "Toronto",
    "province": "ON",
    "postalCode": "M5V 3A8",
    "registrationStage": 2,
    "isRegistrationComplete": false,
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "message": "Stage 2 completed successfully"
}
```

### Stage 3: Vehicle Information

#### Request
```json
PUT /api/drivers/staged/uuid/progress
{
  "vehicleType": "Car",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "deliveryType": "Meals",
  "yearOfManufacture": 2020,
  "vehicleColor": "Silver",
  "vehicleLicensePlate": "ABC123",
  "driversLicenseClass": "G"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "vehicleType": "Car",
    "vehicleMake": "Toyota",
    "vehicleModel": "Camry",
    "deliveryType": "Meals",
    "yearOfManufacture": 2020,
    "vehicleColor": "Silver",
    "vehicleLicensePlate": "ABC123",
    "driversLicenseClass": "G",
    "registrationStage": 3,
    "isRegistrationComplete": false,
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "message": "Stage 3 completed successfully"
}
```

### Stage 4: Document Uploads

#### Request
```json
PUT /api/drivers/staged/uuid/progress
{
  "profilePhotoUrl": "https://example.com/photos/profile.jpg",
  "driversLicenseFrontUrl": "https://example.com/documents/license-front.jpg",
  "driversLicenseBackUrl": "https://example.com/documents/license-back.jpg",
  "vehicleRegistrationUrl": "https://example.com/documents/registration.pdf",
  "vehicleInsuranceUrl": "https://example.com/documents/insurance.pdf",
  "drivingAbstractUrl": "https://example.com/documents/abstract.pdf",
  "drivingAbstractDate": "2024-01-15",
  "workEligibilityUrl": "https://example.com/documents/work-permit.pdf",
  "workEligibilityType": "work_permit",
  "sinCardUrl": "https://example.com/documents/sin-card.jpg",
  "sinNumber": "123-456-789",
  "criminalBackgroundCheckUrl": "https://example.com/documents/background-check.pdf",
  "criminalBackgroundCheckDate": "2024-01-20"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePhotoUrl": "https://example.com/photos/profile.jpg",
    "driversLicenseFrontUrl": "https://example.com/documents/license-front.jpg",
    "driversLicenseBackUrl": "https://example.com/documents/license-back.jpg",
    "vehicleRegistrationUrl": "https://example.com/documents/registration.pdf",
    "vehicleInsuranceUrl": "https://example.com/documents/insurance.pdf",
    "drivingAbstractUrl": "https://example.com/documents/abstract.pdf",
    "drivingAbstractDate": "2024-01-15",
    "workEligibilityUrl": "https://example.com/documents/work-permit.pdf",
    "workEligibilityType": "work_permit",
    "sinCardUrl": "https://example.com/documents/sin-card.jpg",
    "sinNumber": "123-456-789",
    "criminalBackgroundCheckUrl": "https://example.com/documents/background-check.pdf",
    "criminalBackgroundCheckDate": "2024-01-20",
    "registrationStage": 4,
    "isRegistrationComplete": false,
    "updatedAt": "2024-01-15T10:45:00.000Z"
  },
  "message": "Stage 4 completed successfully"
}
```

### Stage 5: Banking and Consent

#### Request
```json
PUT /api/drivers/staged/uuid/progress
{
  "bankingInfo": {
    "accountNumber": "1234567890",
    "accountHolderName": "John Doe",
    "bankName": "Royal Bank of Canada"
  },
  "consentAndDeclarations": {
    "backgroundCheck": true,
    "termsOfService": true,
    "privacyPolicy": true,
    "dataCollection": true
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "bankingInfo": {
      "accountNumber": "1234567890",
      "accountHolderName": "John Doe",
      "bankName": "Royal Bank of Canada"
    },
    "consentAndDeclarations": {
      "backgroundCheck": true,
      "termsOfService": true,
      "privacyPolicy": true,
      "dataCollection": true
    },
    "registrationStage": 5,
    "isRegistrationComplete": true,
    "updatedAt": "2024-01-15T10:50:00.000Z"
  },
  "message": "Registration completed successfully"
}
```

---

## Restaurant Staged Registration

### Stage 1: Basic Information

#### Request
```json
POST /api/restaurants/staged
{
  "email": "restaurant@example.com",
  "password": "SecurePassword123!",
  "restaurantName": "Delicious Bites",
  "ownerFirstName": "Jane",
  "ownerLastName": "Smith"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "restaurant@example.com",
    "restaurantName": "Delicious Bites",
    "ownerFirstName": "Jane",
    "ownerLastName": "Smith",
    "registrationStage": 1,
    "isRegistrationComplete": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Stage 1 completed successfully"
}
```

### Stage 2: Restaurant Details

#### Request
```json
PUT /api/restaurants/staged/uuid/progress
{
  "phoneNumber": "+1-234-567-8900",
  "streetAddress": "456 Food Street",
  "city": "Toronto",
  "province": "ON",
  "postalCode": "M5V 3A8",
  "cuisineType": "Italian",
  "restaurantType": "Fine Dining",
  "seatingCapacity": 50,
  "operatingHours": {
    "monday": "11:00-22:00",
    "tuesday": "11:00-22:00",
    "wednesday": "11:00-22:00",
    "thursday": "11:00-22:00",
    "friday": "11:00-23:00",
    "saturday": "12:00-23:00",
    "sunday": "12:00-21:00"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "restaurant@example.com",
    "restaurantName": "Delicious Bites",
    "ownerFirstName": "Jane",
    "ownerLastName": "Smith",
    "phoneNumber": "+1-234-567-8900",
    "streetAddress": "456 Food Street",
    "city": "Toronto",
    "province": "ON",
    "postalCode": "M5V 3A8",
    "cuisineType": "Italian",
    "restaurantType": "Fine Dining",
    "seatingCapacity": 50,
    "operatingHours": {
      "monday": "11:00-22:00",
      "tuesday": "11:00-22:00",
      "wednesday": "11:00-22:00",
      "thursday": "11:00-22:00",
      "friday": "11:00-23:00",
      "saturday": "12:00-23:00",
      "sunday": "12:00-21:00"
    },
    "registrationStage": 2,
    "isRegistrationComplete": false,
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "message": "Stage 2 completed successfully"
}
```

### Stage 3: Document Uploads

#### Request
```json
PUT /api/restaurants/staged/uuid/progress
{
  "businessLicenseUrl": "https://example.com/documents/business-license.pdf",
  "foodHandlerCertificateUrl": "https://example.com/documents/food-handler.pdf",
  "insuranceCertificateUrl": "https://example.com/documents/insurance.pdf",
  "menuUrl": "https://example.com/documents/menu.pdf",
  "restaurantPhotosUrl": "https://example.com/photos/restaurant.jpg",
  "ownerIdUrl": "https://example.com/documents/owner-id.jpg",
  "bankingInfo": {
    "accountNumber": "0987654321",
    "accountHolderName": "Delicious Bites Inc",
    "bankName": "Toronto Dominion Bank"
  },
  "consentAndDeclarations": {
    "termsOfService": true,
    "privacyPolicy": true,
    "dataCollection": true,
    "foodSafetyCompliance": true
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "restaurant@example.com",
    "restaurantName": "Delicious Bites",
    "ownerFirstName": "Jane",
    "ownerLastName": "Smith",
    "businessLicenseUrl": "https://example.com/documents/business-license.pdf",
    "foodHandlerCertificateUrl": "https://example.com/documents/food-handler.pdf",
    "insuranceCertificateUrl": "https://example.com/documents/insurance.pdf",
    "menuUrl": "https://example.com/documents/menu.pdf",
    "restaurantPhotosUrl": "https://example.com/photos/restaurant.jpg",
    "ownerIdUrl": "https://example.com/documents/owner-id.jpg",
    "bankingInfo": {
      "accountNumber": "0987654321",
      "accountHolderName": "Delicious Bites Inc",
      "bankName": "Toronto Dominion Bank"
    },
    "consentAndDeclarations": {
      "termsOfService": true,
      "privacyPolicy": true,
      "dataCollection": true,
      "foodSafetyCompliance": true
    },
    "registrationStage": 3,
    "isRegistrationComplete": true,
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "message": "Registration completed successfully"
}
```

---

## Get Staged Registration Status

### Driver Status Check

#### Request
```json
GET /api/drivers/staged/uuid
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "registrationStage": 3,
    "isRegistrationComplete": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  }
}
```

### Restaurant Status Check

#### Request
```json
GET /api/restaurants/staged/uuid
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "restaurant@example.com",
    "restaurantName": "Delicious Bites",
    "ownerFirstName": "Jane",
    "ownerLastName": "Smith",
    "registrationStage": 2,
    "isRegistrationComplete": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

## Error Responses

### Invalid Stage Progression
```json
{
  "success": false,
  "message": "Cannot progress to stage 3. Please complete stage 2 first."
}
```

### Missing Required Fields
```json
{
  "success": false,
  "message": "Missing required fields for stage 2: dateOfBirth, cellNumber"
}
```

### Duplicate Email
```json
{
  "success": false,
  "message": "Email already exists in the system"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Staged registration not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Frontend Implementation Flow

### Driver Registration Flow

1. **Stage 1: Basic Information**
   - Email, password, first name, last name
   - Create staged registration
   - Store registration ID in session/localStorage

2. **Stage 2: Personal Details**
   - Date of birth, phone, address
   - Update staged registration
   - Validate stage progression

3. **Stage 3: Vehicle Information**
   - Vehicle details, license information
   - Update staged registration
   - Validate stage progression

4. **Stage 4: Document Uploads**
   - Upload documents to cloud storage
   - Get document URLs
   - Update staged registration with URLs
   - Validate stage progression

5. **Stage 5: Banking and Consent**
   - Banking information
   - Consent declarations
   - Complete registration
   - Redirect to payment

### Restaurant Registration Flow

1. **Stage 1: Basic Information**
   - Email, password, restaurant name, owner name
   - Create staged registration
   - Store registration ID

2. **Stage 2: Restaurant Details**
   - Contact information, address, cuisine type
   - Operating hours, capacity
   - Update staged registration

3. **Stage 3: Documents and Banking**
   - Upload business documents
   - Banking information
   - Consent declarations
   - Complete registration

---

## Stage Validation Rules

### Driver Stages
- **Stage 1**: email, password, firstName, lastName
- **Stage 2**: dateOfBirth, cellNumber, streetNameNumber, city, province, postalCode
- **Stage 3**: vehicleType, vehicleMake, vehicleModel, yearOfManufacture, vehicleColor, vehicleLicensePlate, driversLicenseClass
- **Stage 4**: All document URLs + workEligibilityType, sinNumber, dates
- **Stage 5**: bankingInfo, consentAndDeclarations

### Restaurant Stages
- **Stage 1**: email, password, restaurantName, ownerFirstName, ownerLastName
- **Stage 2**: phoneNumber, streetAddress, city, province, postalCode, cuisineType, restaurantType, seatingCapacity, operatingHours
- **Stage 3**: All document URLs + bankingInfo, consentAndDeclarations

---

## Frontend State Management

### Required State Variables
```javascript
// Registration state
const [registrationId, setRegistrationId] = useState(null);
const [currentStage, setCurrentStage] = useState(1);
const [isComplete, setIsComplete] = useState(false);
const [registrationData, setRegistrationData] = useState({});

// Form state
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

// Document upload state
const [uploadedDocuments, setUploadedDocuments] = useState({});
const [uploadProgress, setUploadProgress] = useState({});
```

### Stage Navigation
- Store registration ID after Stage 1
- Check current stage before allowing progression
- Validate required fields for each stage
- Handle stage progression errors
- Show progress indicator

### Document Upload Flow
1. Select files
2. Upload to cloud storage (S3, etc.)
3. Get document URLs
4. Store URLs in state
5. Submit with registration data

### Error Handling
- Network errors
- Validation errors
- Stage progression errors
- Document upload errors
- Server errors

---

## Security Considerations

### Frontend Validation
- Client-side validation for all fields
- File type validation for documents
- File size limits
- Required field validation
- Format validation (email, phone, etc.)

### Data Storage
- Store registration ID securely
- Don't store sensitive data in localStorage
- Clear data after completion
- Handle session expiration

### Document Security
- Validate file types server-side
- Scan for malware
- Set appropriate file size limits
- Use secure URLs for documents

---

## Testing Scenarios

### Happy Path
1. Complete all stages successfully
2. Verify stage progression
3. Check final registration status
4. Test document uploads

### Error Scenarios
1. Network failures
2. Invalid stage progression
3. Missing required fields
4. Duplicate email
5. Document upload failures
6. Server errors

### Edge Cases
1. Browser refresh during registration
2. Multiple tabs
3. Session expiration
4. Large file uploads
5. Slow network conditions

---

## Performance Considerations

### Optimization
- Lazy load stage components
- Optimize document uploads
- Cache registration data
- Minimize API calls
- Use efficient state management

### User Experience
- Show progress indicators
- Provide clear error messages
- Allow save and resume
- Auto-save form data
- Responsive design

---

## Integration Points

### Payment Gateway
- Integrate after registration completion
- Handle payment success/failure
- Update registration status

### Email Notifications
- Send confirmation emails
- Notify about missing documents
- Update on approval status

### Admin Dashboard
- Show pending registrations
- Allow approval/rejection
- Track registration progress

---

## Monitoring and Analytics

### Track Events
- Stage completion
- Time spent per stage
- Drop-off points
- Error occurrences
- Document upload success/failure

### Metrics
- Registration completion rate
- Average time to complete
- Error rates by stage
- Document upload success rate
- User satisfaction scores 