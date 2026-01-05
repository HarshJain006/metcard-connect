import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, FileSpreadsheet, Zap, Shield, Clock, Users } from 'lucide-react';
import logo from '@/assets/logo.png';

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Logo */}
            <img 
              src={logo} 
              alt="SaveMyName Logo" 
              className="w-24 h-24 md:w-32 md:h-32 mb-8 animate-bounce-in"
            />
            
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6 animate-fade-in">
              SaveMyName
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up">
              Turn business cards into contacts instantly — just snap a photo!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/login">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/login">Try Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-surface-1">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Three simple steps to never lose a business contact again
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              step={1}
              icon={<Camera className="w-8 h-8" />}
              title="Snap a Photo"
              description="Take a picture of any business card with your phone camera"
            />
            <StepCard
              step={2}
              icon={<Zap className="w-8 h-8" />}
              title="AI Extracts Info"
              description="Our smart AI reads and extracts all the contact details automatically"
            />
            <StepCard
              step={3}
              icon={<FileSpreadsheet className="w-8 h-8" />}
              title="Saved to Sheets"
              description="Contacts are instantly organized in your Google Sheets"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Choose SaveMyName?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Built for professionals who network and value their connections
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Lightning Fast"
              description="Extract contact info in seconds, not minutes of manual typing"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Private"
              description="Your data stays safe with enterprise-grade security"
            />
            <FeatureCard
              icon={<FileSpreadsheet className="w-6 h-6" />}
              title="Google Sheets Sync"
              description="All contacts organized in a familiar spreadsheet format"
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="History & Backup"
              description="Access all your scanned cards anytime, anywhere"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Works Offline"
              description="Scan cards even without internet, syncs when online"
            />
            <FeatureCard
              icon={<Camera className="w-6 h-6" />}
              title="High Accuracy"
              description="Advanced AI ensures accurate extraction every time"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-header">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Save Time?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of professionals who've simplified their networking
          </p>
          <Button asChild size="lg" className="text-lg px-10">
            <Link to="/login">Start Free Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="SaveMyName" className="w-8 h-8" />
              <span className="font-semibold">SaveMyName</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SaveMyName. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StepCard = ({ 
  step, 
  icon, 
  title, 
  description 
}: { 
  step: number; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <Card className="relative bg-card border-border/50 overflow-hidden group hover:border-primary/50 transition-colors">
    <div className="absolute top-0 left-0 w-12 h-12 bg-primary/10 flex items-center justify-center">
      <span className="text-primary font-bold text-lg">{step}</span>
    </div>
    <CardContent className="pt-16 pb-6 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors">
    <CardContent className="p-6">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </CardContent>
  </Card>
);

export default WelcomePage;
