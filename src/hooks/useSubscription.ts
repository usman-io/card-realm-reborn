
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { backendApi } from '@/services/api';
import { toast } from 'sonner';

interface Subscription {
  id: number;
  plan: string;
  is_active: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchSubscription = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/subscription/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.length > 0 ? data[0] : null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: 'monthly' | 'yearly') => {
    if (!token) throw new Error('Not authenticated');
    return await backendApi.createCheckoutSession(token, plan);
  };

  const createPortalSession = async () => {
    if (!token) throw new Error('Not authenticated');
    const data = await backendApi.createPortalSession(token);
    if (data.url) {
      window.open(data.url, '_blank');
    }
  };

  const cancelSubscription = async () => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      await backendApi.cancelSubscription(token);
      toast.success('Subscription canceled successfully');
      // Refresh subscription status
      await fetchSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
      throw error;
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, [token]);

  const isSubscribed = subscription?.is_active || false;

  return {
    subscription,
    loading,
    isSubscribed,
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    refreshSubscription,
  };
};
