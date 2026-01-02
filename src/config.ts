// API Configuration
// Change this to your backend URL (Docker container base URL)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://savemyname.in';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/google/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/api/auth/me',
  
  // Contacts
  EXTRACT_CONTACT: '/api/extract-contact',
  APPEND_CONTACT: '/api/append-contact',
  GET_CONTACTS: '/api/contacts',
} as const;

// App Info
export const APP_INFO = {
  name: 'SaveMyName',
  tagline: 'Scan business cards → Organize contacts in Google Sheets',
  version: '1.0.0',
} as const;
