# Restaurant Registration API - Step 4 & Step 5

This document provides the request and response formats for Step 4 (Review & Confirmation) and Step 5 (Payment Processing) of the restaurant registration process.

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Step 4: Review & Confirmation

### Endpoint
```
PUT /api/restaurants/step4
```

### Request

#### Headers
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

#### Body
```javascript
{
  "agreedToTerms": true,
  "confirmationChecked": true,
  "additionalNotes": "Optional additional notes about the registration"
}
```

#### Required Fields
- `agreedToTerms` (boolean): Must be `true` to proceed
- `confirmationChecked` (boolean): Must be `true` to proceed
- `additionalNotes` (string, optional): Any additional notes

### Response

#### Success Response (200)
```javascript
{
  "success": true,
  "message": "Step 4 updated successfully",
  "data": {
    "currentStep": 5,
    "completedSteps": [1, 2, 3, 4],
    "totalSteps": 5,
    "message": "Step 4 completed successfully. Please proceed to payment.",
    "nextStep": {
      "title": "Payment Processing",
      "description": "Complete your registration fee payment to finalize your account"
    }
  }
}
```

#### Error Responses

**Missing Confirmations (400)**
```javascript
{
  "success": false,
  "message": "Please agree to terms and conditions and confirm your information"
}
```

**Previous Steps Not Completed (400)**
```javascript
{
  "success": false,
  "message": "Please complete Step 3 first"
}
```

**Restaurant Not Found (404)**
```javascript
{
  "success": false,
  "message": "Restaurant not found"
}
```

---

## Step 5: Payment Processing

### Endpoint
```
PUT /api/restaurants/step5
```

### Request

#### Headers
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

#### Body
```javascript
{
  "paymentIntentId": "pi_1234567890abcdef",
  "stripePaymentMethodId": "pm_1234567890abcdef" // Optional
}
```

#### Required Fields
- `paymentIntentId` (string): Valid Stripe payment intent ID
- `stripePaymentMethodId` (string, optional): Stripe payment method ID

### Response

#### Success Response (200)
```javascript
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "currentStep": 5,
    "completedSteps": [1, 2, 3, 4, 5],
    "totalSteps": 5,
    "isRegistrationComplete": true,
    "paymentStatus": "completed",
    "status": "pending_approval",
    "message": "Congratulations! Your registration is now complete. Your account is pending approval.",
    "nextSteps": [
      "Your application will be reviewed by our team",
      "You will receive an email notification once approved",
      "Once approved, you can start using all platform features"
    ]
  }
}
```

#### Error Responses

**Payment Not Completed (400)**
```javascript
{
  "success": false,
  "message": "Payment has not been completed successfully"
}
```

**Previous Steps Not Completed (400)**
```javascript
{
  "success": false,
  "message": "Please complete Step 4 first"
}
```

**Missing Payment Intent (400)**
```javascript
{
  "success": false,
  "message": "Payment intent ID is required"
}
```

**Invalid Payment Intent (400)**
```javascript
{
  "success": false,
  "message": "Invalid payment intent or payment verification failed"
}
```

**Restaurant Not Found (404)**
```javascript
{
  "success": false,
  "message": "Restaurant not found"
}
```

---

## Payment Intent Creation (Before Step 5)

### Endpoint
```
POST /api/restaurants/create-payment-intent
```

### Request

#### Headers
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

#### Body
```javascript
{} // No body required
```

### Response

#### Success Response (200)
```javascript
{
  "success": true,
  "clientSecret": "pi_1234567890abcdef_secret_abcdef123456",
  "paymentIntentId": "pi_1234567890abcdef",
  "amount": 5000,
  "currency": "usd"
}
```

#### Error Responses

**Previous Steps Not Completed (400)**
```javascript
{
  "success": false,
  "message": "Please complete all previous steps before payment"
}
```

**Payment Already Completed (400)**
```javascript
{
  "success": false,
  "message": "Payment has already been completed"
}
```

**Restaurant Not Found (404)**
```javascript
{
  "success": false,
  "message": "Restaurant not found"
}
```

**Payment Intent Creation Failed (500)**
```javascript
{
  "success": false,
  "message": "Failed to create payment intent"
}
```

---

## Frontend Integration Notes

### Prerequisites
1. **Step Order**: All steps must be completed in sequence (1 → 2 → 3 → 4 → 5)
2. **Authentication**: Valid JWT token required for all protected endpoints
3. **Payment**: Registration fee is $50 USD (5000 cents)

### Integration Flow
1. **Step 4**: User reviews information and confirms terms
2. **Create Payment Intent**: Call `/create-payment-intent` to get Stripe client secret
3. **Process Payment**: Use Stripe.js to process payment with client secret
4. **Step 5**: Submit payment intent ID to complete registration

### Status Transitions
- After Step 4: `currentStep` becomes 5
- After Step 5: `isRegistrationComplete` becomes `true`, `status` becomes `pending_approval`

### Error Handling
- Always check for `success` field in responses
- Handle validation errors (400) for missing fields
- Handle authentication errors (401) for invalid tokens
- Handle server errors (500) for internal issues

### Success Indicators
- Step 4: `currentStep: 5` and `completedSteps` includes 4
- Step 5: `isRegistrationComplete: true` and `paymentStatus: "completed"` 