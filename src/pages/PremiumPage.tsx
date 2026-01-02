import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Check } from 'lucide-react';

const PremiumPage = () => {
  const features = [
    'Unlimited card scans',
    'Export to multiple formats',
    'AI-powered duplicate detection',
    'Team collaboration',
    'Priority support',
  ];

  return (
    <div className="flex items-center justify-center min-h-full p-6 bg-gradient-header">
      <Card className="max-w-md w-full bg-card/80 backdrop-blur-sm border-border/50 p-8 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Crown className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Go Premium</h1>
          <p className="text-muted-foreground">
            Unlock the full power of SaveMyName
          </p>
        </div>

        <div className="space-y-3 text-left">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Coming Soon
        </Button>

        <p className="text-xs text-muted-foreground">
          Premium features are currently in development
        </p>
      </Card>
    </div>
  );
};

export default PremiumPage;
