'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import type { WizardPlayer } from '@/types/wizards';

interface WizardsPlayerTableProps {
  players: WizardPlayer[];
  editingPlayer: string | null;
  onEditPlayer: (playerId: string) => void;
  onUpdatePlayer: (playerId: string, updates: Partial<WizardPlayer>) => void;
  onDeletePlayer: (playerId: string) => void;
  onAddPlayer: () => void;
}

export function WizardsPlayerTable({
  players,
  editingPlayer,
  onEditPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onAddPlayer,
}: WizardsPlayerTableProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <FaUserPlus className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Players Yet</h3>
        <p className="text-slate-400 mb-6">
          Summon your first player to begin the tournament!
        </p>
        <Button onClick={onAddPlayer} className="bg-amber-600 hover:bg-amber-700">
          <FaUserPlus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="text-left py-3 px-4 text-white font-semibold">#</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Player</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Commander</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Points</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Games</th>
            <th className="text-left py-3 px-4 text-white font-semibold">W/L</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id} className="border-b border-slate-700 hover:bg-slate-800/50">
              <td className="py-3 px-4 text-slate-300">{index + 1}</td>
              <td className="py-3 px-4">
                <div>
                  <p className="text-white font-medium">{player.name}</p>
                  <p className="text-sm text-slate-400">{player.email}</p>
                </div>
              </td>
              <td className="py-3 px-4 text-slate-300">
                {player.commander || 'No Commander'}
              </td>
              <td className="py-3 px-4">
                <span className="text-amber-400 font-bold">{player.totalPoints}</span>
              </td>
              <td className="py-3 px-4 text-slate-300">{player.gamesPlayed}</td>
              <td className="py-3 px-4">
                <span className="text-emerald-400">{player.wins}</span>
                <span className="text-slate-400 mx-1">/</span>
                <span className="text-red-400">{player.losses}</span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    player.active
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {player.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditPlayer(player.id)}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeletePlayer(player.id)}
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
  );
}