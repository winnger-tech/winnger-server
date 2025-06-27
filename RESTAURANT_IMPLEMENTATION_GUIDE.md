# Restaurant Implementation Guide

## Overview
This guide provides complete implementation details for restaurant registration, including both staged and regular registration flows, payment integration, and admin management.

## Base URLs
- **Restaurant Staged Registration**: `POST /api/restaurants/staged`
- **Restaurant Regular Registration**: `POST /api/restaurants/register`
- **Restaurant Management**: `GET /api/restaurants`
- **Payment Integration**: `POST /api/restaurants/create-payment-intent`

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

### Stage 3: Documents and Banking

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

## Restaurant Regular Registration

### Complete Registration Request

#### Request
```json
POST /api/restaurants/register
{
  "email": "restaurant@example.com",
  "password": "SecurePassword123!",
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
    "restaurantId": "uuid",
    "email": "restaurant@example.com",
    "restaurantName": "Delicious Bites",
    "ownerFirstName": "Jane",
    "ownerLastName": "Smith",
    "paymentStatus": "pending",
    "status": "pending",
    "registrationStage": 3,
    "isRegistrationComplete": true
  },
  "message": "Restaurant registration submitted successfully. Please complete payment."
}
```

---

## Restaurant Management Endpoints

### Get All Restaurants

#### Request
```json
GET /api/restaurants?page=1&limit=10&status=pending&paymentStatus=completed
```

