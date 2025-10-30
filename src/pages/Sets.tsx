import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { pokemonApi } from '@/services/api';
import { PokemonSet } from '@/types/api';
import { Search, Calendar, Package, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sets = () => {
  const { t, i18n } = useTranslation();
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Get unique series from sets
  const [seriesList, setSeriesList] = useState<string[]>([]);

  // Language options for the filter with translated names
  const languageOptions = [
    { value: 'en', label: t('languages.en', { defaultValue: 'English' }) },
    { value: 'ja', label: t('languages.ja', { defaultValue: 'Japanese' }) },
    { value: 'zh', label: t('languages.zh', { defaultValue: 'Chinese' }) },
    { value: 'fr', label: t('languages.fr', { defaultValue: 'French' }) },
    { value: 'es', label: t('languages.es', { defaultValue: 'Spanish' }) },
    { value: 'de', label: t('languages.de', { defaultValue: 'German' }) },
  ];

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await pokemonApi.getSets({
          orderBy: '-releaseDate',
          page: page.toString(),
          pageSize: '30'
        }, selectedLanguage);
        setSets(response.data);
        setTotalCount(response.totalCount || response.data.length);
        setTotalPages(Math.ceil((response.totalCount || response.data.length) / 30));

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
  }, [page, selectedLanguage]);

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

    setFilteredSets(filtered);
  }, [searchQuery, sets, collectionStatus, sortBy, sortOrder, selectedSeries]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('en');
    setCollectionStatus('all');
    setSortBy('series');
    setSortOrder('new-to-old');
    setShowLogos(true);
    setSelectedSeries('all');
    setPage(1);
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('sets.title')}</h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('sets.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <ToggleGroup type="single" value={collectionStatus} onValueChange={setCollectionStatus}>
            <ToggleGroupItem value="all">{t('sets.all')}</ToggleGroupItem>
            <ToggleGroupItem value="in-progress">{t('sets.inProgress')}</ToggleGroupItem>
            <ToggleGroupItem value="completed">{t('sets.completed')}</ToggleGroupItem>
          </ToggleGroup>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">{t('sets.showSetsAs')}</span>
            <Select value={showLogos ? 'logos' : 'text'} onValueChange={(value) => setShowLogos(value === 'logos')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logos">{t('sets.anyCardVariant')}</SelectItem>
                <SelectItem value="text">{t('sets.textOnly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <p className="text-gray-600">
            {totalCount} {t('sets.title').toLowerCase()} • {t('pagination.page')} {page} {t('pagination.of')} {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="self-start sm:self-auto"
          >
            {t('common.clearFilters')}
          </Button>
        </div>

        {/* Sort and Display Options */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">{t('common.selectLanguage')}</span>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">{t('sets.sortBy')}</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="series">{t('sets.series')}</SelectItem>
                <SelectItem value="date">{t('sets.date')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">{t('sets.from')}</span>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-to-old">{t('sets.newToOld')}</SelectItem>
                <SelectItem value="old-to-new">{t('sets.oldToNew')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">{t('sets.show')}</span>
            <Select value={showLogos ? 'logos' : 'text'} onValueChange={(value) => setShowLogos(value === 'logos')}>
              <SelectTrigger className="w-full sm:w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logos">{t('sets.logos')}</SelectItem>
                <SelectItem value="text">{t('sets.text')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Series Filter Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{t('sets.filterBySeries')}</span>
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedSeries === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeries('all')}
              className="whitespace-nowrap flex-shrink-0"
            >
              {t('sets.allSeries')}
            </Button>
            {seriesList.slice(0, 8).map((series) => (
              <Button
                key={series}
                variant={selectedSeries === series ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeries(series)}
                className="whitespace-nowrap flex-shrink-0"
              >
                {series}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredSets.map((set) => (
          <Link key={`${set.id}-${selectedLanguage}`} to={`/sets/${set.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
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
                      {t('sets.totalCards')}
                    </span>
                    <span className="font-medium">{set.total}</span>
                  </div>
                  {set.ptcgoCode && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('sets.code')}</span>
                      <Badge variant="outline" className="text-xs">
                        {set.ptcgoCode}
                      </Badge>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  {t('sets.viewSet')}
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
              {t('pagination.page', { page })} {t('pagination.of')} {totalPages}
            </div>
          </Pagination>
        </div>
      )}

      {filteredSets.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('sets.noSets')}</p>
        </div>
      )}
    </div>
  );
};

export default Sets;
