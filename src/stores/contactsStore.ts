import { create } from 'zustand';
import { API_BASE_URL, API_ENDPOINTS } from '@/config';
import { DEMO_MODE, mockContacts } from '@/lib/mockData';
import { useAuthStore } from './authStore';
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
    const isDemoMode = useAuthStore.getState().isDemoMode;
    
    // Demo mode - return mock data
    if (isDemoMode || DEMO_MODE) {
      set({ contacts: mockContacts, isLoading: false });
      return;
    }

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
        error: 'Failed to load contacts', 
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
