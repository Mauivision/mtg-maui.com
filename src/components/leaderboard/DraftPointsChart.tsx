'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaDice } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

interface DraftStanding {
  name: string;
  points: number;
}

export const DraftPointsChart: React.FC = () => {
  const [draftName, setDraftName] = useState<string | null>(null);
  const [standings, setStandings] = useState<DraftStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/drafts/standings');
      const data = await response.json();
      setDraftName(data.draftName ?? null);
      setStandings(data.standings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load draft standings');
      setStandings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700" aria-busy="true" aria-live="polite">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner className="text-amber-500" />
          <span className="text-slate-400 text-sm">Loading draft standings…</span>
        </CardContent>
      </Card>
    );
  }

  if (error || standings.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaDice className="w-5 h-5 text-amber-500" />
            Draft — Points earned
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-slate-400">
          {error ? (
            <p>{error}</p>
          ) : (
            <p>No draft standings yet. Complete a draft and enter results to see the chart.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const labels = standings.map((s) => s.name);
  const points = standings.map((s) => s.points);
  const maxPoints = Math.max(...points, 1);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Points earned',
        data: points,
        backgroundColor: standings.map((_, i) => {
          if (i === 0) return 'rgba(234, 179, 8, 0.7)';
          if (i === 1) return 'rgba(156, 163, 175, 0.7)';
          if (i === 2) return 'rgba(217, 119, 6, 0.7)';
          return 'rgba(148, 163, 184, 0.5)';
        }),
        borderColor: standings.map((_, i) => {
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
            const s = standings[tooltipItem.dataIndex];
            return s ? `#${tooltipItem.dataIndex + 1} · ${s.points} pts` : '';
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
        <CardTitle className="text-white flex items-center gap-2">
          <FaDice className="w-5 h-5 text-amber-500" />
          {draftName || 'Draft'} — Points earned
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[min(420px,55vh)] min-h-[280px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};
