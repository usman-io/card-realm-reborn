
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { backendApi } from '@/services/api';
import { Wishlist } from '@/types/api';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Wishlist[];
}

const UserWishlist = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWishlist = async (page = 1) => {
    if (!token) return;

    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
      };

      const response: PaginatedResponse = await backendApi.getUserWishlistCards(token, params);
      
      setWishlist(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / 20)); // 20 items per page
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist(currentPage);
  }, [token, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteWishlist = async (id: number) => {
    if (!token) return;
    
    try {
      await backendApi.deleteWishlistItem(token, id);
      setWishlist(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            Back to Dashboard
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          My Wishlist
        </h1>
        <p className="text-gray-600 mt-2">
          Cards you want to add to your collection ({totalCount} total)
        </p>
      </div>

      {/* Wishlist Cards */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wishlist Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {wishlist.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Your wishlist is empty.</p>
              <p className="text-sm mt-2">Add cards to your wishlist while browsing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-lg">Card ID: {item.card_id}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority} Priority
                      </Badge>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        Note: {item.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Added: {new Date(item.added_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWishlist(item.id)}
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

export default UserWishlist;
