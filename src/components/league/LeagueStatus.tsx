'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  FaUsers,
  FaGamepad,
  FaClock,
  FaExclamationTriangle,
  FaTrophy,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa';
import Link from 'next/link';

interface LeagueStatusStats {
  totalPlayers: number;
  totalGames: number;
  completedGames: number;
  activeGames: number;
  upcomingGames: number;
}

interface TopPlayer {
  id: string;
  name: string;
  points: number;
}

interface LeagueStatusData {
  league: {
    id: string;
    name: string;
    description?: string | null;
    status?: string;
    format?: string;
    startDate?: string | null;
    endDate?: string | null;
  };
  stats: LeagueStatusStats;
  topPlayers: TopPlayer[];
}

interface LeagueStatusProps {
  leagueId?: string | null;
  /** Refresh interval in ms; 0 to disable. Default 30_000 */
  refreshInterval?: number;
}

export function LeagueStatus({ leagueId, refreshInterval = 30_000 }: LeagueStatusProps) {
  const [data, setData] = useState<LeagueStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (leagueId) params.set('leagueId', leagueId);
      const res = await fetch(`/api/leagues/status?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load league status');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchStatus();
    if (refreshInterval <= 0) return;
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, refreshInterval]);

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-6 flex items-center gap-3 text-slate-100">
          <LoadingSpinner />
          <span>Loading league status...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-slate-800/50 border-amber-600/50">
        <CardContent className="py-6 space-y-4">
          <div className="flex items-center gap-3 text-amber-200">
            <FaExclamationTriangle className="text-amber-400 shrink-0" />
            <span>{error ?? 'No league found'}</span>
          </div>
          <p className="text-slate-400 text-sm">
            Only admins can create leagues and events. Sign in at{' '}
            <Link href="/wizards" className="text-amber-400 hover:underline">
              /wizards
            </Link>{' '}
            (Admin / 12345) to create league tournament records.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { league, stats, topPlayers } = data;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <CardTitle className="text-white flex items-center gap-3">
          <span className="text-2xl">🏰</span>
          <div>
            <div className="text-lg font-bold">{league.name}</div>
            <div className="text-sm text-slate-300">
              {league.description ?? 'Active Magic: The Gathering league'}
            </div>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="primary" animated>
            {(league.status ?? 'active').toUpperCase()}
          </Badge>
          {league.format && <Badge variant="secondary">{league.format}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="flex items-center gap-3 p-3 rounded bg-slate-700/40">
            <FaUsers className="text-amber-400 w-5 h-5 shrink-0" />
            <div>
              <div className="text-lg font-bold text-white">{stats.totalPlayers}</div>
              <div className="text-xs text-slate-300">Players</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded bg-slate-700/40">
            <FaGamepad className="text-green-400 w-5 h-5 shrink-0" />
            <div>
              <div className="text-lg font-bold text-white">{stats.totalGames}</div>
              <div className="text-xs text-slate-300">Total Games</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded bg-slate-700/40 border border-green-600/30">
            <FaCheckCircle className="text-green-400 w-5 h-5 shrink-0" />
            <div>
              <div className="text-lg font-bold text-green-400">{stats.completedGames}</div>
              <div className="text-xs text-slate-300">Completed</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded bg-slate-700/40 border border-orange-600/30">
            <FaSpinner className="text-orange-400 w-5 h-5 shrink-0 animate-spin" />
            <div>
              <div className="text-lg font-bold text-orange-400">{stats.activeGames}</div>
              <div className="text-xs text-slate-300">In Progress</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded bg-slate-700/40">
            <FaClock className="text-blue-400 w-5 h-5 shrink-0" />
            <div>
              <div className="text-lg font-bold text-white">{stats.upcomingGames}</div>
              <div className="text-xs text-slate-300">Upcoming</div>
            </div>
          </div>
        </div>

        {topPlayers.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-600/30">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FaTrophy className="w-4 h-4 text-amber-400" />
              Top competitors
            </h3>
            <div className="flex flex-wrap items-center justify-around gap-4">
              {topPlayers.map((p, i) => (
                <div key={p.id} className="text-center">
                  <div className="text-2xl mb-1">
                    {i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="text-white font-medium">{p.name}</div>
                  <div className="text-amber-400 font-bold">{p.points} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
