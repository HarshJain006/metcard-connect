import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE_URL, API_ENDPOINTS } from '@/config';
import { DEMO_MODE, mockUser } from '@/lib/mockData';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  sheetId?: string;
  sheetUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<boolean>;
  login: () => void;
  loginDemo: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isDemoMode: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      checkAuth: async () => {
        // Check if we're in demo mode from storage
        const { isDemoMode, user } = get();
        if (isDemoMode && user) {
          set({ isLoading: false, isAuthenticated: true });
          return true;
        }

        // If demo mode is enabled globally
        if (DEMO_MODE) {
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false,
            isDemoMode: true
          });
          return true;
        }

        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            set({ 
              user: userData, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          return false;
        }
      },

      login: () => {
        // Redirect to backend OAuth login endpoint
        window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`;
      },

      loginDemo: () => {
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          isDemoMode: true,
        });
      },

      logout: async () => {
        const { isDemoMode } = get();
        
        if (!isDemoMode) {
          try {
            await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGOUT}`, {
              credentials: 'include',
            });
          } catch (error) {
            console.error('Logout failed:', error);
          }
        }
        
        set({ 
          user: null, 
          isAuthenticated: false,
          isDemoMode: false,
        });
        window.location.href = '/login';
      },
    }),
    {
      name: 'all-we-met-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isDemoMode: state.isDemoMode 
      }),
    }
  )
);
