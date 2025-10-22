
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { pokemonApi } from '@/services/api';
import { PokemonSet, PokemonCard } from '@/types/api';
import { ArrowLeft, Calendar, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [set, setSet] = useState<PokemonSet | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchSetData = async () => {
      if (!id) return;

      try {
        const setResponse = await pokemonApi.getSet(id, i18n.language);
        setSet(setResponse.data);
      } catch (error) {
        console.error('Error fetching set data:', error);
      }
    };

    fetchSetData();
  }, [id]);

  useEffect(() => {
    const fetchCards = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const params: Record<string, string> = {
          q: `set.id:${id}`,
          orderBy: 'number',
          page: page.toString(),
          pageSize: '30'
        };

        const cardsResponse = await pokemonApi.getCards(params, i18n.language);
        setCards(cardsResponse.data || []);
        setTotalCount(cardsResponse.totalCount || 0);
        setTotalPages(Math.ceil((cardsResponse.totalCount || 0) / 30));
      } catch (error) {
        console.error('Error fetching cards:', error);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [id, page, i18n.language]);

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
            <Button>{t('setDetail.backToSets')}</Button>
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
        {t('setDetail.backToSets')}
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
                <Badge variant="outline">{t('setDetail.code')}: {set.ptcgoCode}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Cards in this Set ({totalCount})
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

      {cards.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No cards found in this set.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={page === 1}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setPage(pageNumber)}
                      isActive={page === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setPage(totalPages)}
                      isActive={page === totalPages}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
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
    </div>
  );
};

export default SetDetail;
