
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap } from 'lucide-react';

interface UsageCardProps {
  isPremium: boolean;
  totalCards: number;
  usagePercentage: number;
  cardsRemaining: number;
  planName: string;
}

export const UsageCard: React.FC<UsageCardProps> = ({
  isPremium,
  totalCards,
  usagePercentage,
  cardsRemaining,
  planName
}) => {
  return (
    <Card className={isPremium ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-gray-200'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Collection Usage</CardTitle>
        <Badge variant={isPremium ? 'default' : 'secondary'} className={isPremium ? 'bg-yellow-600' : ''}>
          {isPremium ? <Crown className="w-3 h-3 mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
          {planName}
        </Badge>
      </CardHeader>
      <CardContent>
        {isPremium ? (
          <div>
            <div className="text-2xl font-bold text-yellow-700">{totalCards}</div>
            <p className="text-xs text-yellow-600">
              Unlimited cards ∞
            </p>
            <div className="mt-2 text-xs text-gray-600">
              🎉 Enjoying unlimited collection storage
            </div>
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">{totalCards}/100</div>
            <p className="text-xs text-muted-foreground">
              {cardsRemaining} cards remaining
            </p>
            <Progress value={usagePercentage} className="mt-2" />
            <div className="mt-2 text-xs text-gray-600">
              {usagePercentage >= 90 && (
                <span className="text-orange-600 font-medium">
                  ⚠️ Almost at limit! Consider upgrading to Premium.
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
