
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { backendApi } from '@/services/api';
import { ArrowLeft, Search, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Activity {
  id: string;
  type: string;
  card_id: string;
  date: string;
  message: string;
  quantity?: number;
  variant?: string;
  condition?: string;
  priority?: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Activity[];
}

const Activities = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchActivities = async (page = 1, search = '') => {
    if (!token) return;

    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response: PaginatedResponse = await backendApi.getUserActivities(token, params);
      
      setActivities(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / 20)); // 20 items per page
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(currentPage, searchQuery);
  }, [token, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchActivities(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'collection_add':
        return 'bg-green-500';
      case 'wishlist_add':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading && activities.length === 0) {
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
          <Clock className="h-8 w-8 text-orange-500" />
          Activity History
        </h1>
        <p className="text-gray-600 mt-2">
          Track all your collection and wishlist activities
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search activities by card ID or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          {searchQuery ? (
            <>Showing {activities.length} of {totalCount} activities matching "{searchQuery}"</>
          ) : (
            <>Showing {activities.length} of {totalCount} total activities</>
          )}
        </p>
      </div>

      {/* Activities List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? (
                <>
                  <p>No activities found matching your search.</p>
                  <p className="text-sm mt-2">Try adjusting your search terms.</p>
                </>
              ) : (
                <>
                  <p>No activities yet.</p>
                  <p className="text-sm mt-2">Start adding cards to see activity here!</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getActivityTypeColor(activity.type)}`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Card: {activity.card_id}
                      </Badge>
                      {activity.quantity && (
                        <Badge variant="outline" className="text-xs">
                          Qty: {activity.quantity}
                        </Badge>
                      )}
                      {activity.condition && (
                        <Badge variant="outline" className="text-xs">
                          {activity.condition}
                        </Badge>
                      )}
                      {activity.variant && (
                        <Badge variant="outline" className="text-xs">
                          {activity.variant}
                        </Badge>
                      )}
                      {activity.priority && (
                        <Badge variant="outline" className="text-xs">
                          Priority: {activity.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                    </p>
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

export default Activities;
