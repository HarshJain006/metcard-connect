import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DigitalCard {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  showPhone: boolean;
  linkedIn?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface DigitalCardState {
  card: DigitalCard | null;
  isLoading: boolean;
  
  // Actions
  setCard: (card: DigitalCard) => void;
  updateCard: (updates: Partial<DigitalCard>) => void;
  clearCard: () => void;
  generateShareUrl: () => string;
}

export const useDigitalCardStore = create<DigitalCardState>()(
  persist(
    (set, get) => ({
      card: null,
      isLoading: false,

      setCard: (card) => set({ card }),

      updateCard: (updates) => {
        const currentCard = get().card;
        if (currentCard) {
          set({
            card: {
              ...currentCard,
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          });
        } else {
          // Create new card
          set({
            card: {
              id: crypto.randomUUID(),
              name: updates.name || '',
              showPhone: updates.showPhone ?? true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...updates,
            } as DigitalCard,
          });
        }
      },

      clearCard: () => set({ card: null }),

      generateShareUrl: () => {
        const card = get().card;
        if (!card) return '';
        
        // For now, generate a local URL - in production this would be a shareable link
        const baseUrl = window.location.origin;
        return `${baseUrl}/card/${card.id}`;
      },
    }),
    {
      name: 'savemyname-digital-card',
      partialize: (state) => ({ card: state.card }),
    }
  )
);
