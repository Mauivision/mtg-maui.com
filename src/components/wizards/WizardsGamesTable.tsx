'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FaEdit, FaTrash, FaGamepad, FaPlus } from 'react-icons/fa';
import type { WizardGame } from '@/types/wizards';

interface WizardsGamesTableProps {
  games: WizardGame[];
  selectedGameType: 'commander' | 'draft' | 'all';
  onGameTypeChange: (gameType: 'commander' | 'draft' | 'all') => void;
  onEditGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onAddGame: () => void;
}

export function WizardsGamesTable({
  games,
  selectedGameType,
  onGameTypeChange,
  onEditGame,
  onDeleteGame,
  onAddGame,
}: WizardsGamesTableProps) {
  const filteredGames = games.filter(
    game => selectedGameType === 'all' || game.gameType === selectedGameType
  );

  return (
    <div className="space-y-4">
      {/* Game Type Filter */}
      <div className="flex gap-2">
        {(['all', 'commander', 'draft'] as const).map(gameType => (
          <Button
            key={gameType}
            variant={selectedGameType === gameType ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onGameTypeChange(gameType)}
            className={selectedGameType === gameType ? 'bg-amber-600' : ''}
          >
            {gameType === 'all' ? 'All Games' : gameType.charAt(0).toUpperCase() + gameType.slice(1)}
          </Button>
        ))}
        <Button onClick={onAddGame} size="sm" className="ml-auto bg-emerald-600 hover:bg-emerald-700">
          <FaPlus className="w-4 h-4 mr-2" />
          Record Game
        </Button>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <FaGamepad className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Games Yet</h3>
          <p className="text-slate-400 mb-6">
            Start recording games to track tournament progress!
          </p>
          <Button onClick={onAddGame} className="bg-emerald-600 hover:bg-emerald-700">
            <FaGamepad className="w-4 h-4 mr-2" />
            Record First Game
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-white font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Format</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Players</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Winner</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Table</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map(game => (
                <tr key={game.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-300">
                    {new Date(game.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                      {game.format}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{game.players.length}</td>
                  <td className="py-3 px-4">
                    <span className="text-amber-400 font-medium">
                      {game.winner || 'TBD'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {game.tableNumber ? `Table ${game.tableNumber}` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditGame(game.id)}
                        className="text-amber-400 hover:text-amber-300"
                      >
                        <FaEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteGame(game.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}