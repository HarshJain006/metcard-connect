# Razorpay Payment Integration Guide

This document explains how to integrate the backend with the Razorpay payment system implemented in the SaveMyName frontend.

## Overview

The frontend uses Razorpay's checkout.js for payment processing. The backend needs to:
1. Create orders using Razorpay API
2. Verify payment signatures after successful payments
3. Track subscription status

## Required Backend Endpoints

### 1. POST `/api/payment/create-order`

Creates a Razorpay order before initiating payment.

**Request Body:**
```json
{
  "plan_id": "monthly" | "yearly",
  "amount": 9900  // Amount in paise (99 INR = 9900 paise)
}
```

**Response:**
```json
{
  "order_id": "order_XXXXXXXXXX",
  "amount": 9900,
  "currency": "INR"
}
```

**Backend Implementation (Node.js Example):**
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/payment/create-order', async (req, res) => {
  const { plan_id, amount } = req.body;
  const userId = req.user.id; // From auth middleware

  try {
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        plan_id: plan_id,
        user_id: userId,
      },
    });

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});
```

### 2. POST `/api/payment/verify`

Verifies the payment signature after successful payment.

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_XXXXXXXXXX",
  "razorpay_order_id": "order_XXXXXXXXXX",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

**Backend Implementation (Node.js Example):**
```javascript
const crypto = require('crypto');

app.post('/api/payment/verify', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const userId = req.user.id;

  // Generate signature for verification
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Payment is verified
    // Update user's subscription status in database
    await updateUserSubscription(userId, {
      is_premium: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      subscribed_at: new Date(),
    });

    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});
```

### 3. GET `/api/payment/status`

Returns the current user's subscription status.

**Response:**
```json
{
  "is_premium": true,
  "plan": "yearly",
  "expires_at": "2025-01-03T00:00:00Z"
}
```

## Environment Variables

Add these to your backend `.env` file:

```env
# Razorpay Credentials (get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# For testing, use test keys:
# RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
# RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

## Frontend Configuration

Update the frontend `.env` or `src/config.ts`:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
```

Or directly in `src/config.ts`:
```typescript
export const RAZORPAY_KEY_ID = 'rzp_live_XXXXXXXXXX';
```

## Database Schema (Example)

```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL,
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  razorpay_signature VARCHAR(200),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE TABLE payment_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  order_id VARCHAR(100),
  payment_id VARCHAR(100),
  amount INTEGER,
  status VARCHAR(20),
  raw_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Webhook Setup (Recommended)

Set up Razorpay webhooks for reliable payment tracking:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://savemyname.in/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`, `order.paid`

**Webhook Handler:**
```javascript
app.post('/api/payment/webhook', (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === signature) {
    const event = req.body.event;
    const payment = req.body.payload.payment?.entity;

    switch (event) {
      case 'payment.captured':
        // Update subscription status
        break;
      case 'payment.failed':
        // Log failed payment
        break;
    }

    res.json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

## Testing

1. Use Razorpay test keys for development
2. Test card numbers:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`
3. Any future expiry date and any CVV

## Security Checklist

- [ ] Never expose `RAZORPAY_KEY_SECRET` in frontend
- [ ] Always verify payment signature on backend
- [ ] Use HTTPS for all API calls
- [ ] Implement webhook for reliable payment tracking
- [ ] Log all payment attempts for debugging
- [ ] Handle edge cases (payment timeout, network errors)

## Support

For Razorpay integration issues:
- Documentation: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Support: https://razorpay.com/support/
