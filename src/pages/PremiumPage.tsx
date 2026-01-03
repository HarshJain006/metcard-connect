import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE_URL, API_ENDPOINTS, RAZORPAY_KEY_ID, APP_INFO } from '@/config';
import { loadRazorpayScript, RazorpayResponse } from '@/lib/razorpay';

interface Plan {
  id: string;
  name: string;
  price: number; // in INR
  duration: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 99,
    duration: '/month',
    features: [
      'Unlimited card scans',
      'Export to multiple formats',
      'AI-powered duplicate detection',
      'Email support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 799,
    duration: '/year',
    popular: true,
    features: [
      'Everything in Monthly',
      'Team collaboration (up to 5)',
      'Priority support',
      'Early access to features',
      'Save 33%',
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
      // Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order on backend
      const orderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_CREATE_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          plan_id: plan.id,
          amount: plan.price * 100, // Convert to paise
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: APP_INFO.name,
        description: `${plan.name} Subscription`,
        order_id: orderData.order_id,
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async (response: RazorpayResponse) => {
          // Verify payment on backend
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
    <div className="flex flex-col items-center min-h-full p-6 bg-gradient-header">
      <div className="max-w-3xl w-full space-y-8">
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
              className={`relative bg-card/80 backdrop-blur-sm border-border/50 p-6 space-y-6 ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground">{plan.duration}</span>
                </div>
              </div>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

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
                    Subscribe Now
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
  );
};

export default PremiumPage;
