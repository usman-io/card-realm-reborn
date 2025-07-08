
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pokemonApi } from '@/services/api';
import { PokemonSet, PokemonCard } from '@/types/api';
import { ArrowLeft, Calendar, Package } from 'lucide-react';

const SetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<PokemonSet | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSetData = async () => {
      if (!id) return;
      
      try {
        const [setResponse, cardsResponse] = await Promise.all([
          pokemonApi.getSet(id),
          pokemonApi.getCards({ q: `set.id:${id}`, orderBy: 'number' })
        ]);
        
        setSet(setResponse.data);
        setCards(cardsResponse.data || []);
      } catch (error) {
        console.error('Error fetching set data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSetData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Set Not Found</h1>
          <Link to="/sets">
            <Button>Back to Sets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/sets" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sets
      </Link>

      {/* Set Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {set.images?.logo && (
            <img
              src={set.images.logo}
              alt={set.name}
              className="h-20 object-contain"
            />
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{set.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(set.releaseDate).toLocaleDateString()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {set.total} cards
              </Badge>
              <Badge variant="outline">{set.series}</Badge>
              {set.ptcgoCode && (
                <Badge variant="outline">Code: {set.ptcgoCode}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Cards in this Set ({cards.length})
        </h2>
      </div>

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
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="text-xs">
                  #{card.number}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {card.rarity}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No cards found in this set.</p>
        </div>
      )}
    </div>
  );
};

export default SetDetail;
