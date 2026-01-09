import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in URL params
      const error = searchParams.get('error');
      if (error) {
        setStatus('error');
        setErrorMessage(error === 'access_denied' 
          ? 'Access was denied. Please try again.' 
          : `Authentication failed: ${error}`
        );
        return;
      }

      // Verify authentication with backend
      try {
        const isAuthenticated = await checkAuth();
        
        if (isAuthenticated) {
          setStatus('success');
          // Small delay to show success message
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          setStatus('error');
          setErrorMessage('Authentication failed. Please try again.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Failed to verify authentication. Please try again.');
      }
    };

    handleCallback();
  }, [checkAuth, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Signing you in...</h2>
            <p className="text-muted-foreground">
              Please wait while we complete your authentication.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold">Welcome!</h2>
            <p className="text-muted-foreground">
              Authentication successful. Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Authentication Failed</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button onClick={() => navigate('/login', { replace: true })}>
              Back to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
