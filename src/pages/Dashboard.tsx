
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { backendApi } from '@/services/api';
import { Collection, Wishlist } from '@/types/api';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [collection, setCollection] = useState<Collection[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [collectionResponse, wishlistResponse] = await Promise.all([
          backendApi.getCollection(token),
          backendApi.getWishlist(token)
        ]);

        // Handle collection data - check if it's an array or has a results property
        const collectionData = Array.isArray(collectionResponse) 
          ? collectionResponse 
          : Array.isArray(collectionResponse?.results) 
            ? collectionResponse.results 
            : [];

        // Handle wishlist data - check if it's an array or has a results property
        const wishlistData = Array.isArray(wishlistResponse)
          ? wishlistResponse
          : Array.isArray(wishlistResponse?.results)
            ? wishlistResponse.results
            : [];

        setCollection(collectionData);
        setWishlist(wishlistData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty arrays on error to prevent reduce errors
        setCollection([]);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <Badge variant="secondary">📊</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {collection.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique cards: {collection.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Badge variant="secondary">🎯</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wishlist.length}</div>
            <p className="text-xs text-muted-foreground">
              Cards you want to collect
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Value</CardTitle>
            <Badge variant="secondary">💰</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Estimated market value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Badge variant="secondary">📈</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Overall collection progress
            </p>
          </CardContent>
        </Card>
      </div>

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
                  {collection.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Card ID: {item.card_id}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} | Condition: {item.condition}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(item.added_date).toLocaleDateString()}
                      </Badge>
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
                      <div>
                        <p className="font-medium">Card ID: {item.card_id}</p>
                        <p className="text-sm text-gray-500">
                          Priority: {item.priority}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(item.added_date).toLocaleDateString()}
                      </Badge>
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