#### Response
```json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": "uuid",
        "email": "restaurant@example.com",
        "restaurantName": "Delicious Bites",
        "ownerFirstName": "Jane",
        "ownerLastName": "Smith",
        "city": "Toronto",
        "province": "ON",
        "cuisineType": "Italian",
        "restaurantType": "Fine Dining",
        "status": "pending",
        "paymentStatus": "completed",
        "registrationStage": 3,
        "isRegistrationComplete": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Get Restaurant by ID

#### Request
```json
GET /api/restaurants/uuid
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
    "status": "pending",
    "paymentStatus": "completed",
    "registrationStage": 3,
    "isRegistrationComplete": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  }
}
```

### Update Restaurant Status

#### Request
```json
PUT /api/restaurants/uuid/status
{
  "status": "approved",
  "adminNotes": "All documents verified and approved"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "adminNotes": "All documents verified and approved",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Restaurant status updated successfully"
}
```

---

## Payment Integration

### Create Payment Intent

#### Request
```json
POST /api/restaurants/create-payment-intent
{
  "restaurantId": "uuid",
  "amount": 149.99
}
```

#### Response
```json
{
  "success": true,
  "clientSecret": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q_secret_abc123",
  "paymentIntentId": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q"
}
```

### Confirm Payment

#### Request
```json
POST /api/restaurants/confirm-payment
{
  "restaurantId": "uuid",
  "paymentIntentId": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q"
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "paymentStatus": "completed"
}
```

---

## Restaurant Authentication

### Login

#### Request
```json
POST /api/restaurants/login
{
  "email": "restaurant@example.com",
  "password": "SecurePassword123!"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "restaurant": {
      "id": "uuid",
      "email": "restaurant@example.com",
      "restaurantName": "Delicious Bites",
      "ownerFirstName": "Jane",
      "ownerLastName": "Smith",
      "status": "approved",
      "paymentStatus": "completed"
    }
  },
  "message": "Login successful"
}
```

### Forgot Password

#### Request
```json
POST /api/restaurants/forgot-password
{
  "email": "restaurant@example.com"
}
```

#### Response
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

### Reset Password

#### Request
```json
POST /api/restaurants/reset-password
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePassword123!"
}
```

#### Response
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Restaurant Profile Management

### Update Profile

#### Request
```json
PUT /api/restaurants/profile
{
  "restaurantName": "Updated Restaurant Name",
  "phoneNumber": "+1-234-567-8901",
  "streetAddress": "789 New Street",
  "city": "Vancouver",
  "province": "BC",
  "postalCode": "V6B 1A1",
  "cuisineType": "Mexican",
  "restaurantType": "Casual Dining",
  "seatingCapacity": 75,
  "operatingHours": {
    "monday": "10:00-23:00",
    "tuesday": "10:00-23:00",
    "wednesday": "10:00-23:00",
    "thursday": "10:00-23:00",
    "friday": "10:00-00:00",
    "saturday": "11:00-00:00",
    "sunday": "11:00-22:00"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "restaurantName": "Updated Restaurant Name",
    "phoneNumber": "+1-234-567-8901",
    "streetAddress": "789 New Street",
    "city": "Vancouver",
    "province": "BC",
    "postalCode": "V6B 1A1",
    "cuisineType": "Mexican",
    "restaurantType": "Casual Dining",
    "seatingCapacity": 75,
    "operatingHours": {
      "monday": "10:00-23:00",
      "tuesday": "10:00-23:00",
      "wednesday": "10:00-23:00",
      "thursday": "10:00-23:00",
      "friday": "10:00-00:00",
      "saturday": "11:00-00:00",
      "sunday": "11:00-22:00"
    },
    "updatedAt": "2024-01-15T12:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

### Update Documents

#### Request
```json
PUT /api/restaurants/documents
{
  "businessLicenseUrl": "https://example.com/documents/new-business-license.pdf",
  "foodHandlerCertificateUrl": "https://example.com/documents/new-food-handler.pdf",
  "insuranceCertificateUrl": "https://example.com/documents/new-insurance.pdf",
  "menuUrl": "https://example.com/documents/updated-menu.pdf",
  "restaurantPhotosUrl": "https://example.com/photos/new-restaurant.jpg",
  "ownerIdUrl": "https://example.com/documents/new-owner-id.jpg"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessLicenseUrl": "https://example.com/documents/new-business-license.pdf",
    "foodHandlerCertificateUrl": "https://example.com/documents/new-food-handler.pdf",
    "insuranceCertificateUrl": "https://example.com/documents/new-insurance.pdf",
    "menuUrl": "https://example.com/documents/updated-menu.pdf",
    "restaurantPhotosUrl": "https://example.com/photos/new-restaurant.jpg",
    "ownerIdUrl": "https://example.com/documents/new-owner-id.jpg",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  },
  "message": "Documents updated successfully"
}
```

---

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "restaurantName",
      "message": "Restaurant name is required"
    }
  ]
}
```

### Duplicate Email
```json
{
  "success": false,
  "message": "Restaurant with this email already exists"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Restaurant not found"
}
```

### Payment Required
```json
{
  "success": false,
  "message": "Payment required to complete registration"
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
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

### Staged Registration Flow

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

### Regular Registration Flow

1. **Collect All Information**
   - All restaurant details
   - Document uploads
   - Banking information
   - Consent declarations

2. **Submit Registration**
   - Single API call with all data
   - Receive registration confirmation
   - Proceed to payment

3. **Complete Payment**
   - Create payment intent
   - Process payment with Stripe
   - Confirm payment
   - Update registration status

---

## Data Models

### Restaurant Fields

#### Basic Information
- `email`: Restaurant email (unique)
- `password`: Encrypted password
- `restaurantName`: Name of the restaurant
- `ownerFirstName`: Owner's first name
- `ownerLastName`: Owner's last name

#### Contact Information
- `phoneNumber`: Restaurant phone number
- `streetAddress`: Street address
- `city`: City name
- `province`: Province/state
- `postalCode`: Postal code

#### Business Information
- `cuisineType`: Type of cuisine
- `restaurantType`: Type of restaurant
- `seatingCapacity`: Number of seats
- `operatingHours`: Operating hours for each day

#### Documents
- `businessLicenseUrl`: Business license document URL
- `foodHandlerCertificateUrl`: Food handler certificate URL
- `insuranceCertificateUrl`: Insurance certificate URL
- `menuUrl`: Menu document URL
- `restaurantPhotosUrl`: Restaurant photos URL
- `ownerIdUrl`: Owner ID document URL

#### Financial Information
- `bankingInfo`: Banking account information
- `paymentStatus`: Payment status (pending/completed/failed)
- `paymentAmount`: Payment amount
- `paymentDate`: Payment date

#### Status Information
- `status`: Registration status (pending/approved/rejected)
- `registrationStage`: Current registration stage (1-3)
- `isRegistrationComplete`: Whether registration is complete
- `adminNotes`: Admin notes for approval/rejection

---

## Security Considerations

### Frontend Security
- Validate all input fields
- Sanitize user data
- Use HTTPS for all requests
- Implement proper error handling
- Secure document uploads

### Backend Security
- JWT authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Data Protection
- Encrypt sensitive data
- Secure document storage
- Regular security audits
- GDPR compliance
- Data retention policies

---

## Testing Scenarios

### Registration Testing
1. **Valid Registration**
   - Complete registration with valid data
   - Verify all fields are saved correctly
   - Check email confirmation

2. **Invalid Data**
   - Test with missing required fields
   - Test with invalid email format
   - Test with duplicate email

3. **Document Upload**
   - Test file upload functionality
   - Verify file type validation
   - Check file size limits

### Payment Testing
1. **Successful Payment**
   - Complete payment flow
   - Verify payment status update
   - Check email receipt

2. **Failed Payment**
   - Test declined cards
   - Handle payment errors
   - Test retry mechanisms

### Admin Testing
1. **Approval Process**
   - Review restaurant applications
   - Approve/reject registrations
   - Add admin notes

2. **Status Management**
   - Update restaurant status
   - Manage payment status
   - Handle bulk operations

---

## Performance Considerations

### Optimization
- Implement pagination for large datasets
- Use efficient database queries
- Optimize file uploads
- Cache frequently accessed data
- Use CDN for static assets

### Scalability
- Design for horizontal scaling
- Use load balancing
- Implement database sharding
- Monitor performance metrics
- Plan for growth

---

## Monitoring and Analytics

### Track Events
- Registration completions
- Payment success/failure
- Document uploads
- Admin actions
- User interactions

### Metrics
- Registration conversion rate
- Payment success rate
- Average registration time
- Document upload success rate
- Admin approval time

---

## Integration Points

### Email Notifications
- Registration confirmation
- Payment receipts
- Status updates
- Admin notifications
- Password reset emails

### Payment Gateway
- Stripe integration
- Payment processing
- Webhook handling
- Refund processing
- Subscription management

### Admin Dashboard
- Restaurant management
- Approval workflow
- Payment tracking
- Analytics dashboard
- Bulk operations

---

## Deployment Checklist

### Environment Setup
- [ ] Configure database
- [ ] Set up email service
- [ ] Configure payment gateway
- [ ] Set up file storage
- [ ] Configure environment variables

### Security Setup
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up authentication
- [ ] Implement rate limiting
- [ ] Configure backup systems

### Testing Setup
- [ ] Unit tests
- [ ] Integration tests
- [ ] End-to-end tests
- [ ] Performance tests
- [ ] Security tests

### Monitoring Setup
- [ ] Application monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Security monitoring
- [ ] Backup monitoring 