
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UsageCard } from '@/components/UsageCard';
import { backendApi, pokemonApi } from '@/services/api';
import { Collection, Wishlist, DashboardAnalytics, PokemonCard } from '@/types/api';
import { Trophy, BarChart3, Heart, Clock, Eye } from 'lucide-react';

interface CollectionWithCard extends Collection {
  cardData?: PokemonCard;
}

interface WishlistWithCard extends Wishlist {
  cardData?: PokemonCard;
}

const SharedDashboard = () => {
  const { userId } = useParams<{ userId: string }>();
  const [collection, setCollection] = useState<CollectionWithCard[]>([]);
  const [wishlist, setWishlist] = useState<WishlistWithCard[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCardData = async (cardId: string): Promise<PokemonCard | null> => {
    try {
      const response = await pokemonApi.getCard(cardId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching card data for ${cardId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [collectionResponse, wishlistResponse, analyticsResponse] = await Promise.all([
          backendApi.getSharedCollection(userId, { limit: '4', ordering: '-added_date' }),
          backendApi.getSharedWishlist(userId, { limit: '4', ordering: '-added_date' }),
          backendApi.getSharedDashboardAnalytics(userId)
        ]);

        // Fetch card data for recent collection items
        const collectionArray = Array.isArray(collectionResponse.results) ? collectionResponse.results : [];
        const collectionWithCards = await Promise.all(
          collectionArray.slice(0, 4).map(async (item) => {
            const cardData = await fetchCardData(item.card_id);
            return { ...item, cardData };
          })
        );

        // Fetch card data for recent wishlist items
        const wishlistArray = Array.isArray(wishlistResponse.results) ? wishlistResponse.results : [];
        const wishlistWithCards = await Promise.all(
          wishlistArray.slice(0, 4).map(async (item) => {
            const cardData = await fetchCardData(item.card_id);
            return { ...item, cardData };
          })
        );

        setCollection(collectionWithCards);
        setWishlist(wishlistWithCards);
        setAnalytics(analyticsResponse);
      } catch (error) {
        console.error('Error fetching shared dashboard data:', error);
        setError('Failed to load shared dashboard');
        setCollection([]);
        setWishlist([]);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {analytics?.user_name}'s Collection
        </h1>
        <p className="text-gray-600 mt-2">
          Shared Pokémon card collection dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              Cards in wishlist
            </p>
          </CardContent>
        </Card>

        {analytics?.is_premium && (
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
        )}
      </div>

      {/* Collection and Wishlist Tabs */}
      <Tabs defaultValue="collection" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collection">Collection</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Additions</CardTitle>
              <CardDescription>
                Cards recently added to the collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {collection.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No cards in collection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {collection.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col gap-3">
                        {/* Card Image */}
                        <div className="flex justify-center">
                          {item.cardData?.images?.small ? (
                            <img
                              src={item.cardData.images.small}
                              alt={item.cardData.name || `Card ${item.card_id}`}
                              className="w-24 h-32 object-cover rounded-lg shadow-md"
                            />
                          ) : (
                            <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Card Info */}
                        <div className="text-center">
                          <p className="font-medium text-sm mb-1">
                            {item.cardData?.name || `Card ${item.card_id}`}
                          </p>
                          <div className="flex flex-wrap justify-center gap-1 mb-2">
                            <Badge variant="outline" className="text-xs">Qty: {item.quantity}</Badge>
                            <Badge variant="outline" className="text-xs">{item.condition}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(item.added_date).toLocaleDateString()}
                          </p>
                        </div>
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
              <CardTitle>Wishlist</CardTitle>
              <CardDescription>
                Cards in the wishlist
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wishlist.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No cards in wishlist.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col gap-3">
                        {/* Card Image */}
                        <div className="flex justify-center">
                          {item.cardData?.images?.small ? (
                            <img
                              src={item.cardData.images.small}
                              alt={item.cardData.name || `Card ${item.card_id}`}
                              className="w-24 h-32 object-cover rounded-lg shadow-md"
                            />
                          ) : (
                            <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Card Info */}
                        <div className="text-center">
                          <p className="font-medium text-sm mb-1">
                            {item.cardData?.name || `Card ${item.card_id}`}
                          </p>
                          <div className="flex justify-center mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.priority} Priority
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(item.added_date).toLocaleDateString()}
                          </p>
                        </div>
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

export default SharedDashboard;
