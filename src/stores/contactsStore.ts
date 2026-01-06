import { create } from 'zustand';
import { API_BASE_URL, API_ENDPOINTS } from '@/config';
import type { Contact } from './chatStore';

interface ContactsState {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchContacts: (limit?: number) => Promise<void>;
  addContact: (contact: Contact) => void;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,

  fetchContacts: async (limit = 50) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.GET_CONTACTS}?limit=${limit}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const contacts = await response.json();
      set({ contacts, isLoading: false });
    } catch (error) {
      console.error('Fetch contacts error:', error);
      set({ 
        error: 'Unable to load contacts. Please check your connection.', 
        isLoading: false 
      });
    }
  },

  addContact: (contact: Contact) => {
    set((state) => ({
      contacts: [contact, ...state.contacts],
    }));
  },
}));
