import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Check, Loader2, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE_URL, API_ENDPOINTS, RAZORPAY_KEY_ID, APP_INFO } from '@/config';
import { loadRazorpayScript, RazorpayResponse } from '@/lib/razorpay';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  restrictions?: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 169,
    duration: '/month',
    description: 'For people who actually network a lot',
    popular: true,
    icon: <Crown className="w-5 h-5" />,
    features: [
      '100 scans / month',
      'Priority AI accuracy (reruns allowed)',
      'Re-scan / reprocess card once',
      'Auto duplicate detection',
      'Tag / categorize contacts',
      'Google Sheet sync',
      'Export to CSV',
      'Edit saved contacts',
      'Priority support (faster reply)',
      'No watermark/footer',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 129,
    duration: '/month',
    description: 'For light users',
    icon: <Star className="w-5 h-5" />,
    features: [
      '25 scans / month',
      'Google Sheet sync',
      'AI cleaning (basic)',
      'Edit saved contacts',
      'Export to CSV',
    ],
    restrictions: [
      'No re-scan / reprocess',
      'No bulk upload',
      'Email support only',
      'Watermark in sheet footer',
    ],
  },
];

const PremiumPage = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handlePayment = async (plan: Plan) => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setIsLoading(plan.id);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      const orderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_CREATE_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          plan_id: plan.id,
          amount: plan.price * 100,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: APP_INFO.name,
        description: `${plan.name} Subscription - ₹${plan.price}${plan.duration}`,
        order_id: orderData.order_id,
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_VERIFY}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(response),
            });

            if (verifyResponse.ok) {
              toast.success('Payment successful! Welcome to Premium!');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col items-center min-h-full p-6 pb-24 bg-gradient-header">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Go Premium</h1>
            <p className="text-muted-foreground">
              Unlock the full power of {APP_INFO.name}
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative bg-card/80 backdrop-blur-sm border-border/50 p-6 space-y-5 ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {plan.icon}
                    </div>
                    <h2 className="text-xl font-semibold">{plan.name}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">₹{plan.price}</span>
                    <span className="text-muted-foreground">{plan.duration}</span>
                  </div>
                </div>

                {plan.restrictions ? (
                  // Starter plan with side-by-side layout
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Includes
                      </h4>
                      <div className="space-y-2">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <X className="w-4 h-4 text-destructive" />
                        Restrictions
                      </h4>
                      <div className="space-y-2">
                        {plan.restrictions.map((restriction) => (
                          <div key={restriction} className="flex items-start gap-2">
                            <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">{restriction}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Pro plan with single column
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Everything included
                    </h4>
                    <div className="space-y-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  size="lg" 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600' 
                      : ''
                  }`}
                  onClick={() => handlePayment(plan)}
                  disabled={isLoading !== null}
                >
                  {isLoading === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Subscribe to {plan.name}
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Secure payments powered by Razorpay
            </p>
            <p className="text-xs text-muted-foreground">
              Cancel anytime. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default PremiumPage;
