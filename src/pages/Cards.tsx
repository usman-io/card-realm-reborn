import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { pokemonApi } from '@/services/api';
import { PokemonCard, PokemonSet } from '@/types/api';
import { Search, Grid, List, Heart, Plus, Filter, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AddToCollectionDialog from '@/components/AddToCollectionDialog';
import AddToWishlistDialog from '@/components/AddToWishlistDialog';

const Cards = () => {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const { isAuthenticated } = useAuth();

  const types = ['Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water'];
  const rarities = ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX', 'Rare Holo GX', 'Rare Holo V', 'Rare Holo VMAX', 'Rare Rainbow', 'Rare Secret', 'Rare Shiny', 'Rare Shiny GX', 'Rare Ultra'];
  const subtypes = ['Basic', 'Stage 1', 'Stage 2', 'EX', 'GX', 'V', 'VMAX', 'VSTAR', 'ex', 'Supporter', 'Item', 'Stadium', 'Tool', 'Special Energy'];

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const response = await pokemonApi.getSets({ orderBy: '-releaseDate', pageSize: '100' });
      setSets(response.data || []);
    } catch (error) {
      console.error('Error fetching sets:', error);
    }
  };

  const fetchCards = async (query: string = '', pageNum: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pageNum.toString(),
        pageSize: '30',
        orderBy: sortBy,
      };

      // Build query string
      const queryParts: string[] = [];
      
      if (query.trim()) {
        queryParts.push(`name:${query}*`);
      }

      if (selectedSets.length > 0) {
        queryParts.push(`set.id:"${selectedSets.join('" OR set.id:"')}"`);
      }

      if (selectedTypes.length > 0) {
        queryParts.push(`types:"${selectedTypes.join('" OR types:"')}"`);
      }

      if (selectedRarities.length > 0) {
        queryParts.push(`rarity:"${selectedRarities.join('" OR rarity:"')}"`);
      }

      if (selectedSubtypes.length > 0) {
        queryParts.push(`subtypes:"${selectedSubtypes.join('" OR subtypes:"')}"`);
      }

      if (queryParts.length > 0) {
        params.q = queryParts.join(' AND ');
      }

      const response = await pokemonApi.getCards(params);
      setCards(response.data || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(Math.ceil((response.totalCount || 0) / 30));
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(searchQuery, page);
  }, [sortBy, page, selectedSets, selectedTypes, selectedRarities, selectedSubtypes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCards(searchQuery, 1);
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    const setters = {
      sets: setSelectedSets,
      types: setSelectedTypes,
      rarities: setSelectedRarities,
      subtypes: setSelectedSubtypes,
    };

    const setter = setters[filterType as keyof typeof setters];
    if (setter) {
      setter(prev => 
        checked 
          ? [...prev, value]
          : prev.filter(item => item !== value)
      );
    }
  };

  const clearFilters = () => {
    setSelectedSets([]);
    setSelectedTypes([]);
    setSelectedRarities([]);
    setSelectedSubtypes([]);
  };

  const activeFiltersCount = selectedSets.length + selectedTypes.length + selectedRarities.length + selectedSubtypes.length;

  const addToCollection = (card: PokemonCard) => {
    setSelectedCard(card);
    setShowCollectionDialog(true);
  };

  const addToWishlist = (card: PokemonCard) => {
    setSelectedCard(card);
    setShowWishlistDialog(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchCards(searchQuery, newPage);
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
        
        {/* Search and Controls */}
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
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="-name">Name (Z-A)</SelectItem>
                <SelectItem value="-releaseDate">Release Date (New)</SelectItem>
                <SelectItem value="releaseDate">Release Date (Old)</SelectItem>
                <SelectItem value="number">Number (Low-High)</SelectItem>
                <SelectItem value="-number">Number (High-Low)</SelectItem>
                <SelectItem value="hp">HP (Low-High)</SelectItem>
                <SelectItem value="-hp">HP (High-Low)</SelectItem>
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

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sets Filter */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left font-medium">
                    Sets ({selectedSets.length})
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="max-h-48 overflow-y-auto space-y-2">
                    {sets.slice(0, 20).map((set) => (
                      <div key={set.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`set-${set.id}`}
                          checked={selectedSets.includes(set.id)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('sets', set.id, checked as boolean)
                          }
                        />
                        <label htmlFor={`set-${set.id}`} className="text-sm">
                          {set.name}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Types Filter */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left font-medium">
                    Types ({selectedTypes.length})
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {types.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('types', type, checked as boolean)
                          }
                        />
                        <label htmlFor={`type-${type}`} className="text-sm">
                          {type}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Rarities Filter */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left font-medium">
                    Rarities ({selectedRarities.length})
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="max-h-48 overflow-y-auto space-y-2">
                    {rarities.map((rarity) => (
                      <div key={rarity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rarity-${rarity}`}
                          checked={selectedRarities.includes(rarity)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('rarities', rarity, checked as boolean)
                          }
                        />
                        <label htmlFor={`rarity-${rarity}`} className="text-sm">
                          {rarity}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Subtypes Filter */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left font-medium">
                    Subtypes ({selectedSubtypes.length})
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {subtypes.map((subtype) => (
                      <div key={subtype} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subtype-${subtype}`}
                          checked={selectedSubtypes.includes(subtype)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('subtypes', subtype, checked as boolean)
                          }
                        />
                        <label htmlFor={`subtype-${subtype}`} className="text-sm">
                          {subtype}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {totalCount} cards found {totalCount > 30 && `(showing ${Math.min(30, cards.length)} per page)`}
          </p>
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
                        onClick={() => addToCollection(card)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => addToWishlist(card)}
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
                        onClick={() => addToCollection(card)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Collect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToWishlist(card)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(page - 1)} />
                </PaginationItem>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={page === pageNum}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

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

export default Cards;
