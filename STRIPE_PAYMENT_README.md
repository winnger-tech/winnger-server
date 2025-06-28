# Stripe Payment Integration (Frontend Guide)

This guide explains how to integrate Stripe payments in your frontend for driver/restaurant registration, using your backend API.

---

## 1. Install Stripe.js

Add Stripe's official JS library to your project:

**NPM:**
```bash
npm install @stripe/stripe-js
```

**Or via CDN:**
```html
<script src="https://js.stripe.com/v3/"></script>
```

---

## 2. Frontend Payment Flow Overview

1. **User clicks "Pay"** on your registration form.
2. **Frontend** calls your backend to create a PaymentIntent.
3. **Backend** returns a `clientSecret`.
4. **Frontend** uses Stripe.js to collect card details and confirm the payment.
5. **Frontend** notifies backend to confirm and finalize registration.

---

## 3. API Endpoints

### A. Create Payment Intent

**Endpoint:**  
`POST /api/drivers-staged/payment/create-intent`  
(or `/api/restaurants/payment/create-intent` for restaurants)

**Headers:**  
`Authorization: Bearer <JWT_TOKEN>`

**Request Body:**
```json
{
  "type": "driver", // or "restaurant"
  "amount": 5000,   // Amount in cents (e.g., $50.00 = 5000)
  "currency": "usd" // or "cad", etc.
}
```

**Sample Response:**
```json
{
  "success": true,
  "clientSecret": "pi_1Hxxxx_secret_xxxxx",
  "paymentIntentId": "pi_1Hxxxx",
  "amount": 5000,
  "currency": "usd"
}
```

---

### B. Confirm Payment

**Endpoint:**  
`POST /api/drivers-staged/payment/confirm`  
(or `/api/restaurants/payment/confirm`)

**Headers:**  
`Authorization: Bearer <JWT_TOKEN>`

**Request Body:**
```json
{
  "paymentIntentId": "pi_1Hxxxx"
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Payment confirmed and registration completed."
}
```

---

### C. Get Payment Status

**Endpoint:**  
`GET /api/drivers-staged/payment/status`  
(or `/api/restaurants/payment/status`)

**Headers:**  
`Authorization: Bearer <JWT_TOKEN>`

**Sample Response:**
```json
{
  "success": true,
  "status": "succeeded", // or "requires_payment_method", "processing", etc.
  "paymentIntentId": "pi_1Hxxxx",
  "amount": 5000,
  "currency": "usd"
}
```

---

## 4. Frontend Implementation Example (React + Stripe.js)

```jsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...'); // Your Stripe publishable key

function PaymentForm({ jwtToken }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // 1. Create PaymentIntent on backend
    const res = await fetch('/api/drivers-staged/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ type: 'driver', amount: 5000, currency: 'usd' })
    });
    const { clientSecret, paymentIntentId } = await res.json();

    // 2. Confirm card payment on frontend
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.error) {
      alert(result.error.message);
      setLoading(false);
      return;
    }

    // 3. Notify backend to confirm payment
    await fetch('/api/drivers-staged/payment/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ paymentIntentId })
    });

    alert('Payment successful!');
    setLoading(false);
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handlePayment(); }}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}

// Usage
// <Elements stripe={stripePromise}><PaymentForm jwtToken={yourToken} /></Elements>
```

---

## 5. Stripe Resources

- [Stripe.js Reference](https://stripe.com/docs/js)
- [React Stripe.js](https://stripe.com/docs/stripe-js/react)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)

---

## 6. Notes

- Always use your **publishable key** on the frontend and **secret key** on the backend.
- All payment endpoints require a valid JWT token for authentication.
- Amounts are in the smallest currency unit (e.g., cents).

---

Let me know if you need a sample for a different frontend framework or more details! 