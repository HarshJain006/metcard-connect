import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import LoginPage from '@/pages/LoginPage';
import WelcomePage from '@/pages/WelcomePage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import ChatPage from '@/pages/ChatPage';
import HistoryPage from '@/pages/HistoryPage';
import SheetPage from '@/pages/SheetPage';
import PremiumPage from '@/pages/PremiumPage';
import InstallPage from '@/pages/InstallPage';
import AppLayout from '@/components/layout/AppLayout';
import NotFound from '@/pages/NotFound';
import OfflineWarning from '@/components/OfflineWarning';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Auth initializer
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OfflineWarning />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            {/* Public routes */}
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<ChatPage />} />
              <Route path="/sheet" element={<SheetPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/premium" element={<PremiumPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
