
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { pokemonApi } from '@/services/api';
import { PokemonSet } from '@/types/api';
import { Search, Calendar, Package } from 'lucide-react';

const Sets = () => {
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSets, setFilteredSets] = useState<PokemonSet[]>([]);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await pokemonApi.getSets({ orderBy: '-releaseDate' });
        setSets(response.data);
        setFilteredSets(response.data);
      } catch (error) {
        console.error('Error fetching sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSets(sets);
    } else {
      const filtered = sets.filter(set =>
        set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.series.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSets(filtered);
    }
  }, [searchQuery, sets]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pokémon TCG Sets</h1>
        <p className="text-gray-600 mb-6">
          Explore all Pokémon Trading Card Game sets and their cards
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSets.map((set) => (
          <Link key={set.id} to={`/sets/${set.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{set.series}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(set.releaseDate).getFullYear()}
                  </div>
                </div>
                {set.images?.logo && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={set.images.logo}
                      alt={set.name}
                      className="h-16 object-contain"
                    />
                  </div>
                )}
                <CardTitle className="text-lg text-center">{set.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Package className="w-4 h-4 mr-1" />
                      Total Cards
                    </span>
                    <span className="font-medium">{set.total}</span>
                  </div>
                  {set.ptcgoCode && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Code</span>
                      <Badge variant="outline" className="text-xs">
                        {set.ptcgoCode}
                      </Badge>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Cards
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredSets.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No sets found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Sets;
