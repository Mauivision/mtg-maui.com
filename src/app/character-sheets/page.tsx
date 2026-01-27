'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLeague } from '@/contexts/LeagueContext';
import {
  FaDice,
  FaScroll,
  FaShieldAlt,
  FaCrosshairs as FaSword,
  FaMagic,
  FaCrown,
  FaFire,
  FaBook,
  FaGem,
  FaChartBar,
  FaTrophy,
} from 'react-icons/fa';

// Type definition for player character
interface PlayerCharacter {
  id: string;
  playerName: string;
  commander: string;
  level: number;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  goldObjectives: number;
  silverObjectives: number;
  stats: {
    power: number;
    consistency: number;
    victoryRate: number;
    adaptability: number;
    experience: number;
  };
  rank: number;
  xp: number;
  nextLevelXp: number;
  achievements: string[];
  winRate?: number;
  averagePlacement?: number;
}

export default function CharacterSheetsPage() {
  const { currentLeague, loading: leagueLoading } = useLeague();
  const [players, setPlayers] = useState<PlayerCharacter[]>([]);
  const [filter, setFilter] = useState<'all' | 'commander' | 'draft'>('all');
  const [loading, setLoading] = useState(true);

  const fetchCharacterSheets = useCallback(async () => {
    if (!currentLeague) return;

    setLoading(true);
    try {
      const gameTypeParam = filter !== 'all' ? `?gameType=${filter}` : '';
      const response = await fetch(
        `/api/leagues/${currentLeague.id}/character-sheets${gameTypeParam}`
      );

      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
      } else {
        setPlayers([]);
      }
    } catch (error) {
      console.error('Error fetching character sheets:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [currentLeague, filter]);

  useEffect(() => {
    if (currentLeague && !leagueLoading) {
      fetchCharacterSheets();
    } else if (!leagueLoading && !currentLeague) {
      setPlayers([]);
      setLoading(false);
    }
  }, [filter, currentLeague, leagueLoading, fetchCharacterSheets]);

  const CharacterSheetSkeleton = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="rounded" width={80} height={24} />
            </div>
            <Skeleton variant="text" width={100} height={16} />
          </div>
          <Skeleton variant="text" width={80} height={24} />
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* XP Progress */}
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between mb-2">
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={80} height={16} />
          </div>
          <Skeleton variant="rectangular" width="100%" height={12} className="rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={40} height={16} />
              </div>
              <Skeleton variant="rectangular" width="100%" height={6} className="rounded-full" />
            </div>
          ))}
        </div>

        {/* Record & Objectives */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <Skeleton variant="text" width={100} height={16} className="mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton variant="text" width={40} height={14} />
                  <Skeleton variant="text" width={30} height={14} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <Skeleton variant="text" width={100} height={16} className="mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton variant="text" width={40} height={14} />
                  <Skeleton variant="text" width={30} height={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatBlock = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => {
    const modifier = Math.floor((value - 10) / 2);
    return (
      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300">{label}</span>
          </div>
          <span className="text-xl font-bold text-amber-400">{value}</span>
        </div>
        <div className="text-xs text-slate-500">
          Modifier: {modifier >= 0 ? '+' : ''}
          {modifier}
        </div>
        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-orange-600"
            style={{ width: `${(value / 20) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const CharacterSheet = ({ player }: { player: PlayerCharacter }) => {
    const xpProgress =
      ((player.xp % 100) / (player.nextLevelXp - Math.floor(player.xp / 100) * 100)) * 100;
    const winRate =
      player.winRate !== undefined
        ? player.winRate
        : player.gamesPlayed > 0
          ? (player.wins / player.gamesPlayed) * 100
          : 0;
    const achievements = player.achievements || [];

    return (
      <Card className="card-arena border-amber-500/20 hover:-translate-y-0.5 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {player.rank <= 3 && (
                  <FaCrown
                    className={`w-5 h-5 ${
                      player.rank === 1
                        ? 'text-yellow-400'
                        : player.rank === 2
                          ? 'text-slate-300'
                          : 'text-amber-400'
                    }`}
                  />
                )}
                <CardTitle className="text-xl font-bold text-white">{player.playerName}</CardTitle>
                <Badge className="bg-amber-900/50 text-amber-200">Rank #{player.rank}</Badge>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <FaBook className="w-4 h-4" />
                <span className="text-sm">{player.commander}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-400">Level {player.level}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* XP Progress */}
          <div className="bg-slate-700/80 rounded-lg p-3 border border-slate-600/50">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-300">Experience</span>
              <span className="text-amber-400">
                {player.xp} / {player.nextLevelXp} XP
              </span>
            </div>
            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-orange-600"
                style={{ width: `${Math.min(100, xpProgress)}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatBlock label="Power" value={player.stats.power} icon={FaSword} />
            <StatBlock label="Consistency" value={player.stats.consistency} icon={FaShieldAlt} />
            <StatBlock label="Victory Rate" value={player.stats.victoryRate} icon={FaCrown} />
            <StatBlock label="Adaptability" value={player.stats.adaptability} icon={FaMagic} />
            <StatBlock label="Experience" value={player.stats.experience} icon={FaChartBar} />
          </div>

          {/* Record & Objectives */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/80 rounded-lg p-4 border border-slate-600/50">
              <h3 className="text-sm font-bold text-white mb-3">Game Record</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Games</span>
                  <span className="text-white font-semibold">{player.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Wins</span>
                  <span className="text-green-300 font-semibold">{player.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Losses</span>
                  <span className="text-red-300 font-semibold">{player.losses}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="text-amber-400 font-bold">{winRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/80 rounded-lg p-4 border border-slate-600/50">
              <h3 className="text-sm font-bold text-white mb-3">Objectives</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-400">Gold</span>
                  <span className="text-amber-300 font-bold">{player.goldObjectives}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Silver</span>
                  <span className="text-slate-300 font-semibold">{player.silverObjectives}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Points</span>
                    <span className="text-amber-400 font-bold">{player.totalPoints}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {achievements.length > 0 && (
            <div className="bg-slate-700/80 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center gap-2 mb-3">
                <FaTrophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Achievements</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, index) => (
                  <Badge key={index} className="bg-amber-900/50 text-amber-200 text-xs">
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (leagueLoading || loading) {
    return (
      <div className="min-h-screen static-page flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentLeague) {
    return (
      <div className="min-h-screen static-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 static-page-content">
          <Card className="card-arena border-amber-500/20">
            <CardContent className="p-8 text-center">
              <FaDice className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No League Available</h2>
              <p className="text-slate-400">
                Please create a league first or contact an administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen static-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 static-page-content">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4 animate-fade-in">
            <FaDice className="w-8 h-8 text-amber-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Character <span className="text-gradient-arena">Sheets</span>
            </h1>
            <FaScroll className="w-8 h-8 text-amber-400 ml-3" />
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-delayed">
            D&D-style character stats and progression for all players
          </p>
        </div>

        <div
          className="flex justify-center mb-6 gap-2 animate-fade-in-delayed-2"
        >
          {['all', 'commander', 'draft'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all capitalize border ${
                filter === f
                  ? 'bg-amber-600 text-white border-amber-500/40 shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border-slate-600 hover:border-amber-500/30'
              }`}
            >
              {f === 'all' ? 'All Players' : f}
            </button>
          ))}
        </div>

        {players.length === 0 ? (
          <Card className="card-arena border-amber-500/20">
            <CardContent className="p-12 text-center">
              <FaDice className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Players Yet</h3>
              <p className="text-slate-400">Start recording games to see character sheets!</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <CharacterSheetSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {players.map((player, index) => (
              <div
                key={player.id}
                className="animate-slide-up"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <CharacterSheet player={player} />
              </div>
            ))}
          </div>
        )}

        {/* Season Summary */}
        {players.length > 0 && (
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Card className="card-arena border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <FaChartBar className="w-5 h-5 text-amber-400" />
                  Season Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-400">{players.length}</div>
                    <div className="text-sm text-slate-400">Total Players</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-2xl font-bold text-emerald-400">
                      {players.reduce((sum, p) => sum + p.gamesPlayed, 0)}
                    </div>
                    <div className="text-sm text-slate-400">Total Games</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-400">
                      {players.reduce((sum, p) => sum + p.totalPoints, 0)}
                    </div>
                    <div className="text-sm text-slate-400">Total Points</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-2xl font-bold text-yellow-400">
                      {players.reduce((sum, p) => sum + p.goldObjectives, 0)}
                    </div>
                    <div className="text-sm text-slate-400">Gold Objectives</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
