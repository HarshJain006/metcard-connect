import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE_URL, API_ENDPOINTS } from '@/config';

// Free tier limits
export const FREE_SCAN_LIMIT = 15;
export const FREE_CONTACT_LIMIT = 25;

interface UsageState {
  scansUsed: number;
  contactsSaved: number;
  isPremium: boolean;
  isLoading: boolean;
  lastFetched: number | null;
  
  // Actions
  fetchUsage: () => Promise<void>;
  incrementScans: () => void;
  incrementContacts: () => void;
  canScan: () => boolean;
  canSaveContact: () => boolean;
  getRemainingScans: () => number;
  getRemainingContacts: () => number;
}

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      scansUsed: 0,
      contactsSaved: 0,
      isPremium: false,
      isLoading: false,
      lastFetched: null,

      fetchUsage: async () => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_SCAN_USAGE}`, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            set({ 
              scansUsed: data.scansUsed || 0,
              contactsSaved: data.contactsSaved || 0,
              isPremium: data.isPremium || false,
              isLoading: false,
              lastFetched: Date.now(),
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Failed to fetch usage:', error);
          set({ isLoading: false });
        }
      },

      incrementScans: () => {
        set((state) => ({ scansUsed: state.scansUsed + 1 }));
      },

      incrementContacts: () => {
        set((state) => ({ contactsSaved: state.contactsSaved + 1 }));
      },

      canScan: () => {
        const { isPremium, scansUsed } = get();
        return isPremium || scansUsed < FREE_SCAN_LIMIT;
      },

      canSaveContact: () => {
        const { isPremium, contactsSaved } = get();
        return isPremium || contactsSaved < FREE_CONTACT_LIMIT;
      },

      getRemainingScans: () => {
        const { isPremium, scansUsed } = get();
        if (isPremium) return Infinity;
        return Math.max(0, FREE_SCAN_LIMIT - scansUsed);
      },

      getRemainingContacts: () => {
        const { isPremium, contactsSaved } = get();
        if (isPremium) return Infinity;
        return Math.max(0, FREE_CONTACT_LIMIT - contactsSaved);
      },
    }),
    {
      name: 'savemyname-usage',
      partialize: (state) => ({ 
        scansUsed: state.scansUsed, 
        contactsSaved: state.contactsSaved,
        isPremium: state.isPremium,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
