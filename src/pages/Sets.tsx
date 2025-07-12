import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { pokemonApi } from '@/services/api';
import { PokemonSet } from '@/types/api';
import { Search, Calendar, Package, List } from 'lucide-react';

const Sets = () => {
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSets, setFilteredSets] = useState<PokemonSet[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [collectionStatus, setCollectionStatus] = useState('all');
  const [sortBy, setSortBy] = useState('series');
  const [sortOrder, setSortOrder] = useState('new-to-old');
  const [showLogos, setShowLogos] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState('all');

  // Get unique series from sets
  const [seriesList, setSeriesList] = useState<string[]>([]);

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await pokemonApi.getSets({ 
          orderBy: '-releaseDate',
          page: page.toString(),
          pageSize: '100' // Fetch more sets for local filtering
        });
        setSets(response.data);
        setFilteredSets(response.data);
        
        // Extract unique series with proper Set typing
        const seriesSet = new Set<string>(response.data.map((set: PokemonSet) => set.series));
        const uniqueSeries = Array.from(seriesSet);
        setSeriesList(uniqueSeries);
      } catch (error) {
        console.error('Error fetching sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  useEffect(() => {
    let filtered = sets;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(set =>
        set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.series.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by series
    if (selectedSeries !== 'all') {
      filtered = filtered.filter(set => set.series === selectedSeries);
    }

    // Filter by collection status (mock implementation)
    if (collectionStatus === 'in-progress') {
      // Mock: show random subset as "in progress"
      filtered = filtered.filter((_, index) => index % 3 === 0);
    } else if (collectionStatus === 'completed') {
      // Mock: show random subset as "completed"
      filtered = filtered.filter((_, index) => index % 4 === 0);
    }

    // Sort the filtered sets
    filtered.sort((a, b) => {
      if (sortBy === 'series') {
        const seriesCompare = a.series.localeCompare(b.series);
        return sortOrder === 'new-to-old' ? -seriesCompare : seriesCompare;
      } else if (sortBy === 'date') {
        const dateA = new Date(a.releaseDate).getTime();
        const dateB = new Date(b.releaseDate).getTime();
        return sortOrder === 'new-to-old' ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });

    // Apply pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSets = filtered.slice(startIndex, endIndex);
    
    setFilteredSets(paginatedSets);
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchQuery, sets, collectionStatus, sortBy, sortOrder, selectedSeries, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pokémon TCG Sets</h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-4 mb-6">
          <ToggleGroup type="single" value={collectionStatus} onValueChange={setCollectionStatus}>
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="in-progress">In progress</ToggleGroupItem>
            <ToggleGroupItem value="completed">Completed</ToggleGroupItem>
          </ToggleGroup>
          
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">Show sets as</span>
            <Select value={showLogos ? 'logos' : 'text'} onValueChange={(value) => setShowLogos(value === 'logos')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logos">Any card variant</SelectItem>
                <SelectItem value="text">Text only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {totalCount} sets found {totalCount > itemsPerPage && `(showing ${Math.min(itemsPerPage, filteredSets.length)} per page)`}
          </p>
        </div>

        {/* Sort and Display Options */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="series">Series</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">From</span>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-to-old">New to old</SelectItem>
                <SelectItem value="old-to-new">Old to new</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Select value={showLogos ? 'logos' : 'text'} onValueChange={(value) => setShowLogos(value === 'logos')}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logos">Logos</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Series Filter Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter by series:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedSeries === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeries('all')}
            >
              All Series
            </Button>
            {seriesList.slice(0, 8).map((series) => (
              <Button
                key={series}
                variant={selectedSeries === series ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeries(series)}
              >
                {series}
              </Button>
            ))}
          </div>
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
                {showLogos && set.images?.logo && (
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

      {filteredSets.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No sets found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Sets;
