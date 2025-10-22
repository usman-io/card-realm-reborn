
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { backendApi } from '@/services/api';
import { Collection } from '@/types/api';
import { ArrowLeft, Award, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Collection[];
}

const UserGradedCards = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [gradedCards, setGradedCards] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchGradedCards = async (page = 1) => {
    if (!token) return;

    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
      };

      const response: PaginatedResponse = await backendApi.getUserGradedCards(token, params);
      
      setGradedCards(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / 20)); // 20 items per page
    } catch (error) {
      console.error('Error fetching graded cards:', error);
      setGradedCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradedCards(currentPage);
  }, [token, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCollection = async (id: number) => {
    if (!token) return;
    
    try {
      await backendApi.deleteCollectionItem(token, id);
      setGradedCards(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting collection item:', error);
    }
  };

  if (loading && gradedCards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-8 w-8 text-yellow-500" />
          {t('gradedCards.title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('gradedCards.title')} ({totalCount} {t('dashboard.totalCards').toLowerCase()})
        </p>
      </div>

      {/* Graded Cards */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('gradedCards.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {gradedCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>{t('gradedCards.noGradedCards')}</p>
              <p className="text-sm mt-2">{t('gradedCards.startGrading')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gradedCards.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">Card ID: {item.card_id}</p>
                      <Badge variant="default" className="bg-yellow-500">
                        <Award className="h-3 w-3 mr-1" />
                        Graded
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">{t('collection.quantity')}: {item.quantity}</Badge>
                      <Badge variant="outline">{item.condition}</Badge>
                      <Badge variant="outline">{item.variant}</Badge>
                      <Badge variant="outline">{item.language}</Badge>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        Note: {item.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Added: {new Date(item.added_date).toLocaleDateString()} | 
                      Updated: {new Date(item.updated_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCollection(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                  />
                </PaginationItem>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 
                  ? i + 1 
                  : currentPage >= totalPages - 2 
                    ? totalPages - 4 + i 
                    : currentPage - 2 + i;
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default UserGradedCards;
