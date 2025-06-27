# Payment Integration API Documentation

## Overview
This document provides all payment-related API endpoints for integrating Stripe payments with the frontend. The system supports both driver and restaurant payment processing with comprehensive webhook handling.

## Base URL
```
/api/payments
```

## Authentication
- Most endpoints require JWT authentication
- Webhook endpoint does not require authentication
- Include `Authorization: Bearer <token>` header for authenticated endpoints

---

## Payment Endpoints

### 1. Initiate Payment

#### Endpoint
```
POST /api/payments/initiate
```

#### Description
Creates a Stripe Payment Intent for processing payments.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "amount": 99.99,
  "currency": "CAD",
  "userType": "driver",
  "userId": "uuid"
}
```

#### Request Parameters
- `amount`: Payment amount in dollars (e.g., 99.99 for $99.99)
- `currency`: Currency code (e.g., "CAD", "USD")
- `userType`: Type of user ("driver" or "restaurant")
- `userId`: User ID for the payment

#### Response
```json
{
  "clientSecret": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q_secret_abc123",
  "paymentId": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Payment initiation failed"
}
```

---

### 2. Verify Payment

#### Endpoint
```
POST /api/payments/verify
```

#### Description
Verifies a completed payment and updates the user's payment status.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "paymentId": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q",
  "userId": "uuid",
  "userType": "driver"
}
```

#### Request Parameters
- `paymentId`: Stripe Payment Intent ID
- `userId`: User ID
- `userType`: Type of user ("driver" or "restaurant")

#### Response
```json
{
  "success": true,
  "transactionId": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Payment verification failed"
}
```

---

### 3. Get Payment Status

#### Endpoint
```
GET /api/payments/status/:type/:userId
```

#### Description
Retrieves the current payment status for a user.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### URL Parameters
- `type`: User type ("driver" or "restaurant")
- `userId`: User ID

#### Response
```json
{
  "success": true,
  "status": "completed"
}
```

#### Possible Status Values
- `pending`: Payment not yet initiated
- `completed`: Payment successfully completed
- `failed`: Payment failed
- `cancelled`: Payment was cancelled

#### Error Response
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 4. Create Payment Intent (Driver)

#### Endpoint
```
POST /api/drivers/create-payment-intent
```

#### Description
Creates a Stripe Payment Intent specifically for driver registration.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "driverId": "uuid",
  "amount": 99.99
}
```

#### Request Parameters
- `driverId`: Driver's ID
- `amount`: Payment amount in dollars

#### Response
```json
{
  "success": true,
  "clientSecret": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q_secret_abc123",
  "paymentIntentId": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Driver not found"
}
```

---

### 5. Create Payment Intent (Restaurant)

#### Endpoint
```
POST /api/restaurants/create-payment-intent
```

#### Description
Creates a Stripe Payment Intent specifically for restaurant registration.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "restaurantId": "uuid",
  "amount": 149.99
}
```

#### Request Parameters
- `restaurantId`: Restaurant's ID
- `amount`: Payment amount in dollars

#### Response
```json
{
  "success": true,
  "clientSecret": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q_secret_abc123",
  "paymentIntentId": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Restaurant not found"
}
```

---

### 6. Confirm Payment (Driver)

#### Endpoint
```
POST /api/drivers/confirm-payment
```

#### Description
Confirms a completed payment for driver registration.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "driverId": "uuid",
  "paymentIntentId": "pi_3OqX8X2eZvKYlo2C1gQJ8Q8Q"
}
```

#### Request Parameters
- `driverId`: Driver's ID
- `paymentIntentId`: Stripe Payment Intent ID

#### Response
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "paymentStatus": "completed"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Payment not completed"
}
```

---

### 7. Stripe Webhook

#### Endpoint
```
POST /api/payments/webhook
```

#### Description
Handles Stripe webhook events for payment status updates.

#### Headers
```
Stripe-Signature: t=1234567890,v1=abc123...
Content-Type: application/json
```

#### Request Body
Raw Stripe webhook event data (automatically handled by Stripe)

#### Response
```json
{
  "received": true
}
```

#### Supported Webhook Events
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## Frontend Integration Flow

### 1. Payment Initiation Flow

#### Step 1: Create Payment Intent
```javascript
// After user completes registration
const createPaymentIntent = async (userId, userType, amount) => {
  const response = await fetch('/api/payments/initiate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount,
      currency: 'CAD',
      userType: userType,
      userId: userId
    })
  });
  
  const data = await response.json();
  return data.clientSecret;
};
```

#### Step 2: Process Payment with Stripe
```javascript
// Using Stripe.js
const processPayment = async (clientSecret, paymentMethod) => {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethod
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return paymentIntent;
};
```

