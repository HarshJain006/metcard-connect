import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import { useUsageStore } from '@/stores/usageStore';
import LoginPage from '@/pages/LoginPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
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
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, connectionError, checkAuth } = useAuthStore();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await checkAuth();
    setRetrying(false);
  };

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

  // Show connection error UI instead of redirecting
  if (connectionError && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
            <WifiOff className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold">Connection Issue</h2>
          <p className="text-muted-foreground">
            Unable to connect to the server. This might be a temporary issue. Please check your internet connection and try again.
          </p>
          <Button 
            onClick={handleRetry} 
            disabled={retrying}
            className="gap-2"
          >
            {retrying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Retry Connection
          </Button>
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
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { fetchUsage } = useUsageStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch usage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsage();
    }
  }, [isAuthenticated, fetchUsage]);

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
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
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
