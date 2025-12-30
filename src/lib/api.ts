/**
 * FastAPI Backend Endpoints
 * All API calls to the backend are defined here
 */

import { API_BASE_URL } from '@/config';

// Types
export interface Contact {
  id: string;
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  sheetId?: string;
}

export interface ExtractContactResponse {
  contact: Contact;
  autoSaved: boolean;
}

export interface ApiError {
  detail: string;
  status: number;
}

// Request configuration
const defaultConfig: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      // Session expired - will trigger redirect in stores
      throw { detail: 'Unauthorized', status: 401 };
    }
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw { detail: error.detail || 'Request failed', status: response.status };
  }
  return response.json();
}

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * GET /auth/google/login
 * Redirects to Google OAuth - call via window.location.href
 */
export const getGoogleLoginUrl = () => `${API_BASE_URL}/auth/google/login`;

/**
 * GET /auth/logout
 * Clears session and redirects to login
 */
export const getLogoutUrl = () => `${API_BASE_URL}/auth/logout`;

/**
 * GET /api/auth/me
 * Returns current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    ...defaultConfig,
    method: 'GET',
  });
  return handleResponse<User>(response);
}

// ============================================
// CONTACT EXTRACTION ENDPOINTS
// ============================================

/**
 * POST /api/extract-contact
 * Extract contact from image file
 * Backend auto-saves to sheet
 */
export async function extractContactFromImage(imageFile: File): Promise<ExtractContactResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/extract-contact`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  return handleResponse<ExtractContactResponse>(response);
}

/**
 * POST /api/extract-contact
 * Extract contact from text input
 * Backend auto-saves to sheet
 */
export async function extractContactFromText(text: string): Promise<ExtractContactResponse> {
  const response = await fetch(`${API_BASE_URL}/api/extract-contact`, {
    ...defaultConfig,
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return handleResponse<ExtractContactResponse>(response);
}

// ============================================
// CONTACT MANAGEMENT ENDPOINTS
// ============================================

/**
 * POST /api/append-contact
 * Add a new contact to the sheet (used when manually adding)
 */
export async function appendContact(contact: Contact): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/append-contact`, {
    ...defaultConfig,
    method: 'POST',
    body: JSON.stringify(contact),
  });
  return handleResponse<{ success: boolean }>(response);
}

/**
 * PUT /api/contacts/{id}
 * Update an existing contact in the sheet
 */
export async function updateContact(contactId: string, contact: Partial<Contact>): Promise<Contact> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
    ...defaultConfig,
    method: 'PUT',
    body: JSON.stringify(contact),
  });
  return handleResponse<Contact>(response);
}

/**
 * GET /api/contacts
 * Get all contacts with optional pagination
 */
export async function getContacts(params?: { limit?: number; offset?: number }): Promise<Contact[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE_URL}/api/contacts${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url, {
    ...defaultConfig,
    method: 'GET',
  });
  return handleResponse<Contact[]>(response);
}

/**
 * GET /api/contacts/{id}
 * Get a single contact by ID
 */
export async function getContact(contactId: string): Promise<Contact> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
    ...defaultConfig,
    method: 'GET',
  });
  return handleResponse<Contact>(response);
}

/**
 * DELETE /api/contacts/{id}
 * Delete a contact from the sheet
 */
export async function deleteContact(contactId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
    ...defaultConfig,
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean }>(response);
}

// ============================================
// SHEET ENDPOINTS
// ============================================

/**
 * GET /api/sheet
 * Get sheet info including embed URL
 */
export async function getSheetInfo(): Promise<{ sheetId: string; embedUrl: string }> {
  const response = await fetch(`${API_BASE_URL}/api/sheet`, {
    ...defaultConfig,
    method: 'GET',
  });
  return handleResponse<{ sheetId: string; embedUrl: string }>(response);
}
