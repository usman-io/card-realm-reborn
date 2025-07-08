
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { pokemonApi } from '@/services/api';
import { PokemonCard } from '@/types/api';
import { ArrowLeft, Heart, Plus, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<PokemonCard | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) return;
      
      try {
        const response = await pokemonApi.getCard(id);
        setCard(response.data);
      } catch (error) {
        console.error('Error fetching card:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Card Not Found</h1>
          <Link to="/cards">
            <Button>Back to Cards</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/cards" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Cards
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Card Image */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <img
              src={card.images.large}
              alt={card.name}
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
          
          {isAuthenticated && (
            <div className="flex gap-4">
              <Button className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add to Collection
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Add to Wishlist
              </Button>
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{card.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{card.supertype}</Badge>
              {card.subtypes?.map((subtype) => (
                <Badge key={subtype} variant="outline">{subtype}</Badge>
              ))}
            </div>
            <p className="text-gray-600">
              <Link to={`/sets/${card.set.id}`} className="hover:text-blue-600">
                {card.set.name}
              </Link>
              {' • '}#{card.number} of {card.set.total}
            </p>
          </div>

          {/* Basic Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Card Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {card.hp && (
                <div className="flex justify-between">
                  <span className="text-gray-600">HP</span>
                  <span className="font-medium">{card.hp}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Rarity</span>
                <Badge variant="outline">{card.rarity}</Badge>
              </div>
              {card.types && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type(s)</span>
                  <div className="flex gap-1">
                    {card.types.map((type) => (
                      <Badge key={type} variant="secondary">{type}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {card.artist && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Artist</span>
                  <span className="font-medium">{card.artist}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          {card.tcgplayer?.prices && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Market Prices
                </CardTitle>
                <CardDescription>
                  Prices from TCGPlayer • Updated {new Date(card.tcgplayer.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {card.tcgplayer.prices.normal && (
                    <div className="flex justify-between">
                      <span>Normal</span>
                      <span className="font-medium">${card.tcgplayer.prices.normal.market}</span>
                    </div>
                  )}
                  {card.tcgplayer.prices.holofoil && (
                    <div className="flex justify-between">
                      <span>Holofoil</span>
                      <span className="font-medium">${card.tcgplayer.prices.holofoil.market}</span>
                    </div>
                  )}
                  {card.tcgplayer.prices.reverseHolofoil && (
                    <div className="flex justify-between">
                      <span>Reverse Holo</span>
                      <span className="font-medium">${card.tcgplayer.prices.reverseHolofoil.market}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="attacks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attacks">Attacks</TabsTrigger>
            <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
            <TabsTrigger value="legalities">Legalities</TabsTrigger>
            <TabsTrigger value="flavor">Flavor</TabsTrigger>
          </TabsList>

          <TabsContent value="attacks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attacks & Abilities</CardTitle>
              </CardHeader>
              <CardContent>
                {card.attacks && card.attacks.length > 0 ? (
                  <div className="space-y-4">
                    {card.attacks.map((attack, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{attack.name}</h3>
                          <span className="font-bold text-lg">{attack.damage}</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {attack.cost.map((cost, costIndex) => (
                            <Badge key={costIndex} variant="outline">{cost}</Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{attack.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No attacks or abilities available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weaknesses" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weaknesses</CardTitle>
                </CardHeader>
                <CardContent>
                  {card.weaknesses && card.weaknesses.length > 0 ? (
                    <div className="space-y-2">
                      {card.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{weakness.type}</span>
                          <span className="font-medium">{weakness.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No weaknesses.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resistances</CardTitle>
                </CardHeader>
                <CardContent>
                  {card.resistances && card.resistances.length > 0 ? (
                    <div className="space-y-2">
                      {card.resistances.map((resistance, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{resistance.type}</span>
                          <span className="font-medium">{resistance.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No resistances.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="legalities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Format Legalities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(card.legalities).map(([format, legal]) => (
                    <div key={format} className="flex justify-between items-center">
                      <span className="capitalize">{format}</span>
                      <Badge variant={legal === 'Legal' ? 'default' : 'destructive'}>
                        {legal}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flavor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Flavor Text & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {card.flavorText && (
                  <div>
                    <h3 className="font-semibold mb-2">Flavor Text</h3>
                    <p className="text-gray-700 italic">{card.flavorText}</p>
                  </div>
                )}
                {card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Pokédex Numbers</h3>
                    <div className="flex gap-2">
                      {card.nationalPokedexNumbers.map((num) => (
                        <Badge key={num} variant="outline">#{num}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {card.convertedRetreatCost !== undefined && (
                  <div>
                    <h3 className="font-semibold mb-2">Retreat Cost</h3>
                    <p>{card.convertedRetreatCost} energy</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CardDetail;
