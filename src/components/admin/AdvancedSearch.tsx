'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaCalendar,
  FaUsers,
  FaTrophy,
  FaSort,
  FaDownload,
  FaEye,
} from 'react-icons/fa';
import { format } from 'date-fns';

interface SearchFilter {
  type: 'players' | 'events' | 'games';
  query: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  metadata: Record<string, any>;
  lastModified: string;
  status?: string;
}

interface AdvancedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onResultSelect }) => {
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'players',
    query: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchTypes = [
    { value: 'players', label: 'Players', icon: FaUsers },
    { value: 'events', label: 'Events', icon: FaCalendar },
    { value: 'games', label: 'Games', icon: FaTrophy },
  ];

  const sortOptions = {
    players: [
      { value: 'name', label: 'Name' },
      { value: 'points', label: 'Points' },
      { value: 'gamesPlayed', label: 'Games Played' },
      { value: 'lastActive', label: 'Last Active' },
    ],
    events: [
      { value: 'title', label: 'Title' },
      { value: 'date', label: 'Date' },
      { value: 'participants', label: 'Participants' },
      { value: 'status', label: 'Status' },
    ],
    games: [
      { value: 'gameType', label: 'Game Type' },
      { value: 'date', label: 'Date' },
      { value: 'participants', label: 'Participants' },
      { value: 'status', label: 'Status' },
    ],
  };

  const statusOptions = {
    players: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
    events: [
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'ongoing', label: 'Ongoing' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
    games: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ],
  };

  const performSearch = async () => {
    if (!filters.query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filters.type,
        query: filters.query,
        sortBy: filters.sortBy || 'name',
        sortOrder: filters.sortOrder || 'asc',
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/admin/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const csvContent = [
      ['Type', 'Title', 'Subtitle', 'Status', 'Last Modified'],
      ...results.map(result => [
        result.type,
        result.title,
        result.subtitle || '',
        result.status || '',
        result.lastModified,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${filters.type}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const clearFilters = () => {
    setFilters({
      type: 'players',
      query: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Advanced Search</h2>
          <p className="text-gray-400">
            Search and filter players, events, and games with advanced criteria
          </p>
        </div>
      </div>

      {/* Search Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Type</label>
              <div className="flex gap-2">
                {searchTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={filters.type === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setFilters({
                        ...filters,
                        type: type.value as any,
                        sortBy: sortOptions[type.value as keyof typeof sortOptions][0].value,
                      })
                    }
                    className={
                      filters.type === type.value
                        ? 'bg-amber-600'
                        : 'border-amber-400 text-amber-400'
                    }
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search Query */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Query</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={`Search ${filters.type}...`}
                    value={filters.query}
                    onChange={e => setFilters({ ...filters, query: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && performSearch()}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="border-slate-600"
                >
                  <FaFilter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button onClick={performSearch} disabled={!filters.query.trim()}>
                  <FaSearch className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date From</label>
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date To</label>
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  >
                    <option value="">All Statuses</option>
                    {statusOptions[filters.type as keyof typeof statusOptions].map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
                  <div className="flex gap-1">
                    <select
                      value={filters.sortBy || ''}
                      onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                    >
                      {sortOptions[filters.type as keyof typeof sortOptions].map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                        })
                      }
                      className="border-slate-500"
                    >
                      <FaSort
                        className={`w-4 h-4 ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Search Results ({results.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <FaDownload className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <FaTimes className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map(result => (
                <div
                  key={result.id}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-all"
                  onClick={() => onResultSelect?.(result)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-medium">{result.title}</h3>
                      {result.subtitle && (
                        <p className="text-gray-400 text-sm">{result.subtitle}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase">{result.type}</span>
                      {result.status && (
                        <div className="mt-1">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              result.status === 'active' || result.status === 'completed'
                                ? 'bg-green-600'
                                : result.status === 'inactive' || result.status === 'cancelled'
                                  ? 'bg-red-600'
                                  : 'bg-blue-600'
                            }`}
                          >
                            {result.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <div className="flex gap-4">
                      {Object.entries(result.metadata)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <span key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </span>
                        ))}
                    </div>
                    <span>
                      Last modified: {format(new Date(result.lastModified), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filters.query && results.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <FaSearch className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No results found for &quot;{filters.query}&quot;</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
