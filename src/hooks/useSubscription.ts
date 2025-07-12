
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { backendApi } from '@/services/api';
import { Subscription } from '@/types/api';
import { toast } from 'sonner';

export const useSubscription = () => {
  const { token, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!token || !isAuthenticated) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await backendApi.getSubscription(token);
      setSubscription(data.subscribed ? data : null);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscription');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: 'monthly' | 'yearly') => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const data = await backendApi.createCheckoutSession(token, plan);
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
      return data;
    } catch (err) {
      toast.error('Failed to create checkout session');
      throw new Error('Failed to create checkout session');
    }
  };

  const createPortalSession = async () => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const data = await backendApi.createPortalSession(token);
      if (data.url) {
        window.open(data.url, '_blank');
      }
      return data;
    } catch (err) {
      toast.error('Failed to create portal session');
      throw new Error('Failed to create portal session');
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [token, isAuthenticated]);

  return {
    subscription,
    loading,
    error,
    isSubscribed: subscription?.is_active || false,
    refreshSubscription: fetchSubscription,
    createCheckoutSession,
    createPortalSession,
  };
};
