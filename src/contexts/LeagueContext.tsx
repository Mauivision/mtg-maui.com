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

      // Try to fetch leagues from API
      const response = await fetch('/api/leagues');

      if (response.ok) {
        const data = await response.json();
        const fetchedLeagues = data.leagues || [];
        setLeagues(fetchedLeagues);

        // If no current league is set, use the first active league or create a default
        if (!currentLeague && fetchedLeagues.length > 0) {
          const activeLeague =
            fetchedLeagues.find((l: League) => l.status === 'active') || fetchedLeagues[0];
          setCurrentLeagueState(activeLeague);
        }
      } else {
        // If no leagues exist, create a default one
        await createDefaultLeague();
      }
    } catch (err) {
      logger.error('Error fetching leagues', err);
      // Try to create default league on error
      await createDefaultLeague();
    } finally {
      setLoading(false);
    }
  }, [currentLeague]);

  const createDefaultLeague = async () => {
    try {
      const defaultLeague: League = {
        id: 'default-league',
        name: 'MTG Maui League',
        description: 'Default league for MTG Maui',
        format: 'commander',
        status: 'active',
      };

      // Try to create via API, but if it fails, just use the default locally
      try {
        const response = await fetch('/api/leagues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultLeague),
        });

        if (response.ok) {
          const data = await response.json();
          setLeagues([data.league]);
          setCurrentLeagueState(data.league);
        } else {
          // Use default locally if API fails
          setLeagues([defaultLeague]);
          setCurrentLeagueState(defaultLeague);
        }
      } catch {
        // Use default locally if API fails
        setLeagues([defaultLeague]);
        setCurrentLeagueState(defaultLeague);
      }
    } catch (err) {
      logger.error('Error creating default league', err);
      setError('Failed to initialize league');
    }
  };

  const setCurrentLeague = (league: League | null) => {
    setCurrentLeagueState(league);
    // Persist to localStorage
    if (league) {
      localStorage.setItem('currentLeagueId', league.id);
    } else {
      localStorage.removeItem('currentLeagueId');
    }
  };

  const refreshLeagues = async () => {
    await fetchLeagues();
  };

  useEffect(() => {
    // Check localStorage for saved league
    const savedLeagueId = localStorage.getItem('currentLeagueId');

    if (savedLeagueId) {
      // Try to find saved league in fetched leagues
      const savedLeague = leagues.find(l => l.id === savedLeagueId);
      if (savedLeague) {
        setCurrentLeagueState(savedLeague);
      }
    }

    fetchLeagues();
  }, [leagues, fetchLeagues]);

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
