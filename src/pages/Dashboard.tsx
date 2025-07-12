import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UsageCard } from '@/components/UsageCard';
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { backendApi } from '@/services/api';
import { Collection, Wishlist, DashboardAnalytics } from '@/types/api';
import { Edit, Trash2, ChevronRight, Trophy, BarChart3, Heart, Copy, Award, Clock, Crown, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [collection, setCollection] = useState<Collection[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [collectionResponse, wishlistResponse, analyticsResponse] = await Promise.all([
          backendApi.getCollection(token),
          backendApi.getWishlist(token),
          backendApi.getDashboardAnalytics(token)
        ]);

        setCollection(Array.isArray(collectionResponse) ? collectionResponse : []);
        setWishlist(Array.isArray(wishlistResponse) ? wishlistResponse : []);
        setAnalytics(analyticsResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setCollection([]);
        setWishlist([]);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleDeleteCollection = async (id: number) => {
    if (!token) return;
    
    try {
      await backendApi.deleteCollectionItem(token, id);
      setCollection(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting collection item:', error);
    }
  };

  const handleDeleteWishlist = async (id: number) => {
    if (!token) return;
    
    try {
      await backendApi.deleteWishlistItem(token, id);
      setWishlist(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your Pokémon card collection
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <UsageCard
          isPremium={analytics?.is_premium || false}
          totalCards={analytics?.total_cards || 0}
          usagePercentage={analytics?.usage_percentage || 0}
          cardsRemaining={analytics?.cards_remaining || 0}
          planName={analytics?.plan_name || 'Free'}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Badge variant="secondary">🎯</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.wishlist_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cards you want to collect
            </p>
          </CardContent>
        </Card>

        <PremiumFeatureGate
          isPremium={analytics?.is_premium || false}
          featureName="Collection Value"
          featureDescription="Track the estimated market value of your collection with premium analytics."
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Value</CardTitle>
              <Badge variant="secondary">💰</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.estimated_value?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">
                Estimated market value
              </p>
            </CardContent>
          </Card>
        </PremiumFeatureGate>

        <PremiumFeatureGate
          isPremium={analytics?.is_premium || false}
          featureName="Advanced Analytics"
          featureDescription="Get detailed completion rates and collection insights with premium analytics."
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Badge variant="secondary">📈</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.completion_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Overall collection progress
              </p>
            </CardContent>
          </Card>
        </PremiumFeatureGate>
      </div>

      {/* Premium Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PremiumFeatureGate
          isPremium={analytics?.is_premium || false}
          featureName="Sets Completed"
          featureDescription="Track your collection progress across different sets and variants."
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500" />
                Sets completed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Any card variant</span>
                </div>
                <Badge variant="secondary">{analytics?.sets_completed.any_variant || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Regular card variants</span>
                </div>
                <Badge variant="secondary">{analytics?.sets_completed.regular_variants || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>All card variants</span>
                </div>
                <Badge variant="secondary">{analytics?.sets_completed.all_variants || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">📦</span>
                  <span>Standard set</span>
                </div>
                <Badge variant="secondary">{analytics?.sets_completed.standard_set || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">📦</span>
                  <span>Parallel set</span>
                </div>
                <Badge variant="secondary">{analytics?.sets_completed.parallel_set || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </PremiumFeatureGate>

        {/* Quick Access - Available to all users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-orange-500">📁</span>
              Quick access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Cards in collection</span>
              </div>
              <Badge variant="outline">{analytics?.total_cards || 0}</Badge>
            </div>
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Cards in wishlist</span>
              </div>
              <Badge variant="outline">{analytics?.wishlist_count || 0}</Badge>
            </div>
            {analytics?.is_premium && (
              <>
                <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Graded cards</span>
                  </div>
                  <Badge variant="outline">{analytics?.graded_cards || 0}</Badge>
                </div>
                <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Estimated value</span>
                  </div>
                  <Badge variant="outline">${analytics?.estimated_value?.toFixed(2) || '0.00'}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card Statistics - Premium Feature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PremiumFeatureGate
          isPremium={analytics?.is_premium || false}
          featureName="Card Type Analytics"
          featureDescription="Get detailed breakdowns of your collection by card types and rarities."
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Unique cards per type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Pokémon</span>
                <Badge variant="secondary">{Math.floor(analytics?.card_types.pokemon || 0)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Trainer</span>
                <Badge variant="secondary">{Math.floor(analytics?.card_types.trainer || 0)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Energy</span>
                <Badge variant="secondary">{Math.floor(analytics?.card_types.energy || 0)}</Badge>
              </div>
            </CardContent>
          </Card>
        </PremiumFeatureGate>

        <PremiumFeatureGate
          isPremium={analytics?.is_premium || false}
          featureName="Rarity Analytics"
          featureDescription="Track the rarity distribution of cards in your collection."
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Unique cards per rarity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">●</span>
                  <span>Common</span>
                </div>
                <Badge variant="secondary">{Math.floor(analytics?.card_rarities.common || 0)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  <span>Uncommon</span>
                </div>
                <Badge variant="secondary">{Math.floor(analytics?.card_rarities.uncommon || 0)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">●</span>
                  <span>Rare</span>
                </div>
                <Badge variant="secondary">{Math.floor(analytics?.card_rarities.rare || 0)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">●</span>
                  <span>Ultra Rare</span>
                </div>
                <Badge variant="secondary">{Math.floor(analytics?.card_rarities.ultra_rare || 0)}</Badge>
              </div>
            </CardContent>
          </Card>
        </PremiumFeatureGate>
      </div>

      {/* Recent Activity */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.recent_activity && analytics.recent_activity.length > 0 ? (
            <div className="space-y-4">
              {analytics.recent_activity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity.</p>
              <p className="text-sm mt-2">Start adding cards to see activity here!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection and Wishlist Tabs */}
      <Tabs defaultValue="collection" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collection">My Collection</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Additions</CardTitle>
              <CardDescription>
                Cards you've recently added to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {collection.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Your collection is empty.</p>
                  <p className="text-sm mt-2">Start by browsing cards and adding them to your collection!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collection.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Card ID: {item.card_id}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} | Condition: {item.condition} | Variant: {item.variant}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {new Date(item.added_date).toLocaleDateString()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCollection(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Wishlist</CardTitle>
              <CardDescription>
                Cards you want to add to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wishlist.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Your wishlist is empty.</p>
                  <p className="text-sm mt-2">Add cards to your wishlist while browsing!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Card ID: {item.card_id}</p>
                        <p className="text-sm text-gray-500">
                          Priority: {item.priority}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {new Date(item.added_date).toLocaleDateString()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWishlist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
