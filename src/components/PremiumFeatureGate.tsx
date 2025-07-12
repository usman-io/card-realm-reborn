
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumFeatureGateProps {
  isPremium: boolean;
  featureName: string;
  featureDescription: string;
  children?: React.ReactNode;
  className?: string;
}

export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  isPremium,
  featureName,
  featureDescription,
  children,
  className = ''
}) => {
  const navigate = useNavigate();

  if (isPremium) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Card className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
            <Crown className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{featureName}</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto">
            {featureDescription}
          </p>
          <Button onClick={() => navigate('/premium')} size="sm">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </Card>
  );
};
