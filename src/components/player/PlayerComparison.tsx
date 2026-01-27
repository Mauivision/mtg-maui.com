'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaTrophy, FaChartLine, FaUsers, FaMedal, FaSearch, FaTimes } from 'react-icons/fa';
import { useLeague } from '@/contexts/LeagueContext';

// Calculate win rate from player stats
const calculateWinRate = (player: PlayerStats): number => {
  if (player.gamesPlayed === 0) return 0;
  return (player.wins / player.gamesPlayed) * 100;
};

interface PlayerStats {
  playerId: string;
  playerName: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  averagePlacement: number;
  recentForm?: string[];
  rank: number;
}

export const PlayerComparison: React.FC = () => {
  const { currentLeague } = useLeague();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlayers = useCallback(async () => {
    if (!currentLeague) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/leagues/${currentLeague.id}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  }, [currentLeague]);

  useEffect(() => {
    if (currentLeague) {
      fetchPlayers();
    }
  }, [currentLeague, fetchPlayers]);

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : prev.length < 4
          ? [...prev, playerId]
          : prev
    );
  };

  const filteredPlayers = players.filter(p =>
    p.playerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPlayerData = players.filter(p => selectedPlayers.includes(p.playerId));

  const getStatDifference = (
    stat: keyof PlayerStats,
    player1: PlayerStats,
    player2: PlayerStats
  ) => {
    const val1 = player1[stat] as number;
    const val2 = player2[stat] as number;
    const diff = val1 - val2;
    return {
      value: diff,
      isPositive: diff > 0,
      percentage: val2 !== 0 ? ((diff / val2) * 100).toFixed(1) : '0.0',
    };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaUsers className="text-amber-400" />
            Player Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search players..."
              className="bg-slate-700 border-slate-600 text-white pr-10"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>

          {/* Player Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Players to Compare (up to 4)
            </label>
            <div className="max-h-60 overflow-y-auto border border-slate-600 rounded-lg bg-slate-900 p-2">
              {loading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-4 text-gray-400">No players found</div>
              ) : (
                filteredPlayers.map(player => (
                  <div
                    key={player.playerId}
                    onClick={() => togglePlayer(player.playerId)}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPlayers.includes(player.playerId)
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            selectedPlayers.includes(player.playerId)
                              ? 'bg-amber-800'
                              : 'bg-slate-600'
                          }
                        >
                          #{player.rank}
                        </Badge>
                        <span className="font-semibold">{player.playerName}</span>
                        <span className="text-sm opacity-75">{player.totalPoints} pts</span>
                      </div>
                      {selectedPlayers.includes(player.playerId) && (
                        <FaTimes className="text-white" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedPlayerData.length >= 2 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Side-by-Side Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Stat</th>
                    {selectedPlayerData.map(player => (
                      <th
                        key={player.playerId}
                        className="text-center py-3 px-4 text-gray-300 font-semibold"
                      >
                        {player.playerName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-gray-300 font-medium">Rank</td>
                    {selectedPlayerData.map(player => (
                      <td key={player.playerId} className="text-center py-3 px-4 text-white">
                        <Badge className="bg-amber-600">#{player.rank}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-gray-300 font-medium">Total Points</td>
                    {selectedPlayerData.map(player => (
                      <td
                        key={player.playerId}
                        className="text-center py-3 px-4 text-white font-semibold"
                      >
                        {player.totalPoints}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-gray-300 font-medium">Games Played</td>
                    {selectedPlayerData.map(player => (
                      <td key={player.playerId} className="text-center py-3 px-4 text-white">
                        {player.gamesPlayed}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-gray-300 font-medium">Wins</td>
                    {selectedPlayerData.map(player => (
                      <td
                        key={player.playerId}
                        className="text-center py-3 px-4 text-green-400 font-semibold"
                      >
                        {player.wins}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-gray-300 font-medium">Win Rate</td>
                    {selectedPlayerData.map(player => (
                      <td key={player.playerId} className="text-center py-3 px-4">
                        <span
                          className={`font-semibold ${
                            calculateWinRate(player) >= 60
                              ? 'text-green-400'
                              : calculateWinRate(player) >= 40
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}
                        >
                          {calculateWinRate(player).toFixed(1)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-gray-300 font-medium">Avg Placement</td>
                    {selectedPlayerData.map(player => (
                      <td key={player.playerId} className="text-center py-3 px-4 text-white">
                        {player.averagePlacement.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-300 font-medium">Recent Form</td>
                    {selectedPlayerData.map(player => (
                      <td key={player.playerId} className="text-center py-3 px-4">
                        <div className="flex justify-center gap-1">
                          {player.recentForm?.slice(-5).map((result, idx) => (
                            <Badge
                              key={idx}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                result === 'W' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                              }`}
                            >
                              {result}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Head-to-Head Comparison */}
            {selectedPlayerData.length === 2 && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Head-to-Head</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'totalPoints', label: 'Total Points' },
                    { key: 'gamesPlayed', label: 'Games Played' },
                    { key: 'wins', label: 'Wins' },
                    { key: 'averagePlacement', label: 'Avg Placement' },
                  ].map(({ key, label }) => {
                    const diff = getStatDifference(
                      key as keyof PlayerStats,
                      selectedPlayerData[0],
                      selectedPlayerData[1]
                    );
                    return (
                      <div key={key} className="bg-slate-700 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">{label}</div>
                        <div
                          className={`text-lg font-semibold ${
                            diff.isPositive
                              ? 'text-green-400'
                              : diff.value === 0
                                ? 'text-gray-400'
                                : 'text-red-400'
                          }`}
                        >
                          {diff.value > 0 ? '+' : ''}
                          {diff.value.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {diff.percentage}% difference
                        </div>
                      </div>
                    );
                  })}
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                    <div
                      className={`text-lg font-semibold ${
                        calculateWinRate(selectedPlayerData[0]) >
                        calculateWinRate(selectedPlayerData[1])
                          ? 'text-green-400'
                          : calculateWinRate(selectedPlayerData[0]) ===
                              calculateWinRate(selectedPlayerData[1])
                            ? 'text-gray-400'
                            : 'text-red-400'
                      }`}
                    >
                      {(
                        calculateWinRate(selectedPlayerData[0]) -
                        calculateWinRate(selectedPlayerData[1])
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(
                        ((calculateWinRate(selectedPlayerData[0]) -
                          calculateWinRate(selectedPlayerData[1])) /
                          (calculateWinRate(selectedPlayerData[1]) || 1)) *
                        100
                      ).toFixed(1)}
                      % difference
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedPlayerData.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center text-gray-400">
            <FaUsers className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>Select at least 2 players to compare their stats</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
