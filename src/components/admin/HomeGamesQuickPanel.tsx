'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaDice, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface AdminGameRow {
  id: string;
  date: string;
  gameType: string;
  players: string[] | string;
  placements: Array<{ playerId?: string; points?: number }> | string;
  notes?: string | null;
}

function parsePlayers(raw: AdminGameRow['players']): string[] {
  if (Array.isArray(raw)) return raw;
  try {
    const p = JSON.parse(raw || '[]');
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function parsePlacements(raw: AdminGameRow['placements']): Array<{ points?: number }> {
  if (Array.isArray(raw)) return raw;
  try {
    const p = JSON.parse(raw || '[]');
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function sumPoints(placements: Array<{ points?: number }>): number {
  return placements.reduce((s, pl) => s + (typeof pl.points === 'number' ? pl.points : 0), 0);
}

interface HomeGamesQuickPanelProps {
  leagueId: string | null;
}

export function HomeGamesQuickPanel({ leagueId }: HomeGamesQuickPanelProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState<AdminGameRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!leagueId) {
        setChecking(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/check-admin', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
        const data = (await res.json()) as { isAdmin?: boolean };
        if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [leagueId]);

  const fetchGames = useCallback(async () => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/games?leagueId=${encodeURIComponent(leagueId)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { games?: AdminGameRow[] };
      setGames(data.games || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load games');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (open && isAdmin && leagueId) {
      void fetchGames();
    }
  }, [open, isAdmin, leagueId, fetchGames]);

  const handleDelete = async (gameId: string) => {
    if (!confirm('Delete this game? Leaderboard totals will update after refresh.')) return;
    setDeletingId(gameId);
    try {
      const res = await fetch(`/api/admin/games?id=${encodeURIComponent(gameId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
      }
      toast.success('Game removed');
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (!leagueId) return null;
  if (checking) return null;
  if (!isAdmin) return null;

  const preview = games.slice(0, 15);

  return (
    <Card className="bg-slate-900/40 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <FaDice className="w-5 h-5 text-amber-400" aria-hidden />
            Games (add / remove)
          </CardTitle>
          <p className="text-slate-400 text-sm mt-1">
            Remove games here. Add or edit games via admin API routes or Prisma / seed scripts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
          >
            {open ? 'Hide list' : 'Show recent games'}
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : preview.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No games in this league yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/80 text-left text-slate-300">
                    <th className="py-2 px-3 font-medium">Date</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium">Players</th>
                    <th className="py-2 px-3 font-medium text-right">Pts (row)</th>
                    <th className="py-2 px-3 font-medium text-right"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {preview.map((g) => {
                    const n = parsePlayers(g.players).length;
                    const pts = sumPoints(parsePlacements(g.placements));
                    return (
                      <tr key={g.id} className="text-slate-200 hover:bg-slate-800/40">
                        <td className="py-2 px-3 whitespace-nowrap">{g.date}</td>
                        <td className="py-2 px-3 capitalize">{g.gameType || '—'}</td>
                        <td className="py-2 px-3">{n}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{pts}</td>
                        <td className="py-2 px-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                            disabled={deletingId === g.id}
                            onClick={() => handleDelete(g.id)}
                            title="Delete game"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {games.length > 15 && (
            <p className="text-slate-500 text-xs text-center">
              Showing 15 most recent. Use admin API or database for the full list.
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchGames()} className="border-slate-600 text-slate-300">
            Refresh list
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
