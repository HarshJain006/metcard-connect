// API Configuration
// Change this to your backend URL (Docker container base URL)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://savemyname.in';

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
  
  // Contacts
  EXTRACT_CONTACT: '/api/extract-contact', // POST - Extract contact from image/text
  APPEND_CONTACT: '/api/append-contact',   // POST - Append contact to Google Sheet
  GET_CONTACTS: '/api/contacts',           // GET - Get all contacts from sheet
  
  // Payments - Razorpay
  PAYMENT_CREATE_ORDER: '/api/payment/create-order', // POST - Create Razorpay order
  PAYMENT_VERIFY: '/api/payment/verify',             // POST - Verify payment signature
  PAYMENT_STATUS: '/api/payment/status',             // GET - Get user's subscription status
} as const;

// App Info
export const APP_INFO = {
  name: 'SaveMyName',
  tagline: 'Scan business cards → Organize contacts in Google Sheets',
  version: '1.0.0',
} as const;
