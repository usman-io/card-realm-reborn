
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription } = useSubscription();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh subscription status when component mounts
    refreshSubscription();
    toast.success('Payment successful! Your premium subscription is now active.');
  }, [refreshSubscription]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Your premium subscription has been activated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span>Welcome to Premium</span>
            </div>
            
            {sessionId && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                Session ID: {sessionId}
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                onClick={() => navigate('/premium')} 
                variant="outline"
                className="w-full"
              >
                View Premium Features
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-medium">Advanced Analytics</h4>
              <p className="text-sm text-gray-600">Track your collection's value and trends</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="font-medium">Unlimited Cards</h4>
              <p className="text-sm text-gray-600">Add as many cards as you want</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="font-medium">Price Tracking</h4>
              <p className="text-sm text-gray-600">Monitor market values in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
