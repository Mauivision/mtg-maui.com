'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CharacterSheetPlayer {
  id: string;
  playerName: string;
  commander?: string;
  rank: number;
  level: number;
  totalPoints: number;
  gamesPlayed: number;
  wins?: number;
}

export interface UseCharacterSheetsResult {
  players: CharacterSheetPlayer[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useCharacterSheets(leagueId: string | null): UseCharacterSheetsResult {
  const [players, setPlayers] = useState<CharacterSheetPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSheets = useCallback(async () => {
    if (!leagueId) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/leagues/${leagueId}/character-sheets`);
      if (r.ok) {
        const d = await r.json();
        setPlayers(d.players ?? []);
      } else {
        setPlayers([]);
      }
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  return { players, loading, refresh: fetchSheets };
}
