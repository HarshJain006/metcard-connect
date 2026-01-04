# Razorpay Payment Integration Guide

This document explains how to integrate the backend with the Razorpay payment system implemented in the SaveMyName frontend.

## Subscription Plans

### Plan 1: Pro — ₹169/month (Recommended)
**Target:** For people who actually network a lot

**Features:**
- 100 scans / month
- Priority AI accuracy (reruns allowed)
- Re-scan / reprocess card once
- Auto duplicate detection
- Tag / categorize contacts
- Google Sheet sync
- Export to CSV
- Edit saved contacts
- Priority support (faster reply)
- No watermark/footer

### Plan 2: Starter — ₹129/month
**Target:** For light users

**Features:**
- 25 scans / month
- Google Sheet sync
- AI cleaning (basic)
- Edit saved contacts
- Export to CSV

**Restrictions:**
- No re-scan / reprocess
- No bulk upload
- Email support only
- Watermark in sheet footer

---

## Required Backend Endpoints

### Payment Endpoints

#### 1. POST `/api/payment/create-order`
Creates a Razorpay order before initiating payment.

**Request Body:**
```json
{
  "plan_id": "pro" | "starter",
  "amount": 16900  // Amount in paise (169 INR = 16900 paise)
}
```

**Response:**
```json
{
  "order_id": "order_XXXXXXXXXX",
  "amount": 16900,
  "currency": "INR"
}
```

#### 2. POST `/api/payment/verify`
Verifies the payment signature after successful payment.

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_XXXXXXXXXX",
  "razorpay_order_id": "order_XXXXXXXXXX",
  "razorpay_signature": "signature_hash"
}
```

#### 3. GET `/api/payment/status`
Returns the current user's subscription status.

**Response:**
```json
{
  "is_premium": true,
  "plan": "pro",
  "scans_remaining": 85,
  "scans_limit": 100,
  "expires_at": "2025-02-03T00:00:00Z"
}
```

#### 4. GET `/api/payment/history`
Returns user's payment history.

#### 5. POST `/api/payment/cancel`
Cancels the user's subscription.

#### 6. POST `/api/payment/webhook`
Razorpay webhook handler for payment events.

---

### Contact & Scan Endpoints

#### 1. POST `/api/extract-contact`
Extract contact from image/text using AI.

**Request:** Multipart form with image or text
**Response:** Extracted contact data

#### 2. POST `/api/reprocess-contact` (Pro only)
Re-scan/reprocess a contact with improved AI.

**Request Body:**
```json
{
  "contact_id": "123",
  "image_url": "https://..."
}
```

#### 3. POST `/api/append-contact`
Append contact to user's Google Sheet.

#### 4. GET `/api/contacts`
Get all contacts from user's sheet.

#### 5. PUT `/api/contacts/update`
Edit/update a saved contact.

**Request Body:**
```json
{
  "contact_id": "123",
  "name": "Updated Name",
  "email": "updated@email.com",
  "phone": "+91..."
}
```

#### 6. DELETE `/api/contacts/delete`
Delete a contact.

#### 7. GET `/api/contacts/export/csv`
Export all contacts to CSV file.

---

### Pro-Only Feature Endpoints

#### 1. POST `/api/contacts/sync-sheet`
Sync contacts to Google Sheet.

#### 2. GET `/api/contacts/duplicates` (Pro only)
Auto-detect duplicate contacts.

**Response:**
```json
{
  "duplicates": [
    {
      "original_id": "123",
      "duplicate_id": "456",
      "similarity_score": 0.95
    }
  ]
}
```

#### 3. POST `/api/contacts/tag` (Pro only)
Tag/categorize a contact.

**Request Body:**
```json
{
  "contact_id": "123",
  "tags": ["client", "networking-event"]
}
```

#### 4. GET `/api/contacts/tags` (Pro only)
Get all user's tags.

#### 5. POST `/api/contacts/bulk-upload` (Pro only)
Bulk upload multiple contacts.

---

### Usage & Limits Endpoints

#### 1. GET `/api/user/scan-usage`
Get remaining scans for the current billing period.

**Response:**
```json
{
  "scans_used": 15,
  "scans_limit": 100,
  "scans_remaining": 85,
  "resets_at": "2025-02-01T00:00:00Z"
}
```

#### 2. GET `/api/user/plan-limits`
Get current plan's feature limits.

**Response:**
```json
{
  "plan": "pro",
  "features": {
    "scans_per_month": 100,
    "can_reprocess": true,
    "can_bulk_upload": true,
    "can_tag": true,
    "can_detect_duplicates": true,
    "priority_support": true,
    "has_watermark": false
  }
}
```

---

## Environment Variables

Add these to your backend `.env` file:

```env
# Razorpay Credentials (get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXX

# For testing, use test keys:
# RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
# RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

## Frontend Configuration

Update `src/config.ts`:
```typescript
export const RAZORPAY_KEY_ID = 'rzp_live_XXXXXXXXXX';
```

---

## Database Schema (Example)

```sql
-- Users table with plan info
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'free', -- 'free', 'starter', 'pro'
  scans_used INTEGER DEFAULT 0,
  scans_limit INTEGER DEFAULT 5,
  plan_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL, -- 'starter', 'pro'
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  razorpay_signature VARCHAR(200),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Contact tags (Pro only)
CREATE TABLE contact_tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  contact_id VARCHAR(100),
  tag VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scan usage tracking
CREATE TABLE scan_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  scan_type VARCHAR(20), -- 'initial', 'reprocess'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Plan Feature Enforcement

Backend should check plan limits before allowing actions:

```javascript
// Middleware example
const checkPlanFeature = (feature) => async (req, res, next) => {
  const user = req.user;
  const planLimits = getPlanLimits(user.plan);
  
  if (!planLimits.features[feature]) {
    return res.status(403).json({ 
      error: 'Feature not available in your plan',
      upgrade_required: true 
    });
  }
  
  next();
};

// Usage
app.post('/api/reprocess-contact', 
  checkPlanFeature('can_reprocess'), 
  reprocessController
);

app.get('/api/contacts/duplicates', 
  checkPlanFeature('can_detect_duplicates'), 
  duplicatesController
);
```

---

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
- [ ] Enforce plan limits on backend (never trust frontend)
- [ ] Log all payment attempts for debugging
- [ ] Rate limit scan endpoints

## Support

- Razorpay Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Support: https://razorpay.com/support/
