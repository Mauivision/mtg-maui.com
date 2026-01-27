'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  FaTrophy,
  FaUsers,
  FaCalendar,
  FaChartLine,
  FaMedal,
  FaCrown,
  FaFire,
  FaBullseye as FaTarget,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { format, subDays, startOfDay } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface AnalyticsData {
  totalPlayers: number;
  totalTournaments: number;
  totalGames: number;
  winRate: number;
  topPlayers: Array<{
    id: string;
    name: string;
    wins: number;
    losses: number;
    winRate: number;
    points: number;
  }>;
  tournamentHistory: Array<{
    date: string;
    tournaments: number;
    participants: number;
  }>;
  gameTypeDistribution: {
    commander: number;
    draft: number;
    standard: number;
    other: number;
  };
  performanceMetrics: {
    avgPointsPerGame: number;
    knockoutRate: number;
    lastTwoStandingRate: number;
    streakData: Array<{
      player: string;
      currentStreak: number;
      maxStreak: number;
    }>;
  };
}

interface AnalyticsDashboardProps {
  playerId?: string;
  leagueId?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ playerId, leagueId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange,
        ...(playerId && { playerId }),
        ...(leagueId && { leagueId }),
      });

      const response = await fetch(`/api/analytics?${params}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [playerId, leagueId, timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="text-amber-500" />
        <span className="ml-3 text-white">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Unable to load analytics data</p>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#e5e7eb',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
      },
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: '#374151',
        },
      },
    },
  };

  const tournamentHistoryData = {
    labels: analyticsData.tournamentHistory.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Tournaments',
        data: analyticsData.tournamentHistory.map(item => item.tournaments),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Participants',
        data: analyticsData.tournamentHistory.map(item => item.participants),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const gameTypeData = {
    labels: ['Commander', 'Draft', 'Standard', 'Other'],
    datasets: [
      {
        data: [
          analyticsData.gameTypeDistribution.commander,
          analyticsData.gameTypeDistribution.draft,
          analyticsData.gameTypeDistribution.standard,
          analyticsData.gameTypeDistribution.other,
        ],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
        borderColor: ['#d97706', '#2563eb', '#059669', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  const radarData = {
    labels: ['Wins', 'Points', 'Knockouts', 'Last 2 Standing', 'Consistency', 'Streak'],
    datasets: [
      {
        label: 'Performance',
        data: [
          analyticsData.winRate,
          analyticsData.performanceMetrics.avgPointsPerGame * 10,
          analyticsData.performanceMetrics.knockoutRate,
          analyticsData.performanceMetrics.lastTwoStandingRate,
          85, // consistency score
          Math.min(analyticsData.performanceMetrics.streakData[0]?.maxStreak || 0, 100),
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: '#f59e0b',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f59e0b',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      r: {
        angleLines: {
          color: '#374151',
        },
        grid: {
          color: '#374151',
        },
        pointLabels: {
          color: '#9ca3af',
        },
        ticks: {
          color: '#9ca3af',
          backdropColor: 'transparent',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">
            {playerId ? 'Player Performance Analytics' : 'League Tournament Analytics'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'border-amber-400 text-amber-400 hover:bg-amber-900/30'
              }
            >
              {range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Players</p>
                <p className="text-2xl font-bold text-white">{analyticsData.totalPlayers}</p>
              </div>
              <FaUsers className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tournaments</p>
                <p className="text-2xl font-bold text-white">{analyticsData.totalTournaments}</p>
              </div>
              <FaTrophy className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-white">{analyticsData.winRate.toFixed(1)}%</p>
              </div>
              <FaTarget className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Points/Game</p>
                <p className="text-2xl font-bold text-white">
                  {analyticsData.performanceMetrics.avgPointsPerGame.toFixed(1)}
                </p>
              </div>
              <FaChartLine className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tournament History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaCalendar className="w-5 h-5 text-amber-500" />
              Tournament Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={tournamentHistoryData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Game Type Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaChartLine className="w-5 h-5 text-blue-500" />
              Game Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={gameTypeData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#e5e7eb',
                        padding: 20,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaMedal className="w-5 h-5 text-amber-500" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Top Players */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaCrown className="w-5 h-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topPlayers.slice(0, 5).map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{player.name}</p>
                      <p className="text-gray-400 text-sm">
                        {player.wins}W - {player.losses}L
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-bold">{player.winRate.toFixed(1)}%</p>
                    <p className="text-gray-400 text-sm">{player.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaFire className="w-5 h-5 text-red-500" />
            Advanced Commander Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {analyticsData.performanceMetrics.knockoutRate.toFixed(1)}%
              </div>
              <p className="text-gray-300">Knockout Rate</p>
              <p className="text-gray-400 text-sm">Eliminations per game</p>
            </div>

            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {analyticsData.performanceMetrics.lastTwoStandingRate.toFixed(1)}%
              </div>
              <p className="text-gray-300">Last 2 Standing</p>
              <p className="text-gray-400 text-sm">Survival rate in Commander</p>
            </div>

            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {analyticsData.performanceMetrics.streakData[0]?.maxStreak || 0}
              </div>
              <p className="text-gray-300">Best Win Streak</p>
              <p className="text-gray-400 text-sm">Consecutive victories</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
