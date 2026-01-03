// API Configuration
// Change this to your backend URL (Docker container base URL)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://savemyname.in';

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
} as const;

// App Info
export const APP_INFO = {
  name: 'SaveMyName',
  tagline: 'Scan business cards → Organize contacts in Google Sheets',
  version: '1.0.0',
} as const;
