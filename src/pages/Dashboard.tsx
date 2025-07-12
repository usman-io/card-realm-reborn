
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { backendApi, pokemonApi } from '@/services/api';
import { Collection, Wishlist, Activity, PokemonCard } from '@/types/api';
import { 
  TrendingUp, 
  Package, 
  Heart, 
  Clock, 
  Star,
  Plus,
  Eye,
  Users,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  total_cards: number;
  total_value: number;
  total_sets: number;
  recent_additions: number;
}

interface CollectionWithCard extends Collection {
  cardData?: PokemonCard;
}

interface WishlistWithCard extends Wishlist {
  cardData?: PokemonCard;
}

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCollectionCards, setRecentCollectionCards] = useState<CollectionWithCard[]>([]);
  const [recentWishlistCards, setRecentWishlistCards] = useState<WishlistWithCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCardData = async (cardId: string): Promise<PokemonCard | null> => {
    try {
      const response = await pokemonApi.getCard(cardId);
      return response.data;
    } catch (error) {
      console.error(`Error fetching card data for ${cardId}:`, error);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Fetch stats
      const statsData = await backendApi.getCollectionStats(token);
      setStats(statsData);

      // Fetch recent collection cards (limit 4)
      const collectionResponse = await backendApi.getUserCollectionCards(token, { 
        page: '1',
        ordering: '-added_date'
      });
      
      const recentCollection = collectionResponse.results.slice(0, 4);
      const collectionWithCards = await Promise.all(
        recentCollection.map(async (item: Collection) => {
          const cardData = await fetchCardData(item.card_id);
          return { ...item, cardData };
        })
      );
      setRecentCollectionCards(collectionWithCards);

      // Fetch recent wishlist cards (limit 4)
      const wishlistResponse = await backendApi.getUserWishlistCards(token, { 
        page: '1',
        ordering: '-added_date'
      });
      
      const recentWishlist = wishlistResponse.results.slice(0, 4);
      const wishlistWithCards = await Promise.all(
        recentWishlist.map(async (item: Wishlist) => {
          const cardData = await fetchCardData(item.card_id);
          return { ...item, cardData };
        })
      );
      setRecentWishlistCards(wishlistWithCards);

      // Fetch recent activities (limit 5)
      const activitiesData = await backendApi.getUserActivities(token, { 
        page: '1',
        page_size: '5'
      });
      setRecentActivities(activitiesData.results || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const quickAccessItems = [
    {
      title: 'Browse Cards',
      description: 'Explore and search Pokemon cards',
      icon: <Package className="h-6 w-6" />,
      path: '/cards',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'View Sets',
      description: 'Browse card sets and expansions',
      icon: <Star className="h-6 w-6" />,
      path: '/sets',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Cards in Collection',
      description: 'View all your collected cards',
      icon: <Package className="h-6 w-6" />,
      path: '/dashboard/collection',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Cards in Wishlist',
      description: 'View all your wishlist cards',
      icon: <Heart className="h-6 w-6" />,
      path: '/dashboard/wishlist',
      color: 'bg-red-50 text-red-600'
    },
    {
      title: 'Graded Cards',
      description: 'View all your graded cards',
      icon: <Trophy className="h-6 w-6" />,
      path: '/dashboard/graded',
      color: 'bg-yellow-50 text-yellow-600'
    }
  ];

  const handleViewAllActivities = () => {
    navigate('/dashboard/activities');
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'Collector'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your collection today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_cards || 0}</div>
            <p className="text-xs text-muted-foreground">
              In your collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_value || 0}</div>
            <p className="text-xs text-muted-foreground">
              Estimated value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Sets</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_sets || 0}</div>
            <p className="text-xs text-muted-foreground">
              Different sets collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Additions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recent_additions || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickAccessItems.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="flex items-center p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`p-2 rounded-lg mr-4 ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewAllActivities}
          >
            <Eye className="h-4 w-4 mr-2" />
            View All Activities
          </Button>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.activity_type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Collection and Wishlist */}
      <Card>
        <CardHeader>
          <CardTitle>My Collection & Wishlist</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="collection" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="collection">Recent Additions to Collection</TabsTrigger>
              <TabsTrigger value="wishlist">Your Wishlist Cards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="collection" className="mt-4">
              {recentCollectionCards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No cards in your collection yet.</p>
                  <Button className="mt-4" onClick={() => navigate('/cards')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Cards
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentCollectionCards.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col gap-3">
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
                        <div>
                          <h3 className="font-medium text-sm mb-1">
                            {item.cardData?.name || `Card ID: ${item.card_id}`}
                          </h3>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.condition}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => navigate('/dashboard/collection')}>
                  View All Collection
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="wishlist" className="mt-4">
              {recentWishlistCards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No cards in your wishlist yet.</p>
                  <Button className="mt-4" onClick={() => navigate('/cards')}>
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentWishlistCards.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col gap-3">
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
                        <div>
                          <h3 className="font-medium text-sm mb-1">
                            {item.cardData?.name || `Card ID: ${item.card_id}`}
                          </h3>
                          <div className="flex justify-between items-center text-xs">
                            <Badge variant="outline" className={`text-xs ${
                              item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.priority} Priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => navigate('/dashboard/wishlist')}>
                  View All Wishlist
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
