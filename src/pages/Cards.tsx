import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { pokemonApi } from '@/services/api';
import { PokemonCard } from '@/types/api';
import { Search, Grid, List, Heart, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import AddToCollectionDialog from '@/components/AddToCollectionDialog';
import AddToWishlistDialog from '@/components/AddToWishlistDialog';


const Cards = () => {
  const { t, i18n } = useTranslation();
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  const fetchCards = async (query: string = '', pageNum: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: pageNum.toString(),
        pageSize: pageSize.toString(),
        orderBy: sortBy,
      };

      if (query.trim()) {
        params.q = `name:${query}*`;
      }

      const response = await pokemonApi.getCards(params, i18n.language);
      setCards(response.data || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(Math.ceil((response.totalCount || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(searchQuery, page);
  }, [searchQuery, sortBy, page, i18n.language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCards(searchQuery, 1);
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };



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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    // Reduce visible pages on mobile
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    let startPage = Math.max(1, Math.min(page - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages + 1));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={1 === page}
            className="cursor-pointer"
            aria-label={`${t('pagination.firstPage')}, ${t('pagination.page')} 1`}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis aria-label={t('pagination.ellipsis')} />
          </PaginationItem>
        );
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === page}
            className="cursor-pointer"
            aria-label={`${t('pagination.page')} ${i} ${t('pagination.of')} ${totalPages}`}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis aria-label={t('pagination.ellipsis')} />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={totalPages === page}
            className="cursor-pointer"
            aria-label={`${t('pagination.lastPage')}, ${t('pagination.page')} ${totalPages}`}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('cards.pokemonCards')}</h1>
        
        {/* Search and Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('cards.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('cards.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('cards.nameAZ')}</SelectItem>
                <SelectItem value="-name">{t('cards.nameZA')}</SelectItem>
                <SelectItem value="-releaseDate">{t('cards.releaseDateNew')}</SelectItem>
                <SelectItem value="releaseDate">{t('cards.releaseDateOld')}</SelectItem>
                <SelectItem value="number">{t('cards.numberLowHigh')}</SelectItem>
                <SelectItem value="-number">{t('cards.numberHighLow')}</SelectItem>
                <SelectItem value="hp">{t('cards.hpLowHigh')}</SelectItem>
                <SelectItem value="-hp">{t('cards.hpHighLow')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md w-full sm:w-auto justify-center">
              <Button
                variant={displayMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('grid')}
                className="flex-1 sm:flex-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('list')}
                className="flex-1 sm:flex-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>



        {/* Results count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {totalCount} {t('cards.cardsFound')} • {t('cards.page')} {page} {t('cards.of')} {totalPages}
          </p>
        </div>
      </div>

      {/* Cards Display */}
      {displayMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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
                  <h3 className="font-medium text-sm truncate hover:text-primary">
                    {card.name}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground truncate">{card.set.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {card.rarity}
                  </Badge>
                  {isAuthenticated && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-primary/10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCollection(card);
                        }}
                        title={t('cards.addToCollection')}
                      >
                        <Plus className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-red-100"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToWishlist(card);
                        }}
                        title={t('cards.addToWishlist')}
                      >
                        <Heart className="h-4 w-4 text-red-500" />
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
                      <h3 className="font-medium hover:text-primary">{card.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{card.set.name}</p>
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCollection(card);
                        }}
                        className="hover:bg-primary/10"
                      >
                        <Plus className="h-4 w-4 mr-1 text-primary" />
                        {t('cards.collect')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToWishlist(card);
                        }}
                        className="hover:bg-red-50"
                      >
                        <Heart className="h-4 w-4 mr-1 text-red-500" />
                        {t('cards.wishlist')}
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
          <p className="text-gray-500 text-lg">{t('cards.noCardsFound')}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent className="flex-wrap justify-center gap-1 sm:gap-0">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={page === 1}
                />
              </PaginationItem>

              <div className="hidden sm:flex">
                {renderPaginationItems()}
              </div>

              {/* Mobile pagination - show current page and total */}
              <div className="flex sm:hidden items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
            <div className="text-center text-sm text-muted-foreground mt-2">
              {t('pagination.page')} {page} {t('pagination.of')} {totalPages}
            </div>
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
