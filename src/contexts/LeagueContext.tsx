'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface League {
  id: string;
  name: string;
  description?: string;
  format: string;
  status: string;
}

interface LeagueContextType {
  currentLeague: League | null;
  leagues: League[];
  setCurrentLeague: (league: League | null) => void;
  loading: boolean;
  error: string | null;
  refreshLeagues: () => Promise<void>;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export const useLeague = () => {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
};

interface LeagueProviderProps {
  children: ReactNode;
}

export const LeagueProvider: React.FC<LeagueProviderProps> = ({ children }) => {
  const [currentLeague, setCurrentLeagueState] = useState<League | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch('/api/leagues', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        setLeagues([]);
        setCurrentLeagueState(null);
        setError('Failed to load leagues');
        return;
      }

      const data = await response.json();
      const fetchedLeagues: League[] = data.leagues || [];
      setLeagues(fetchedLeagues);

      const savedLeagueId = typeof window !== 'undefined' ? localStorage.getItem('currentLeagueId') : null;
      if (savedLeagueId) {
        const saved = fetchedLeagues.find((l) => l.id === savedLeagueId);
        if (saved) {
          setCurrentLeagueState(saved);
          setLoading(false);
          return;
        }
      }

      if (fetchedLeagues.length > 0) {
        const mauiCommander = fetchedLeagues.find((l) => l.name === 'Maui Commander League');
        const mtgMaui = fetchedLeagues.find((l) => l.name === 'MTG Maui League');
        const preferred = mauiCommander ?? mtgMaui;
        const active = preferred ?? fetchedLeagues.find((l) => l.status === 'active') ?? fetchedLeagues[0];
        setCurrentLeagueState(active);
      } else {
        setCurrentLeagueState(null);
      }
    } catch (err) {
      logger.error('Error fetching leagues', err);
      setLeagues([]);
      setCurrentLeagueState(null);
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg.includes('abort') || msg.includes('AbortError')
          ? 'Request timed out. Check DATABASE_URL in .env and that Postgres is running.'
          : 'Failed to load leagues'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const setCurrentLeague = useCallback((league: League | null) => {
    setCurrentLeagueState(league);
    if (typeof window === 'undefined') return;
    if (league) localStorage.setItem('currentLeagueId', league.id);
    else localStorage.removeItem('currentLeagueId');
  }, []);

  const refreshLeagues = useCallback(async () => {
    await fetchLeagues();
  }, [fetchLeagues]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const value: LeagueContextType = {
    currentLeague,
    leagues,
    setCurrentLeague,
    loading,
    error,
    refreshLeagues,
  };

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
};
