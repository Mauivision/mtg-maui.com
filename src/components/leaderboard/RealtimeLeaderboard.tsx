'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { FaTrophy, FaMedal, FaCrown, FaFire, FaBolt, FaUsers, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import type { RealtimeLeaderboardEntry } from '@/types/leaderboard';

export type RealtimeLeaderboardVariant = 'standalone' | 'embed';

interface RealtimeLeaderboardProps {
  leagueId?: string;
  gameType?: 'all' | 'commander' | 'draft' | 'standard';
  limit?: number;
  variant?: RealtimeLeaderboardVariant;
}

export const RealtimeLeaderboard: React.FC<RealtimeLeaderboardProps> = ({
  leagueId,
  gameType = 'all',
  limit = 10,
  variant = 'standalone',
}) => {
  const isEmbed = variant === 'embed';
  const [leaderboard, setLeaderboard] = useState<RealtimeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [liveUpdates, setLiveUpdates] = useState(true);
  const lastDataHashRef = useRef<string>('');
  const [pollInterval, setPollInterval] = useState<number>(60000);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const getDataHash = useCallback((data: RealtimeLeaderboardEntry[]): string => {
    return data.map((entry) => `${entry.id}-${entry.points}-${entry.rank}`).join('|');
  }, []);

  useEffect(() => {
    setIsVisible(!document.hidden);
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchLeaderboard = useCallback(
    async (force = false) => {
      if (!isVisible && !force) return;

      try {
        const params = new URLSearchParams({
          gameType,
          limit: limit.toString(),
          ...(leagueId && { leagueId }),
        });
        const response = await fetch(`/api/leaderboard/realtime?${params}`);
        const data = await response.json();
        const newEntries = data.entries || [];
        const newDataHash = getDataHash(newEntries);
        const prevHash = lastDataHashRef.current;

        if (force || newDataHash !== prevHash) {
          setLeaderboard(newEntries);
          lastDataHashRef.current = newDataHash;
          setLastUpdate(new Date());
          if (newDataHash !== prevHash) {
            setPollInterval(60000);
          } else {
            setPollInterval((p) => Math.min(p * 1.2, 300000));
          }
        }
        setError(null);
        setRetryCount(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
        setRetryCount((r) => r + 1);
      } finally {
        setLoading(false);
      }
    },
    [leagueId, gameType, limit, isVisible, getDataHash]
  );

  useEffect(() => {
    fetchLeaderboard(true); // Initial load

    // Set up adaptive polling based on visibility and data changes
    if (liveUpdates && isVisible) {
      const interval = setInterval(() => fetchLeaderboard(), pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchLeaderboard, liveUpdates, isVisible, pollInterval]);

  // Resume polling when tab becomes visible
  useEffect(() => {
    if (isVisible && liveUpdates) {
      fetchLeaderboard(true); // Force refresh when tab becomes visible
    }
  }, [isVisible, liveUpdates, fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <FaMedal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <FaTrophy className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">
            #{rank}
          </span>
        );
    }
  };

  const getRankChange = (entry: RealtimeLeaderboardEntry) => {
    if (!entry.previousRank) return null;

    const change = entry.previousRank - entry.rank;
    if (change > 0) {
      return <span className="text-green-400 text-sm">↗ +{change}</span>;
    } else if (change < 0) {
      return <span className="text-red-400 text-sm">↘ {change}</span>;
    }
    return <span className="text-gray-400 text-sm">→</span>;
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 5) return <FaFire className="w-4 h-4 text-orange-500" />;
    if (streak >= 3) return <FaBolt className="w-4 h-4 text-yellow-500" />;
    return null;
  };

  const LeaderboardEntrySkeleton = () => (
    <div className="p-4 rounded-lg border bg-slate-700/30 border-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex items-center gap-2 min-w-[60px]">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="circular" width={16} height={16} />
          </div>

          {/* Avatar & Name */}
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div>
              <Skeleton variant="text" width={120} height={16} className="mb-1" />
              <Skeleton variant="text" width={80} height={12} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Stats */}
          <div className="text-right">
            <Skeleton variant="text" width={30} height={14} />
          </div>
          <div className="text-right">
            <Skeleton variant="text" width={25} height={14} />
          </div>
          <div className="text-right">
            <Skeleton variant="text" width={35} height={14} />
          </div>

          {/* Progress bar */}
          <div className="w-24">
            <Skeleton variant="rectangular" width="100%" height={8} className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, index) => (
          <LeaderboardEntrySkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={isEmbed ? 'space-y-4' : 'space-y-6'}>
      {/* Header — full in standalone, compact in embed */}
      {!isEmbed && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Live Leaderboard</h2>
            <p className="text-gray-400 text-sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
              {error && (
                <span className="ml-2 text-red-400 text-xs">
                  (Error: {error})
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={liveUpdates ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLiveUpdates(!liveUpdates)}
              className={liveUpdates ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <FaBolt className="w-4 h-4 mr-2" />
              {liveUpdates ? 'Live' : 'Paused'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setRetryCount(0);
                fetchLeaderboard(true);
              }}
              className="border-amber-400 text-amber-400 hover:bg-amber-900/30"
            >
              <FaRedo className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      )}
      {isEmbed && (error || lastUpdate) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Updated {lastUpdate.toLocaleTimeString()}
            {error && <span className="ml-2 text-red-400">({error})</span>}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              setRetryCount(0);
              fetchLeaderboard(true);
            }}
            className="border-amber-400 text-amber-400 hover:bg-amber-900/30"
          >
            <FaRedo className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      )}

      {/* Error Banner */}
      {error && retryCount > 0 && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            <span>Failed to fetch leaderboard. Retry attempt {retryCount}.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              fetchLeaderboard(true);
            }}
            className="border-red-400 text-red-400 hover:bg-red-900/50"
          >
            <FaRedo className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700">
        {!isEmbed && (
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaTrophy className="w-5 h-5 text-amber-500" />
              {gameType === 'all'
                ? 'Overall'
                : gameType.charAt(0).toUpperCase() + gameType.slice(1)}{' '}
              Rankings
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-2">
            {leaderboard.length === 0 && !loading ? (
              <div className="text-center py-8">
                <FaUsers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No players found</p>
                {error ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      fetchLeaderboard(true);
                    }}
                    className="mt-4 border-amber-400 text-amber-400 hover:bg-amber-900/30"
                  >
                    <FaRedo className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                ) : (
                  <p className="text-gray-500 text-sm">Players will appear here once games are recorded.</p>
                )}
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`rounded-lg border transition-all hover:scale-[1.02] animate-slide-up ${
                    isEmbed ? 'p-3' : 'p-4'
                  } ${
                    entry.rank <= 3
                      ? 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-600/30'
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center gap-2 min-w-[60px]">
                        {getRankIcon(entry.rank)}
                        {getRankChange(entry)}
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {entry.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{entry.name}</h3>
                          <div className="flex items-center gap-2">
                            {getStreakIcon(entry.currentStreak)}
                            {entry.currentStreak > 0 && (
                              <span className="text-sm text-orange-400">
                                {entry.currentStreak} win streak
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-lg font-bold text-amber-400">{entry.points}</div>
                        <div className="text-xs text-gray-400">Points</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">
                          {entry.gamesPlayed || entry.wins + entry.losses}
                        </div>
                        <div className="text-xs text-gray-400">Games</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">
                          {entry.wins}W-{entry.losses}L
                        </div>
                        <div className="text-xs text-gray-400">Record</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">
                          {entry.winRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Top 3 */}
                  {entry.rank <= 3 && (
                    <div className="mt-3">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-600 to-orange-600 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min((entry.points / Math.max(...leaderboard.map(e => e.points))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed — only in standalone */}
      {!isEmbed && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaBolt className="w-5 h-5 text-green-500" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                <FaTrophy className="w-4 h-4 text-yellow-400" />
                <span>
                  <strong>DragonMaster</strong> claimed victory in Commander!
                </span>
                <span className="text-gray-500 ml-auto">2m ago</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                <FaFire className="w-4 h-4 text-orange-400" />
                <span>
                  <strong>SpellSlinger</strong> reached a 5-win streak!
                </span>
                <span className="text-gray-500 ml-auto">5m ago</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                <FaMedal className="w-4 h-4 text-blue-400" />
                <span>
                  <strong>CardShark</strong> moved up to rank #3!
                </span>
                <span className="text-gray-500 ml-auto">8m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
