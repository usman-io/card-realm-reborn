
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pokemonApi } from '@/services/api';
import { PokemonCard } from '@/types/api';
import { Search, Grid, List, Heart, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Cards = () => {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuth();

  const fetchCards = async (query: string = '', pageNum: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pageNum.toString(),
        pageSize: '30',
        orderBy: sortBy,
      };

      if (query.trim()) {
        params.q = `name:${query}*`;
      }

      const response = await pokemonApi.getCards(params);
      setCards(response.data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(searchQuery, page);
  }, [sortBy, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCards(searchQuery, 1);
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  const addToCollection = (cardId: string) => {
    console.log('Add to collection:', cardId);
    // This would call the backend API
  };

  const addToWishlist = (cardId: string) => {
    console.log('Add to wishlist:', cardId);
    // This would call the backend API
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pokémon Cards</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="-releaseDate">Release Date (New)</SelectItem>
                <SelectItem value="releaseDate">Release Date (Old)</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-md">
              <Button
                variant={displayMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      {displayMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {cards.map((card) => (
            <Card key={card.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-2">
                <Link to={`/cards/${card.id}`}>
                  <div className="aspect-[3/4] overflow-hidden rounded-lg">
                    <img
                      src={card.images.small}
                      alt={card.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="p-2">
                <Link to={`/cards/${card.id}`}>
                  <h3 className="font-medium text-sm truncate hover:text-blue-600">
                    {card.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 truncate">{card.set.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {card.rarity}
                  </Badge>
                  {isAuthenticated && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => addToCollection(card.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => addToWishlist(card.id)}
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Link to={`/cards/${card.id}`}>
                    <img
                      src={card.images.small}
                      alt={card.name}
                      className="w-16 h-20 object-cover rounded"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/cards/${card.id}`}>
                      <h3 className="font-medium hover:text-blue-600">{card.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-600">{card.set.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{card.rarity}</Badge>
                      <Badge variant="outline">#{card.number}</Badge>
                      {card.types && (
                        <div className="flex gap-1">
                          {card.types.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCollection(card.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Collect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToWishlist(card.id)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Wishlist
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {cards.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No cards found.</p>
        </div>
      )}
    </div>
  );
};

export default Cards;
