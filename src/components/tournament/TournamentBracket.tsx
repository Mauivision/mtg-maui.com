'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  FaTrophy,
  FaCrown,
  FaUsers,
  FaPlay,
  FaCheck,
  FaClock,
  FaMedal,
  FaArrowRight,
} from 'react-icons/fa';

interface TournamentPlayer {
  id: string;
  name: string;
  seed: number;
  avatar?: string;
  status: 'waiting' | 'playing' | 'won' | 'lost' | 'eliminated';
  commander?: string;
  points: number;
}

interface TournamentMatch {
  id: string;
  round: number;
  match: number;
  player1: TournamentPlayer | null;
  player2: TournamentPlayer | null;
  winner: TournamentPlayer | null;
  status: 'upcoming' | 'in_progress' | 'completed';
  scheduledTime?: string;
  duration?: number;
  gameId?: string;
}

interface TournamentBracket {
  id: string;
  name: string;
  format: 'single_elimination' | 'double_elimination' | 'swiss';
  totalRounds: number;
  currentRound: number;
  status: 'registration' | 'in_progress' | 'completed';
  players: TournamentPlayer[];
  matches: TournamentMatch[];
  winner?: TournamentPlayer;
  createdAt: string;
}

interface TournamentBracketProps {
  tournamentId: string;
  interactive?: boolean;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournamentId,
  interactive = false,
}) => {
  const [tournament, setTournament] = useState<TournamentBracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  const fetchTournamentBracket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tournaments/${tournamentId}/bracket`);
      const data = await response.json();
      setTournament(data);
    } catch (error) {
      console.error('Failed to fetch tournament bracket:', error);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournamentBracket();
  }, [fetchTournamentBracket]);

  const getPlayerStatusColor = (status: TournamentPlayer['status']) => {
    switch (status) {
      case 'waiting':
        return 'border-gray-400 bg-gray-900/30';
      case 'playing':
        return 'border-blue-400 bg-blue-900/30';
      case 'won':
        return 'border-yellow-400 bg-yellow-900/30';
      case 'lost':
        return 'border-red-400 bg-red-900/30';
      case 'eliminated':
        return 'border-gray-600 bg-gray-800/30';
      default:
        return 'border-slate-400 bg-slate-900/30';
    }
  };

  const getPlayerStatusIcon = (status: TournamentPlayer['status']) => {
    switch (status) {
      case 'waiting':
        return <FaClock className="w-3 h-3 text-gray-400" />;
      case 'playing':
        return <FaPlay className="w-3 h-3 text-blue-400" />;
      case 'won':
        return <FaTrophy className="w-3 h-3 text-yellow-400" />;
      case 'lost':
        return <FaUsers className="w-3 h-3 text-red-400" />;
      case 'eliminated':
        return <FaUsers className="w-3 h-3 text-gray-600" />;
      default:
        return null;
    }
  };

  const getMatchStatusColor = (status: TournamentMatch['status']) => {
    switch (status) {
      case 'upcoming':
        return 'border-gray-500 bg-slate-800/20';
      case 'in_progress':
        return 'border-blue-500 bg-blue-900/20';
      case 'completed':
        return 'border-green-500 bg-green-900/20';
      default:
        return 'border-slate-500 bg-slate-800/20';
    }
  };

  const renderPlayerSlot = (player: TournamentPlayer | null, position: 'top' | 'bottom') => {
    if (!player) {
      return (
        <div
          className={`p-3 rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/10 ${position === 'top' ? 'mb-2' : 'mt-2'}`}
        >
          <div className="text-center text-gray-500 text-sm">TBD</div>
        </div>
      );
    }

    return (
      <div
        className={`p-3 rounded-lg border-2 ${getPlayerStatusColor(player.status)} cursor-pointer hover:scale-105 transition-all duration-200 ${position === 'top' ? 'mb-2' : 'mt-2'}`}
        onClick={() => interactive && window.open(`/players/${player.id}`, '_blank')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-medium text-sm">{player.name}</div>
              {player.commander && <div className="text-gray-400 text-xs">{player.commander}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPlayerStatusIcon(player.status)}
            <span className="text-gray-400 text-xs">#{player.seed}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMatch = (match: TournamentMatch, isLastRound: boolean = false) => {
    const winner = match.winner;
    const isCompleted = match.status === 'completed';

    return (
      <div key={match.id} className={`relative ${isLastRound ? '' : 'mr-8'}`}>
        {/* Match Container */}
        <div
          className={`p-4 rounded-lg border-2 ${getMatchStatusColor(match.status)} min-w-[280px] cursor-pointer hover:shadow-lg transition-all duration-200`}
          onClick={() => setSelectedMatch(match)}
        >
          {/* Round & Match Info */}
          <div className="text-center mb-3">
            <div className="text-sm text-gray-400">
              Round {match.round} - Match {match.match}
            </div>
            <Badge
              variant={match.status === 'completed' ? 'default' : 'secondary'}
              className={`text-xs ${
                match.status === 'completed'
                  ? 'bg-green-600'
                  : match.status === 'in_progress'
                    ? 'bg-blue-600'
                    : 'bg-gray-600'
              }`}
            >
              {match.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Players */}
          {renderPlayerSlot(match.player1, 'top')}
          <div className="flex justify-center mb-2 mt-2">
            <FaArrowRight
              className={`w-4 h-4 ${isCompleted ? 'text-green-400' : 'text-gray-500'}`}
            />
          </div>
          {renderPlayerSlot(match.player2, 'bottom')}

          {/* Winner Highlight */}
          {winner && (
            <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600 rounded-lg animate-scale-in">
              <div className="flex items-center gap-2">
                <FaCrown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium text-sm">{winner.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Connector Line (if not last round) */}
        {!isLastRound && (
          <div className="absolute top-1/2 right-0 w-8 h-0.5 bg-slate-600 transform translate-x-full -translate-y-1/2" />
        )}
      </div>
    );
  };

  const groupMatchesByRound = (matches: TournamentMatch[]) => {
    const rounds: { [key: number]: TournamentMatch[] } = {};
    matches.forEach(match => {
      if (!rounds[match.round]) {
        rounds[match.round] = [];
      }
      rounds[match.round].push(match);
    });
    return rounds;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="text-amber-500" />
        <span className="ml-3 text-white">Loading tournament bracket...</span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Tournament bracket not found</p>
      </div>
    );
  }

  const rounds = groupMatchesByRound(tournament.matches);

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{tournament.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{tournament.players.length} Players</span>
                <span>
                  Round {tournament.currentRound} of {tournament.totalRounds}
                </span>
                <Badge
                  variant={tournament.status === 'completed' ? 'default' : 'secondary'}
                  className={tournament.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}
                >
                  {tournament.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            {tournament.winner && (
              <div className="flex items-center gap-3 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                <FaCrown className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="text-yellow-400 font-bold">Champion</div>
                  <div className="text-white">{tournament.winner.name}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bracket Visualization */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaTrophy className="w-5 h-5 text-amber-500" />
            Tournament Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-max p-6">
              <div className="flex gap-12">
                {Object.entries(rounds)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([roundNum, roundMatches], roundIndex) => (
                    <div key={roundNum} className="flex flex-col gap-6">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-white">Round {roundNum}</h3>
                        <p className="text-gray-400 text-sm">{roundMatches.length} Matches</p>
                      </div>

                      <div className="flex flex-col gap-8">
                        {roundMatches.map(match =>
                          renderMatch(match, roundIndex === Object.keys(rounds).length - 1)
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Details Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  Round {selectedMatch.round} - Match {selectedMatch.match}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">
                      {selectedMatch.player1?.name || 'TBD'} vs{' '}
                      {selectedMatch.player2?.name || 'TBD'}
                    </div>
                    <div className="text-gray-400 text-sm capitalize">
                      {selectedMatch.status.replace('_', ' ')}
                    </div>
                  </div>
                  <Badge
                    variant={selectedMatch.status === 'completed' ? 'default' : 'secondary'}
                    className={
                      selectedMatch.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                    }
                  >
                    {selectedMatch.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {selectedMatch.winner && (
                  <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaCrown className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">
                        Winner: {selectedMatch.winner.name}
                      </span>
                    </div>
                  </div>
                )}

                {selectedMatch.scheduledTime && (
                  <div className="text-center text-gray-400 text-sm">
                    Scheduled: {new Date(selectedMatch.scheduledTime).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
