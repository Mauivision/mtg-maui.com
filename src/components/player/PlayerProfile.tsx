'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  FaTrophy,
  FaMedal,
  FaFire,
  FaBullseye as FaTarget,
  FaCalendar,
  FaCrown,
  FaSkull,
  FaChartLine,
  FaUsers,
  FaStar,
  FaBolt,
} from 'react-icons/fa';
import { format, subDays, startOfDay } from 'date-fns';

interface PlayerStats {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  rank: number;
  currentStreak: number;
  bestStreak: number;
  favoriteCommander?: string;
  achievements: Achievement[];
  recentGames: GameResult[];
  performance: {
    avgPlacement: number;
    knockoutRate: number;
    lastTwoStandingRate: number;
    consistency: number;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GameResult {
  id: string;
  gameType: string;
  placement: number;
  points: number;
  commander?: string;
  opponents: string[];
  date: string;
  duration: number;
}

interface PlayerProfileProps {
  playerId: string;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ playerId }) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'achievements'>('overview');

  const fetchPlayerStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/players/${playerId}`);
      const data = await response.json();
      setPlayerStats(data);
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayerStats();
  }, [fetchPlayerStats]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank <= 3) return 'text-amber-400';
    if (rank <= 10) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaCrown className="w-6 h-6 text-yellow-400" />;
    if (rank <= 3) return <FaMedal className="w-5 h-5 text-amber-400" />;
    if (rank <= 10) return <FaTrophy className="w-5 h-5 text-blue-400" />;
    return <FaUsers className="w-5 h-5 text-gray-400" />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-yellow-400 bg-yellow-900/20';
      case 'epic':
        return 'border-purple-400 bg-purple-900/20';
      case 'rare':
        return 'border-blue-400 bg-blue-900/20';
      default:
        return 'border-gray-400 bg-gray-900/20';
    }
  };

  const getPlacementColor = (placement: number) => {
    switch (placement) {
      case 1:
        return 'text-yellow-400 bg-yellow-900/30';
      case 2:
        return 'text-gray-300 bg-gray-700/30';
      case 3:
        return 'text-amber-600 bg-amber-900/30';
      default:
        return 'text-slate-400 bg-slate-700/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="text-amber-500" />
        <span className="ml-3 text-white">Loading player profile...</span>
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Player not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {playerStats.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-2 border-2 border-slate-700">
                {getRankIcon(playerStats.rank)}
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{playerStats.name}</h1>
                <Badge className={`${getRankColor(playerStats.rank)} border-current`}>
                  Rank #{playerStats.rank}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{playerStats.points}</div>
                  <div className="text-sm text-gray-400">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {playerStats.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{playerStats.totalGames}</div>
                  <div className="text-sm text-gray-400">Games</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {playerStats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-400">Streak</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <FaCalendar className="w-4 h-4" />
                  Joined {format(new Date(playerStats.joinDate), 'MMM yyyy')}
                </div>
                {playerStats.favoriteCommander && (
                  <div className="flex items-center gap-1">
                    <FaCrown className="w-4 h-4" />
                    Favorite: {playerStats.favoriteCommander}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: FaChartLine },
          { id: 'games', label: 'Recent Games', icon: FaTrophy },
          { id: 'achievements', label: 'Achievements', icon: FaStar },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FaTarget className="w-5 h-5 text-amber-500" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Average Placement</span>
                  <span className="text-2xl font-bold text-white">
                    {playerStats.performance.avgPlacement.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Knockout Rate</span>
                  <span className="text-2xl font-bold text-red-400">
                    {playerStats.performance.knockoutRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Last 2 Standing</span>
                  <span className="text-2xl font-bold text-green-400">
                    {playerStats.performance.lastTwoStandingRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Consistency</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {playerStats.performance.consistency.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streaks & Records */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FaFire className="w-5 h-5 text-orange-500" />
                Streaks & Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300 flex items-center gap-2">
                    <FaBolt className="w-4 h-4 text-yellow-400" />
                    Current Streak
                  </span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {playerStats.currentStreak}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300 flex items-center gap-2">
                    <FaFire className="w-4 h-4 text-orange-400" />
                    Best Streak
                  </span>
                  <span className="text-2xl font-bold text-orange-400">
                    {playerStats.bestStreak}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Total Wins</span>
                  <span className="text-2xl font-bold text-green-400">{playerStats.wins}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Total Losses</span>
                  <span className="text-2xl font-bold text-red-400">{playerStats.losses}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'games' && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaTrophy className="w-5 h-5 text-amber-500" />
              Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerStats.recentGames.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No recent games</p>
              ) : (
                playerStats.recentGames.map(game => (
                  <div key={game.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getPlacementColor(game.placement)}>
                            #{game.placement}
                          </Badge>
                          <span className="text-white font-medium capitalize">{game.gameType}</span>
                          {game.commander && (
                            <span className="text-gray-400">• {game.commander}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">vs {game.opponents.join(', ')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-bold">{game.points} pts</div>
                        <div className="text-gray-400 text-sm">
                          {format(new Date(game.date), 'MMM dd')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'achievements' && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaStar className="w-5 h-5 text-yellow-500" />
              Achievements ({playerStats.achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerStats.achievements.length === 0 ? (
                <p className="text-gray-400 col-span-full text-center py-8">No achievements yet</p>
              ) : (
                playerStats.achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{achievement.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                        <div className="text-xs text-gray-500">
                          Unlocked {format(new Date(achievement.unlockedAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
