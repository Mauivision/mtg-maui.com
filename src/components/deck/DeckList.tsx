'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Deck } from '@/types/mtg';

interface DeckListProps {
  decks?: Deck[];
  loading?: boolean;
  onDeckSelect?: (deck: Deck) => void;
  onCreateDeck?: () => void;
  showUserDecks?: boolean;
  currentUserId?: string;
}

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getFormatColor = (format: string) => {
  switch (format.toLowerCase()) {
    case 'standard':
      return 'bg-blue-100 text-blue-800';
    case 'modern':
      return 'bg-green-100 text-green-800';
    case 'commander':
      return 'bg-purple-100 text-purple-800';
    case 'legacy':
      return 'bg-orange-100 text-orange-800';
    case 'vintage':
      return 'bg-red-100 text-red-800';
    case 'pioneer':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const DeckList: React.FC<DeckListProps> = ({
  decks = [],
  loading = false,
  onDeckSelect,
  onCreateDeck,
  showUserDecks = true,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('');

  // Filter decks based on search and format
  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = !formatFilter || deck.format === formatFilter;
    const matchesUser = !showUserDecks || deck.userId === currentUserId;

    return matchesSearch && matchesFormat && matchesUser;
  });

  const uniqueFormats = Array.from(new Set(decks.map(deck => deck.format)));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{showUserDecks ? 'My Decks' : 'All Decks'}</h2>
        <div className="flex gap-2">
          {onCreateDeck && <Button onClick={onCreateDeck}>Create New Deck</Button>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search decks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Formats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Formats</SelectItem>
            {uniqueFormats.map(format => (
              <SelectItem key={format} value={format}>
                {format}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredDecks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {decks.length === 0 ? 'No decks found' : 'No decks match your filters'}
            </p>
            {onCreateDeck && <Button onClick={onCreateDeck}>Create Your First Deck</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map(deck => (
            <Card
              key={deck.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onDeckSelect?.(deck)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate">{deck.name}</CardTitle>
                  <Badge className={getFormatColor(deck.format)}>{deck.format}</Badge>
                </div>
                <CardDescription>
                  {deck.cards?.length || 0} cards • Updated {formatDate(deck.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deck.user?.name && (
                    <div className="text-sm text-muted-foreground">Created by {deck.user.name}</div>
                  )}
                  {deck.cards && deck.cards.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Main Deck:</span> {deck.cards.length} cards
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
