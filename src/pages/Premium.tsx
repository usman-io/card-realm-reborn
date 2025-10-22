import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { Loader2, X, Zap, Shield, Star, Crown, Check } from 'lucide-react';

type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused' | null;

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  is_active: boolean;
  current_period_end?: string;
  // Add other subscription properties as needed
}

const Premium = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { subscription, loading, isSubscribed, createCheckoutSession, cancelSubscription, refreshSubscription } = useSubscription();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle success/cancel parameters from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true') {
      // Redirect to dedicated success page
      if (sessionId) {
        navigate(`/dashboard/payment-success?session_id=${sessionId}`);
      } else {
        navigate('/dashboard/payment-success');
      }
      return;
    } else if (canceled === 'true') {
      toast.info(t('premium.paymentCanceled') || 'Payment was canceled. You can try again anytime.');
      // Clean up URL parameters
      // setSearchParams({});
    }
  }, [searchParams, navigate, t]);

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: t('premium.advancedAnalytics'),
      description: t('premium.advancedAnalyticsDesc')
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: t('premium.prioritySupport'),
      description: t('premium.prioritySupportDesc')
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: t('premium.exclusiveFeatures'),
      description: t('premium.exclusiveFeaturesDesc')
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: t('premium.portfolioTracking'),
      description: t('premium.portfolioTrackingDesc')
    }
  ];

  const plans = [
    {
      name: t('premium.freePlan'),
      price: '$0',
      period: t('premium.forever'),
      description: t('premium.perfectForCasual'),
      features: [
        t('premium.basicTracking'),
        t('premium.upTo100Cards'),
        t('premium.standardSearch'),
        t('premium.communityAccess')
      ],
      current: !isSubscribed
    },
    {
      name: t('premium.premiumPlan'),
      price: '$3.99',
      period: t('premium.month'),
      yearlyPrice: '$40.00',
      monthlyEquivalent: '$3.33',
      savings: t('premium.save') + ' $7.88',
      description: t('premium.forSeriousCollectors'),
      features: [
        t('premium.unlimitedCards'),
        t('premium.advancedAnalyticsFeature'),
        t('premium.priceTracking'),
        t('premium.exportData'),
        t('premium.prioritySupportFeature'),
        t('premium.adFree')
      ],
      popular: true,
      current: isSubscribed
    }
  ];

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!isAuthenticated) {
      toast.error(t('auth.loginError'));
      return;
    }

    try {
      const data = await createCheckoutSession(plan);
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.error(t('errors.somethingWentWrong'));
      }
    } catch (error) {
      toast.error(t('errors.somethingWentWrong'));
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      await cancelSubscription();
      toast.success(t('premium.subscriptionCanceledSuccess') || 'Subscription canceled successfully. You will retain access until the end of your billing period.');
      await refreshSubscription();
    } catch (error) {
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setIsCanceling(false);
      setIsCancelModalOpen(false);
    }
  };

  const CancelSubscriptionModal = () => (
    <Dialog
      open={isCancelModalOpen}
      onClose={() => !isCanceling && setIsCancelModalOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-between items-start">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {t('premium.cancelModalTitle')}
            </Dialog.Title>
            <button
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isCanceling}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {t('premium.cancelModalDescription')}
            </p>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isCanceling}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {t('premium.keepSubscription')}
            </button>
            <button
              type="button"
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isCanceling ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('premium.canceling')}
                </span>
              ) : (
                t('premium.cancelSubscription')
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );

  const renderCancelButton = () => (
    <Button
      variant="destructive"
      onClick={() => setIsCancelModalOpen(true)}
      disabled={!subscription?.is_active}
      className="w-full sm:w-auto"
    >
      {subscription?.is_active === false ? t('premium.subscriptionCanceled') : t('premium.cancelSubscription')}
    </Button>
  );

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
      <CancelSubscriptionModal />

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('premium.heroTitle')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {t('premium.heroDescription')}
        </p>
        {isSubscribed ? (
          <Badge variant="default" className="text-sm px-4 py-2 bg-green-600">
            ✅ {t('premium.premiumActive')} - {subscription?.plan} {t('premium.plan')}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-sm px-4 py-2">
            🎉 {t('premium.startPremiumJourney')}
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

      {/* Current Subscription Status for Active Users */}
      {isSubscribed && (
        <div className="mb-16">
          <Card className="max-w-2xl mx-auto border-green-500 bg-green-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">{t('premium.premiumActive')}</CardTitle>
              <CardDescription>
                {t('premium.youreOnPlan')} {subscription?.plan} {t('premium.plan')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {t('premium.enjoyingFeatures')}
                </p>
              </div>
              {renderCancelButton()}
              <p className="text-xs text-gray-500">
                {t('premium.retainAccess')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Plans - Only show for non-subscribers */}
      {!isSubscribed && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('premium.chooseYourPlan')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''} ${plan.current ? 'border-green-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      {t('premium.mostPopular')}
                    </Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white px-3 py-1">
                      {t('premium.currentPlan')}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  {plan.popular && (
                    <div className="mt-2 space-y-1">
                      <div className="text-sm text-gray-600">
                        {t('premium.billedYearly')}: <span className="font-semibold">{plan.monthlyEquivalent}/{t('premium.month')}</span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {plan.yearlyPrice} {t('premium.inTotal')} – {plan.savings}
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
                  {!plan.popular ? (
                    <Button 
                      className="w-full" 
                      variant={plan.current ? 'outline' : 'default'}
                      disabled={plan.current}
                    >
                      {plan.current ? t('premium.currentPlan') : t('premium.getStarted')}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe('monthly')}
                        disabled={!isAuthenticated}
                      >
                        {!isAuthenticated ? t('premium.loginRequired') : t('premium.subscribeMonthly')}
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleSubscribe('yearly')}
                        disabled={!isAuthenticated}
                      >
                        {!isAuthenticated ? t('premium.loginRequired') : t('premium.subscribeYearly')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t('premium.faqTitle')}
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('premium.faqCancelTitle')}</h3>
            <p className="text-gray-600">
              {t('premium.faqCancelDesc')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('premium.faqDataTitle')}</h3>
            <p className="text-gray-600">
              {t('premium.faqDataDesc')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('premium.faqDiscountTitle')}</h3>
            <p className="text-gray-600">
              {t('premium.faqDiscountDesc')}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('premium.faqPriceTitle')}</h3>
            <p className="text-gray-600">
              {t('premium.faqPriceDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section - Only show for non-subscribers */}
      {!isSubscribed && (
        <div className="text-center mt-16 py-12 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('premium.readyToUpgrade')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('premium.joinThousands')}
          </p>
          <div className="space-x-4">
            <Button 
              size="lg" 
              onClick={() => handleSubscribe('yearly')}
              disabled={!isAuthenticated}
            >
              {!isAuthenticated ? t('premium.loginToSubscribe') : t('premium.startYearlyPlan')}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => handleSubscribe('monthly')}
              disabled={!isAuthenticated}
            >
              {!isAuthenticated ? t('premium.loginRequired') : t('premium.startMonthlyPlan')}  
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
