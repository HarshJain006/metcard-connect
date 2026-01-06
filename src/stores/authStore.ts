import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE_URL, API_ENDPOINTS } from '@/config';

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
  connectionError: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<boolean>;
  login: () => void;
  logout: () => Promise<void>;
  setConnectionError: (error: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      connectionError: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
        connectionError: false,
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setConnectionError: (connectionError) => set({ connectionError }),

      checkAuth: async () => {
        // Check if we have a cached user
        const { user } = get();
        
        set({ isLoading: true, connectionError: false });
        
        try {
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            set({ 
              user: userData, 
              isAuthenticated: true, 
              isLoading: false,
              connectionError: false,
            });
            return true;
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              connectionError: false,
            });
            return false;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // If we had a cached user and got a connection error, keep them logged in
          if (user) {
            set({ 
              isLoading: false,
              connectionError: true,
            });
            return true;
          }
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            connectionError: true,
          });
          return false;
        }
      },

      login: () => {
        // Redirect to backend OAuth login endpoint
        window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}`;
      },

      logout: async () => {
        try {
          await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGOUT}`, {
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout failed:', error);
        }
        
        set({ 
          user: null, 
          isAuthenticated: false,
          connectionError: false,
        });
        window.location.href = '/login';
      },
    }),
    {
      name: 'savemyname-auth',
      partialize: (state) => ({ 
        user: state.user,
      }),
    }
  )
);
