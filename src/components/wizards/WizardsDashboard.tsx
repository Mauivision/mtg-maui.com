'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FaMagic, FaUsers, FaTrophy, FaGamepad } from 'react-icons/fa';

import type { WizardPlayer, WizardGame } from '@/types/wizards';

interface WizardsDashboardProps {
  players: WizardPlayer[];
  games: WizardGame[];
  currentLeague: { id: string; name: string } | null;
}

export function WizardsDashboard({ players, games, currentLeague }: WizardsDashboardProps) {
  const totalPoints = players.reduce((sum, p) => sum + (p.totalPoints || 0), 0);
  const totalGames = games.length;
  const activePlayers = players.filter(p => p.active !== false).length;

  return (
    <div className="space-y-6">
      <Card className="card-arena border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FaMagic className="w-5 h-5 mr-2 text-amber-400" />
            Wizard&apos;s Control Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Players</p>
                  <p className="text-2xl font-bold text-white">{players.length}</p>
                </div>
                <FaUsers className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Players</p>
                  <p className="text-2xl font-bold text-white">{activePlayers}</p>
                </div>
                <FaUsers className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Games</p>
                  <p className="text-2xl font-bold text-white">{totalGames}</p>
                </div>
                <FaGamepad className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Points</p>
                  <p className="text-2xl font-bold text-white">{totalPoints}</p>
                </div>
                <FaTrophy className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </div>

          {currentLeague && (
            <div className="mt-6 p-4 bg-slate-800/80 rounded-lg border border-slate-600/50">
              <p className="text-sm text-slate-400">Current League</p>
              <p className="text-lg font-semibold text-white">{currentLeague.name}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
