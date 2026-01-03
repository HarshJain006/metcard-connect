// Razorpay Frontend Integration
// This file handles loading the Razorpay SDK and initiating payments

import { API_BASE_URL, API_ENDPOINTS } from '@/config';

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (100 paise = 1 INR)
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Load Razorpay SDK script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create order on backend
export const createOrder = async (planId: string): Promise<{ order_id: string; amount: number; currency: string }> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_CREATE_ORDER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ plan_id: planId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
};

// Verify payment on backend
export const verifyPayment = async (paymentData: RazorpayResponse): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_VERIFY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Payment verification failed');
  }

  return response.json();
};

// Initialize and open Razorpay checkout
export const initiatePayment = async (
  options: Omit<RazorpayOptions, 'handler'> & {
    onSuccess: (response: RazorpayResponse) => void;
    onError?: (error: Error) => void;
    onDismiss?: () => void;
  }
): Promise<void> => {
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    options.onError?.(new Error('Failed to load Razorpay SDK'));
    return;
  }

  const razorpayOptions: RazorpayOptions = {
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    order_id: options.order_id,
    prefill: options.prefill,
    theme: options.theme || { color: '#6366f1' },
    handler: options.onSuccess,
    modal: {
      ondismiss: options.onDismiss,
    },
  };

  const razorpay = new window.Razorpay(razorpayOptions);
  razorpay.open();
};
