import { useState, useEffect, useCallback } from 'react';
import { LeagueDeck } from '@/types/league';
import { Deck } from '@/types/mtg';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

export function useLeagueDecks(leagueId?: string) {
  const [leagueDecks, setLeagueDecks] = useState<LeagueDeck[]>([]);
  const [userDecks, setUserDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDecks = useCallback(async () => {
    try {
      const response = await fetch('/api/decks');
      if (response.ok) {
        const decks = await response.json();
        setUserDecks(decks || []);
      }
    } catch (err) {
      logger.error('Error fetching user decks', err);
    }
  }, []);

  const fetchLeagueDecks = useCallback(async () => {
    if (!leagueId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/leagues/decks?leagueId=${leagueId}`);
      if (response.ok) {
        const data = await response.json();
        setLeagueDecks(data.decks || []);
      } else {
        throw new Error('Failed to fetch league decks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch league decks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  const registerDeck = useCallback(
    async (deck: Deck, leagueId: string, membershipId?: string) => {
      try {
        const { convertDeckToLeagueDeck } = await import('@/lib/league-deck-utils');
        const leagueDeckData = convertDeckToLeagueDeck(deck, leagueId, membershipId || '');

        const response = await fetch('/api/leagues/decks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leagueDeckData),
        });

        if (response.ok) {
          toast.success('Deck registered successfully!');
          await fetchLeagueDecks();
          return true;
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Failed to register deck');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to register deck';
        toast.error(errorMessage);
        return false;
      }
    },
    [fetchLeagueDecks]
  );

  useEffect(() => {
    fetchUserDecks();
  }, [fetchUserDecks]);

  useEffect(() => {
    fetchLeagueDecks();
  }, [fetchLeagueDecks]);

  return {
    leagueDecks,
    userDecks,
    loading,
    error,
    refetch: fetchLeagueDecks,
    registerDeck,
  };
}
