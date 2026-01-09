// API Configuration
// For local development, point directly at your FastAPI server.
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Razorpay Configuration
// Replace with your Razorpay Key ID (publishable key - safe to expose in frontend)
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXX';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth - Google OAuth
  AUTH_LOGIN: '/auth/google/login',       // GET - Initiates Google OAuth login
  AUTH_CALLBACK: '/auth/google/callback', // GET - OAuth callback handler
  AUTH_ME: '/api/auth/me',                // GET - Get current user info
  AUTH_LOGOUT: '/auth/logout',            // GET - Logout user
  
  // Contacts - Scanning & Processing
  EXTRACT_CONTACT: '/api/extract-contact',   // POST - Extract contact from image/text (AI)
  REPROCESS_CONTACT: '/api/reprocess-contact', // POST - Re-scan/reprocess a contact (Pro only)
  APPEND_CONTACT: '/api/append-contact',     // POST - Append contact to Google Sheet
  GET_CONTACTS: '/api/contacts',             // GET - Get all contacts from sheet
  UPDATE_CONTACT: '/api/contacts/update',    // PUT - Edit saved contact
  DELETE_CONTACT: '/api/contacts/delete',    // DELETE - Delete a contact
  EXPORT_CONTACTS_CSV: '/api/contacts/export/csv', // GET - Export contacts to CSV
  
  // Contact Features
  SYNC_GOOGLE_SHEET: '/api/contacts/sync-sheet',   // POST - Sync contacts to Google Sheet
  DETECT_DUPLICATES: '/api/contacts/duplicates',   // GET - Auto duplicate detection (Pro only)
  TAG_CONTACT: '/api/contacts/tag',                // POST - Tag/categorize contact (Pro only)
  GET_TAGS: '/api/contacts/tags',                  // GET - Get all user tags (Pro only)
  BULK_UPLOAD: '/api/contacts/bulk-upload',        // POST - Bulk upload contacts (Pro only)
  
  // Scan Usage & Limits
  GET_SCAN_USAGE: '/api/user/scan-usage',    // GET - Get remaining scans for the month
  GET_PLAN_LIMITS: '/api/user/plan-limits',  // GET - Get current plan limits
  
  // Payments - Razorpay
  PAYMENT_CREATE_ORDER: '/api/payment/create-order', // POST - Create Razorpay order
  PAYMENT_VERIFY: '/api/payment/verify',             // POST - Verify payment signature
  PAYMENT_STATUS: '/api/payment/status',             // GET - Get user's subscription status
  PAYMENT_HISTORY: '/api/payment/history',           // GET - Get payment history
  PAYMENT_CANCEL: '/api/payment/cancel',             // POST - Cancel subscription
  PAYMENT_WEBHOOK: '/api/payment/webhook',           // POST - Razorpay webhook handler
} as const;

// App Info
export const APP_INFO = {
  name: 'SaveMyName',
  tagline: 'Scan business cards → Organize contacts in Google Sheets',
  version: '1.0.0',
} as const;
