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
import { useTranslation } from 'react-i18next';
import AddToCollectionDialog from '@/components/AddToCollectionDialog';
import AddToWishlistDialog from '@/components/AddToWishlistDialog';

const CardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [card, setCard] = useState<PokemonCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) return;

      try {
        const response = await pokemonApi.getCard(id, i18n.language);
        setCard(response.data);
      } catch (error) {
        console.error('Error fetching card:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id, i18n.language]);

  const addToCollection = (card: PokemonCard) => {
    setSelectedCard(card);
    setShowCollectionDialog(true);
  };

  const addToWishlist = (card: PokemonCard) => {
    setSelectedCard(card);
    setShowWishlistDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('errors.notFound')}</h1>
          <Link to="/cards">
            <Button>{t('cardDetail.backToCards')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/cards" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('cardDetail.backToCards')}
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Card Image */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <img
              src={card.images.small}
              alt={card.name}
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              onError={(e) => {
                // If small image fails, try direct TCGdx URL with proper format
                const serieId = card.set.serie?.id || 'unknown';
                const setId = card.set.id;
                const localId = card.localId || card.number;
                const fallbackUrl = `https://assets.tcgdx.net/en/${serieId}/${setId}/${localId}/high.png`;
                e.currentTarget.src = fallbackUrl;
              }}
            />
          </div>
          
          {isAuthenticated && (
            <div className="flex gap-4">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => addToCollection(card)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('cardDetail.addToCollection')}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => addToWishlist(card)}
              >
                <Heart className="w-4 h-4 mr-2" />
                {t('cardDetail.addToWishlist')}
              </Button>
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{card.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{card.supertype}</Badge>
              {card.subtypes?.map((subtype) => (
                <Badge key={subtype} variant="outline">{subtype}</Badge>
              ))}
            </div>
            <p className="text-muted-foreground">
              <Link to={`/sets/${card.set.id}`} className="hover:text-primary">
                {card.set.name}
              </Link>
              {' • '}#{card.number} of {card.set.total}
            </p>
          </div>

          {/* Basic Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('cardDetail.cardInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {card.hp && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cardDetail.hp')}</span>
                  <span className="font-medium">{card.hp}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cardDetail.rarity')}</span>
                <Badge variant="outline">{card.rarity}</Badge>
              </div>
              {card.types && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cardDetail.types')}</span>
                  <div className="flex gap-1">
                    {card.types.map((type) => (
                      <Badge key={type} variant="secondary">{type}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {card.artist && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cardDetail.artist')}</span>
                  <span className="font-medium">{card.artist}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          {card.pricing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t('cardDetail.marketPrices')}
                </CardTitle>
                <CardDescription>
                  {t('cardDetail.realTimePricing')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* CardMarket Pricing */}
                  {card.pricing.cardmarket && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{t('cardDetail.cardMarket')}</span>
                        <span className="text-sm text-gray-500">EUR</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span>{t('cardDetail.average')}</span>
                          <span className="font-medium">€{card.pricing.cardmarket.avg}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('cardDetail.low')}</span>
                          <span className="font-medium">€{card.pricing.cardmarket.low}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('cardDetail.trend')}</span>
                          <span className="font-medium">€{card.pricing.cardmarket.trend}</span>
                        </div>
                    <div className="flex justify-between">
                          <span>{t('cardDetail.thirtyDayAvg')}</span>
                          <span className="font-medium">€{card.pricing.cardmarket.avg30}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('cardDetail.updated')} {new Date(card.pricing.cardmarket.updated).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* TCGPlayer Pricing */}
                  {card.pricing.tcgplayer && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">{t('cardDetail.tcgPlayer')}</span>
                        <span className="text-sm text-gray-500">USD</span>
                      </h4>
                      <div className="space-y-3">
                        {/* 1st Edition Holofoil */}
                        {card.pricing.tcgplayer['1st-edition-holofoil'] && (
                          <div className="border-l-4 border-yellow-400 pl-3">
                            <div className="font-medium text-sm">{t('cardDetail.firstEditionHolofoil')}</div>
                            <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                              <div className="flex justify-between">
                                <span>{t('cardDetail.low')}</span>
                                <span className="font-medium">${card.pricing.tcgplayer['1st-edition-holofoil'].lowPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t('cardDetail.market')}</span>
                                <span className="font-medium">${card.pricing.tcgplayer['1st-edition-holofoil'].marketPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t('cardDetail.high')}</span>
                                <span className="font-medium">${card.pricing.tcgplayer['1st-edition-holofoil'].highPrice}</span>
                              </div>
                    <div className="flex justify-between">
                                <span>{t('cardDetail.mid')}</span>
                                <span className="font-medium">${card.pricing.tcgplayer['1st-edition-holofoil'].midPrice}</span>
                              </div>
                            </div>
                    </div>
                  )}

                        {/* Unlimited Holofoil */}
                        {card.pricing.tcgplayer['unlimited-holofoil'] && (
                          <div className="border-l-4 border-blue-400 pl-3">
                            <div className="font-medium text-sm">{t('cardDetail.unlimitedHolofoil')}</div>
                            <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                              <div className="flex justify-between">
                                <span>{t('cardDetail.low')}</span>
                                <span className="font-medium">${card.pricing.tcgplayer['unlimited-holofoil'].lowPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t('cardDetail.market')}</span>
                                <span className="font-medium">${card.pricing.tcgplayer['unlimited-holofoil'].marketPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t('cardDetail.high')}</span>
                                <span className="font-medium">${card.pricing.tcgplayer['unlimited-holofoil'].highPrice}</span>
                              </div>
                    <div className="flex justify-between">
                                <span>{t('cardDetail.mid')}</span>
                                <span className="font-medium">${card.pricing.tcgplayer['unlimited-holofoil'].midPrice}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('cardDetail.updated')} {new Date(card.pricing.tcgplayer.updated).toLocaleDateString()}
                      </p>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="attacks">{t('cardDetail.attacks')}</TabsTrigger>
            <TabsTrigger value="weaknesses">{t('cardDetail.weaknesses')}</TabsTrigger>
            <TabsTrigger value="variants">{t('cardDetail.variants')}</TabsTrigger>
            <TabsTrigger value="legalities">{t('cardDetail.legalities')}</TabsTrigger>
            <TabsTrigger value="flavor">{t('cardDetail.flavor')}</TabsTrigger>
          </TabsList>

          <TabsContent value="attacks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('cardDetail.attacksAbilities')}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Abilities */}
                {card.abilities && card.abilities.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-lg">{t('cardDetail.abilities')}</h4>
                    {card.abilities.map((ability, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-blue-800">{ability.name}</h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {ability.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{ability.effect}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attacks */}
                {card.attacks && card.attacks.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">{t('cardDetail.attacks')}</h4>
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
                  !card.abilities || card.abilities.length === 0 ? (
                    <p className="text-gray-500">{t('cardDetail.noAttacksOrAbilities')}</p>
                  ) : null
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weaknesses" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('cardDetail.weaknesses')}</CardTitle>
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
                    <p className="text-gray-500">{t('cardDetail.noWeaknesses')}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('cardDetail.resistances')}</CardTitle>
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
                    <p className="text-gray-500">{t('cardDetail.noResistances')}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('cardDetail.cardVariants')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {card.variants ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${card.variants.normal ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm">{t('cardDetail.normal')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${card.variants.holo ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm">{t('cardDetail.holofoil')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${card.variants.reverse ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm">{t('cardDetail.reverseHolo')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${card.variants.firstEdition ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm">{t('cardDetail.firstEdition')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${card.variants.wPromo ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm">{t('cardDetail.wPromo')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">{t('cardDetail.noVariantInfo')}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('cardDetail.detailedVariants')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {card.variants_detailed && card.variants_detailed.length > 0 ? (
                    <div className="space-y-2">
                      {card.variants_detailed.map((variant, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium capitalize">{variant.type}</span>
                          <Badge variant="outline">{variant.size}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">{t('cardDetail.noDetailedVariantInfo')}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="legalities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('cardDetail.formatLegalities')}</CardTitle>
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
                <CardTitle>{t('cardDetail.flavorTextDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {card.flavorText && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('cardDetail.flavorText')}</h3>
                    <p className="text-gray-700 italic">{card.flavorText}</p>
                  </div>
                )}
                {card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('cardDetail.pokedexNumbers')}</h3>
                    <div className="flex gap-2">
                      {card.nationalPokedexNumbers.map((num) => (
                        <Badge key={num} variant="outline">#{num}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {card.convertedRetreatCost !== undefined && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('cardDetail.retreatCost')}</h3>
                    <p>{card.convertedRetreatCost} {t('cardDetail.energy')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {selectedCard && (
        <>
          <AddToCollectionDialog
            open={showCollectionDialog}
            onOpenChange={setShowCollectionDialog}
            card={selectedCard}
          />
          <AddToWishlistDialog
            open={showWishlistDialog}
            onOpenChange={setShowWishlistDialog}
            card={selectedCard}
          />
        </>
      )}
    </div>
  );
};

export default CardDetail;
