import { useState, useEffect, useCallback } from 'react';
import type { WizardPlayer, WizardGame } from '@/types/wizards';

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useWizardsData(leagueId: string) {
  const [players, setPlayers] = useState<WizardPlayer[]>([]);
  const [games, setGames] = useState<WizardGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, CacheEntry>>({});

  const cachedFetch = useCallback(async (url: string, options?: RequestInit) => {
    const cacheKey = `${url}${JSON.stringify(options)}`;
    const now = Date.now();

    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    const response = await fetch(url, options);
    const data = await response.json();

    setCache(prev => ({
      ...prev,
      [cacheKey]: { data, timestamp: now },
    }));

    return data;
  }, [cache]);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cachedFetch(`/api/admin/players?leagueId=${leagueId}`);
      setPlayers(data.players || []);
    } catch (err) {
      console.error('Error fetching players:', err);
      setPlayers([]);
      if (err instanceof Error && !err.message.includes('404')) {
        setError('Failed to fetch players. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [leagueId, cachedFetch]);

  const fetchGames = useCallback(async (gameType?: string) => {
    try {
      setLoading(true);
      setError(null);
      const gameTypeParam = gameType && gameType !== 'all' ? `&gameType=${gameType}` : '';
      const response = await fetch(`/api/admin/games?leagueId=${leagueId}${gameTypeParam}`);

      if (!response.ok) {
        if (response.status === 404) {
          setGames([]);
          return;
        }
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }

      const data = await response.json();
      setGames(data.games || []);
    } catch (err) {
      console.error('Error fetching games:', err);
      setGames([]);
      if (err instanceof Error && !err.message.includes('404')) {
        setError('Failed to fetch games. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  return {
    players,
    games,
    loading,
    error,
    fetchPlayers,
    fetchGames,
    setPlayers,
    setGames,
  };
}
