
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UsageCardProps {
  isPremium: boolean;
  totalCards: number;
  usagePercentage: number;
  cardsRemaining: number;
  planName: string;
  sharedView?: boolean; // New prop to indicate if this is a shared view
}

export const UsageCard: React.FC<UsageCardProps> = ({
  isPremium,
  totalCards,
  usagePercentage,
  cardsRemaining,
  planName,
  sharedView = false
}) => {
  const { t } = useTranslation();
  if (sharedView) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('collection.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCards} {t('cards.title').toLowerCase()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {isPremium ? t('premium.premiumPlan') : t('premium.freePlan')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isPremium ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-gray-200'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.totalCards')}</CardTitle>
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
              {t('premium.unlimitedCards')} ∞
            </p>
            <div className="mt-2 text-xs text-gray-600">
              🎉 {t('premium.enjoyingFeatures')}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">{totalCards}/100</div>
            <p className="text-xs text-muted-foreground">
              {cardsRemaining} {t('cards.title').toLowerCase()}
            </p>
            <Progress value={usagePercentage} className="mt-2" />
            <div className="mt-2 text-xs text-gray-600">
              {usagePercentage >= 90 && (
                <span className="text-orange-600 font-medium">
                  ⚠️ {t('premium.readyToUpgrade')}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
