'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaRedo, FaTrophy } from 'react-icons/fa';
import type { RealtimeLeaderboardEntry } from '@/types/leaderboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const POLL_MS = 45_000;

function formatUpdatedAt(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
}

interface SimpleLeaderboardChartProps {
  leagueId?: string;
  limit?: number;
}

export const SimpleLeaderboardChart: React.FC<SimpleLeaderboardChartProps> = ({
  leagueId,
  limit = 16,
}) => {
  const [entries, setEntries] = useState<RealtimeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const initialFetchDone = useRef(false);

  const fetchLeaderboard = useCallback(
    async (opts?: { silent?: boolean; manual?: boolean }) => {
      const silent = opts?.silent === true;
      const manual = opts?.manual === true;
      const showFullSpinner = !silent && !initialFetchDone.current;
      try {
        if (showFullSpinner) {
          setLoading(true);
        }
        if (manual) setButtonLoading(true);
        setError(null);
        const params = new URLSearchParams({
          gameType: 'all',
          limit: limit.toString(),
          ...(leagueId && { leagueId }),
        });
        const response = await fetch(`/api/leaderboard/realtime?${params}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        setEntries(data.entries ?? []);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        setEntries([]);
      } finally {
        initialFetchDone.current = true;
        if (showFullSpinner) setLoading(false);
        if (manual) setButtonLoading(false);
      }
    },
    [leagueId, limit]
  );

  useEffect(() => {
    initialFetchDone.current = false;
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchLeaderboard({ silent: true });
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchLeaderboard]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        void fetchLeaderboard({ silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchLeaderboard]);

  const headerActions = (
    <div className="flex items-center gap-2 shrink-0">
      {lastUpdated && (
        <span className="text-xs text-slate-500 tabular-nums" title="Last data refresh">
          {formatUpdatedAt(lastUpdated)}
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-slate-600 text-slate-200"
        loading={buttonLoading}
        disabled={loading}
        aria-label="Refresh leaderboard chart"
        onClick={() => void fetchLeaderboard({ manual: true })}
      >
        <FaRedo className="w-3.5 h-3.5" />
      </Button>
    </div>
  );

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700" aria-busy="true" aria-live="polite">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner className="text-amber-500" />
          <span className="text-slate-400 text-sm">Loading leaderboard…</span>
        </CardContent>
      </Card>
    );
  }

  if (error || entries.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-white flex items-center gap-2">
              <FaTrophy className="w-5 h-5 text-amber-500" />
              Points
            </CardTitle>
            {headerActions}
          </div>
        </CardHeader>
        <CardContent className="py-8 text-center text-slate-400">
          {error ? (
            <p>{error}</p>
          ) : (
            <p>No players yet. Record games to see the leaderboard.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const labels = entries.map((e) => e.name);
  const points = entries.map((e) => e.points);
  const maxPoints = Math.max(...points, 1);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Points',
        data: points,
        backgroundColor: entries.map((_, i) => {
          if (i === 0) return 'rgba(234, 179, 8, 0.7)';
          if (i === 1) return 'rgba(156, 163, 175, 0.7)';
          if (i === 2) return 'rgba(217, 119, 6, 0.7)';
          return 'rgba(148, 163, 184, 0.5)';
        }),
        borderColor: entries.map((_, i) => {
          if (i === 0) return 'rgb(234, 179, 8)';
          if (i === 1) return 'rgb(156, 163, 175)';
          if (i === 2) return 'rgb(217, 119, 6)';
          return 'rgb(148, 163, 184)';
        }),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1,
        callbacks: {
          afterLabel: (tooltipItem: { dataIndex: number }) => {
            const e = entries[tooltipItem.dataIndex];
            if (!e) return '';
            const parts = [`Rank #${e.rank} · ${e.wins}W-${e.losses}L`];
            if (typeof e.commanderPoints === 'number' && typeof e.draftPoints === 'number') {
              parts.push(`Commander: ${e.commanderPoints} · Draft: ${e.draftPoints} · Total: ${e.points}`);
            }
            return parts;
          },
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: Math.ceil(maxPoints * 1.1),
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(71, 85, 105, 0.5)' },
      },
      y: {
        ticks: {
          color: '#e2e8f0',
          font: { size: 12 },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-white flex items-center gap-2">
            <FaTrophy className="w-5 h-5 text-amber-500" />
            Points
          </CardTitle>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[min(400px,50vh)] min-h-[280px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};
