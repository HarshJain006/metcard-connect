import { Link } from 'react-router-dom';
import { APP_INFO } from '@/config';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Scan, AlertCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const LoginPage = () => {
  const { login, isLoading, connectionError } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-header p-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-card border-border/50 shadow-2xl relative z-10 animate-bounce-in">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden shadow-lg glow-primary">
            <img src={logo} alt="SaveMyName Logo" className="w-full h-full object-cover" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-gradient">
              {APP_INFO.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              {APP_INFO.tagline}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Connection Error */}
          {connectionError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Connection issue. Please check your network and try again.</span>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3">
            <FeatureItem 
              icon={<Scan className="w-5 h-5" />}
              text="Snap a photo of any business card"
            />
            <FeatureItem 
              icon={<FileSpreadsheet className="w-5 h-5" />}
              text="Auto-organize contacts in Google Sheets"
            />
          </div>

          {/* Login Button */}
          <Button
            onClick={login}
            disabled={isLoading}
            size="lg"
            className="w-full h-12 text-base font-medium bg-surface-2 hover:bg-surface-3 text-foreground border border-border/50 transition-all duration-200 hover:border-primary/50 group"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="group-hover:text-primary transition-colors">Sign in with Google</span>
          </Button>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>SaveMyName — From card to contact, instantly</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-3 text-muted-foreground">
    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-primary">
      {icon}
    </div>
    <span className="text-sm">{text}</span>
  </div>
);

export default LoginPage;