#### Step 3: Verify Payment
```javascript
const verifyPayment = async (paymentId, userId, userType) => {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentId: paymentId,
      userId: userId,
      userType: userType
    })
  });
  
  const data = await response.json();
  return data.success;
};
```

### 2. Complete Payment Flow

```javascript
const completePayment = async (userId, userType, amount) => {
  try {
    // Step 1: Create payment intent
    const clientSecret = await createPaymentIntent(userId, userType, amount);
    
    // Step 2: Process payment with Stripe
    const paymentIntent = await processPayment(clientSecret, paymentMethod);
    
    // Step 3: Verify payment
    const verified = await verifyPayment(paymentIntent.id, userId, userType);
    
    if (verified) {
      // Payment successful
      return { success: true, transactionId: paymentIntent.id };
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};
```

---

## Stripe Configuration

### Required Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend Stripe Setup
```javascript
// Initialize Stripe
const stripe = Stripe('pk_test_...');

// Create payment method
const createPaymentMethod = async (cardElement) => {
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return paymentMethod;
};
```

---

## Payment Amounts

### Driver Registration
- **Amount**: $99.99 CAD
- **Currency**: CAD
- **Description**: Driver registration fee

### Restaurant Registration
- **Amount**: $149.99 CAD
- **Currency**: CAD
- **Description**: Restaurant registration fee

---

## Error Handling

### Common Payment Errors

#### Card Declined
```json
{
  "success": false,
  "message": "Your card was declined"
}
```

#### Insufficient Funds
```json
{
  "success": false,
  "message": "Your card has insufficient funds"
}
```

#### Invalid Card
```json
{
  "success": false,
  "message": "Your card number is incorrect"
}
```

#### Expired Card
```json
{
  "success": false,
  "message": "Your card has expired"
}
```

### Network Errors
```json
{
  "success": false,
  "message": "Network error. Please try again"
}
```

### Server Errors
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Security Considerations

### Frontend Security
- Never store sensitive payment data
- Use Stripe Elements for card input
- Validate payment data client-side
- Handle errors gracefully
- Use HTTPS for all requests

### Backend Security
- Verify webhook signatures
- Validate payment amounts
- Check user permissions
- Log payment events
- Handle webhook failures

### Data Protection
- Encrypt sensitive data
- Use secure session management
- Implement rate limiting
- Monitor for fraud
- Regular security audits

---

## Testing

### Test Cards
```javascript
// Successful payment
const testCard = '4242424242424242';

// Declined payment
const declinedCard = '4000000000000002';

// Insufficient funds
const insufficientFundsCard = '4000000000009995';

// Expired card
const expiredCard = '4000000000000069';
```

### Test Scenarios
1. **Successful Payment**
   - Complete payment flow
   - Verify payment status
   - Check email receipt

2. **Failed Payment**
   - Test declined cards
   - Handle error messages
   - Retry payment flow

3. **Network Issues**
   - Simulate network failures
   - Test retry mechanisms
   - Handle timeouts

4. **Webhook Testing**
   - Test webhook delivery
   - Verify signature validation
   - Check event processing

---

## Monitoring and Analytics

### Track Events
- Payment initiation
- Payment completion
- Payment failures
- Webhook events
- Error occurrences

### Metrics
- Payment success rate
- Average payment time
- Error rates by type
- Revenue tracking
- User conversion rates

---

## Integration Checklist

### Frontend Setup
- [ ] Install Stripe.js
- [ ] Configure Stripe Elements
- [ ] Set up payment form
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test payment flow

### Backend Setup
- [ ] Configure Stripe keys
- [ ] Set up webhook endpoint
- [ ] Implement payment verification
- [ ] Add payment status tracking
- [ ] Configure email notifications
- [ ] Test webhook handling

### Security Setup
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up rate limiting
- [ ] Implement authentication
- [ ] Add input validation
- [ ] Monitor for fraud

### Testing Setup
- [ ] Set up test environment
- [ ] Configure test cards
- [ ] Test payment flows
- [ ] Verify webhook handling
- [ ] Test error scenarios
- [ ] Performance testing

---

## Support and Troubleshooting

### Common Issues
1. **Payment Intent Creation Fails**
   - Check Stripe keys
   - Verify amount format
   - Check user authentication

2. **Webhook Not Received**
   - Verify webhook URL
   - Check webhook secret
   - Test webhook endpoint

3. **Payment Verification Fails**
   - Check payment intent status
   - Verify user permissions
   - Check database connection

### Debug Information
- Enable Stripe logging
- Monitor webhook events
- Check payment intent status
- Verify user records
- Review error logs

### Contact Information
- **Stripe Support**: https://support.stripe.com
- **Technical Issues**: Contact development team
- **Business Questions**: Contact business team 