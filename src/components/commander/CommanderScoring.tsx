'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaCrown, FaSkull, FaUsers, FaTrophy, FaCalculator } from 'react-icons/fa';
import { format } from 'date-fns';

interface CommanderGame {
  id: string;
  name: string;
  players: Array<{
    id: string;
    name: string;
    commander: string;
    placement: number;
    points: number;
    knockouts: number;
    eliminatedBy?: string;
    lifeRemaining?: number;
  }>;
  winner: {
    id: string;
    name: string;
    commander: string;
  };
  totalPlayers: number;
  createdAt: string;
}

interface ScoringBreakdown {
  basePoints: number;
  placementBonus: number;
  knockoutBonus: number;
  lastTwoStandingBonus: number;
  totalPoints: number;
}

export const CommanderScoring: React.FC = () => {
  const [games, setGames] = useState<CommanderGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<CommanderGame | null>(null);
  const [showScoringBreakdown, setShowScoringBreakdown] = useState(false);

  useEffect(() => {
    fetchCommanderGames();
  }, []);

  const fetchCommanderGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/commander/games');
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Failed to fetch Commander games:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScoring = (
    placement: number,
    knockouts: number,
    totalPlayers: number
  ): ScoringBreakdown => {
    // Base points for participating
    const basePoints = 5;

    // Placement bonus (more points for better placement)
    const placementBonus = Math.max(0, (totalPlayers - placement + 1) * 2);

    // Knockout bonus (points for each elimination)
    const knockoutBonus = knockouts * 3;

    // Last two standing bonus (extra points for being in top 2)
    const lastTwoStandingBonus = placement <= 2 ? 5 : 0;

    const totalPoints = basePoints + placementBonus + knockoutBonus + lastTwoStandingBonus;

    return {
      basePoints,
      placementBonus,
      knockoutBonus,
      lastTwoStandingBonus,
      totalPoints,
    };
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

  const getPlacementIcon = (placement: number) => {
    switch (placement) {
      case 1:
        return <FaCrown className="w-4 h-4 text-yellow-400" />;
      case 2:
        return <FaTrophy className="w-4 h-4 text-gray-300" />;
      case 3:
        return <FaTrophy className="w-4 h-4 text-amber-600" />;
      default:
        return <FaUsers className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="text-amber-500" />
        <span className="ml-3 text-white">Loading Commander games...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Commander Scoring System</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Advanced scoring for multiplayer Commander games. Points are awarded for participation,
          placement, eliminations, and surviving to the end!
        </p>
      </div>

      {/* Scoring Rules */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaCalculator className="w-5 h-5 text-amber-500" />
            Scoring Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-2">5 pts</div>
              <p className="text-gray-300 text-sm">Base Participation</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-2">2x pts</div>
              <p className="text-gray-300 text-sm">Placement Bonus</p>
              <p className="text-gray-400 text-xs">(Higher for better placement)</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-red-400 mb-2">3 pts</div>
              <p className="text-gray-300 text-sm">Per Knockout</p>
              <p className="text-gray-400 text-xs">(Each elimination)</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-2">5 pts</div>
              <p className="text-gray-300 text-sm">Last 2 Standing</p>
              <p className="text-gray-400 text-xs">(Top 2 finishers)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Games List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Commander Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {games.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No Commander games found</p>
              ) : (
                games.map(game => (
                  <div
                    key={game.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                      selectedGame?.id === game.id
                        ? 'bg-amber-900/30 border-amber-600'
                        : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                    }`}
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-medium">{game.name}</h3>
                      <span className="text-gray-400 text-sm">
                        {format(new Date(game.createdAt), 'MMM dd')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaCrown className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-sm">{game.winner.name}</span>
                        <span className="text-gray-400 text-sm">({game.winner.commander})</span>
                      </div>
                      <span className="text-gray-400 text-sm">{game.totalPlayers} players</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Details */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedGame ? 'Game Details' : 'Select a Game'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGame ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-2">{selectedGame.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaCrown className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">{selectedGame.winner.name}</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Commander: {selectedGame.winner.commander}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium mb-3">Final Standings</h4>
                  {selectedGame.players
                    .sort((a, b) => a.placement - b.placement)
                    .map(player => {
                      const scoring = calculateScoring(
                        player.placement,
                        player.knockouts,
                        selectedGame.totalPlayers
                      );
                      return (
                        <div
                          key={player.id}
                          className={`p-3 rounded-lg border ${getPlacementColor(player.placement)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getPlacementIcon(player.placement)}
                              <span className="font-medium">{player.name}</span>
                              <span className="text-sm opacity-75">#{player.placement}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{scoring.totalPoints} pts</div>
                              <div className="text-sm opacity-75">{player.commander}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <FaSkull className="w-3 h-3 text-red-400" />
                              <span>{player.knockouts} knockouts</span>
                            </div>
                            {player.lifeRemaining && <div>❤️ {player.lifeRemaining} life</div>}
                          </div>

                          {showScoringBreakdown && (
                            <div className="mt-3 pt-3 border-t border-slate-600">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>Base: +{scoring.basePoints}</div>
                                <div>Placement: +{scoring.placementBonus}</div>
                                <div>Knockouts: +{scoring.knockoutBonus}</div>
                                <div>Last 2: +{scoring.lastTwoStandingBonus}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScoringBreakdown(!showScoringBreakdown)}
                  className="w-full border-amber-400 text-amber-400 hover:bg-amber-900/30"
                >
                  {showScoringBreakdown ? 'Hide' : 'Show'} Scoring Breakdown
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaTrophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Select a game to view detailed scoring</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
