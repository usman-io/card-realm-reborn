
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Shield, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

const Premium = () => {
  const { isAuthenticated } = useAuth();
  const { subscription, loading, isSubscribed, createCheckoutSession, createPortalSession } = useSubscription();

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Advanced Analytics',
      description: 'Detailed collection statistics and market insights'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Priority Support',
      description: '24/7 premium customer support'
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: 'Exclusive Features',
      description: 'Early access to new features and tools'
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: 'Portfolio Tracking',
      description: 'Real-time market value tracking'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual collectors',
      features: [
        'Basic collection tracking',
        'Up to 100 cards',
        'Standard search',
        'Community access'
      ],
      current: !isSubscribed
    },
    {
      name: 'Premium',
      price: '$3.99',
      period: 'month',
      yearlyPrice: '$40.00',
      monthlyEquivalent: '$3.33',
      savings: 'save $7.88',
      description: 'For serious collectors',
      features: [
        'Unlimited cards',
        'Advanced analytics',
        'Price tracking',
        'Export data',
        'Priority support',
        'Ad-free experience'
      ],
      popular: true,
      current: isSubscribed
    }
  ];

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!isAuthenticated) {
      toast.error('Please log in to subscribe');
      return;
    }

    try {
      const data = await createCheckoutSession(plan);
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.error('Failed to get checkout URL');
      }
    } catch (error) {
      toast.error('Failed to start checkout process');
    }
  };

  const handleManageSubscription = async () => {
    try {
      await createPortalSession();
    } catch (error) {
      toast.error('Failed to open subscription management');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Unlock the Full Power of TCG Collecting
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Take your Pokémon card collection to the next level with premium features 
          designed for serious collectors and investors.
        </p>
        {isSubscribed ? (
          <Badge variant="default" className="text-sm px-4 py-2 bg-green-600">
            ✅ Premium Active - {subscription?.plan} plan
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-sm px-4 py-2">
            🎉 Start your premium journey today
          </Badge>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-blue-600">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Plans */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Choose Your Plan
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''} ${plan.current ? 'border-green-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                {plan.name === 'Premium' && (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm text-gray-600">
                      Billed yearly: <span className="font-semibold">{plan.monthlyEquivalent}/month</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {plan.yearlyPrice} in total – {plan.savings}
                    </div>
                  </div>
                )}
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.name === 'Free' ? (
                  <Button 
                    className="w-full" 
                    variant={plan.current ? 'outline' : 'default'}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 'Get Started'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {plan.current ? (
                      <Button 
                        className="w-full" 
                        onClick={handleManageSubscription}
                        variant="outline"
                      >
                        Manage Subscription
                      </Button>
                    ) : (
                      <>
                        <Button 
                          className="w-full" 
                          onClick={() => handleSubscribe('monthly')}
                          disabled={!isAuthenticated}
                        >
                          {!isAuthenticated ? 'Login Required' : 'Subscribe Monthly'}
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleSubscribe('yearly')}
                          disabled={!isAuthenticated}
                        >
                          {!isAuthenticated ? 'Login Required' : 'Subscribe Yearly'}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have access 
              to premium features until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">What happens to my data if I cancel?</h3>
            <p className="text-gray-600">
              Your collection data is always yours. If you cancel, you'll still have access to 
              your basic collection, but premium features will be disabled.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Do you offer discounts for annual plans?</h3>
            <p className="text-gray-600">
              Yes! Annual plans save you $7.88 compared to monthly billing. 
              That's 2 months free when you pay yearly.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">How accurate is the price tracking?</h3>
            <p className="text-gray-600">
              Our price data is sourced from multiple marketplaces and updated daily. 
              We provide market averages to help you make informed decisions.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isSubscribed && (
        <div className="text-center mt-16 py-12 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to upgrade your collecting experience?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of collectors who've upgraded to premium
          </p>
          <div className="space-x-4">
            <Button 
              size="lg" 
              onClick={() => handleSubscribe('yearly')}
              disabled={!isAuthenticated}
            >
              {!isAuthenticated ? 'Login to Subscribe' : 'Start Yearly Plan'}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleSubscribe('monthly')}
              disabled={!isAuthenticated}
            >
              {!isAuthenticated ? 'Login Required' : 'Start Monthly Plan'}  
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
