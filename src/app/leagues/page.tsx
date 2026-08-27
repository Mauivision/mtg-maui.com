'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LeagueHqShell } from '@/components/league-hq/LeagueHqShell';
import {
  createLeague,
  deleteLeague,
  exportLeaguesJson,
  getActiveLeagueId,
  importLeaguesJson,
  loadLeagues,
  saveLeague,
  setActiveLeagueId,
  type LeaguePlayer,
  type LocalLeague,
} from '@/lib/league-hq';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<LocalLeague[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const list = loadLeagues();
    setLeagues(list);
    setActiveId(getActiveLeagueId() ?? list[0]?.id ?? '');
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeLeague = leagues.find((l) => l.id === activeId) ?? leagues[0];

  const updateActive = (patch: Partial<LocalLeague>) => {
    if (!activeLeague) return;
    const updated = { ...activeLeague, ...patch };
    saveLeague(updated);
    refresh();
  };

  const updatePlayer = (playerId: string, patch: Partial<LeaguePlayer>) => {
    if (!activeLeague) return;
    updateActive({
      players: activeLeague.players.map((p) => (p.id === playerId ? { ...p, ...patch } : p)),
    });
  };

  const addPlayer = () => {
    if (!activeLeague) return;
    const n = activeLeague.players.length + 1;
    updateActive({
      players: [
        ...activeLeague.players,
        { id: `p-${Date.now()}`, name: `Player ${n}`, commanderPoints: 0, draftPoints: 0 },
      ],
    });
  };

  const removePlayer = (id: string) => {
    if (!activeLeague) return;
    updateActive({ players: activeLeague.players.filter((p) => p.id !== id) });
  };

  const handleCreate = () => {
    const league = createLeague(newName);
    setNewName('');
    setActiveLeagueId(league.id);
    refresh();
    setMessage(`Created "${league.name}"`);
  };

  const handleImport = () => {
    const result = importLeaguesJson(importText);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setImportText('');
    refresh();
    setMessage(`Imported ${result.count} league(s)`);
  };

  return (
    <LeagueHqShell
      badge="Multi-tenant v1"
      title="Leagues"
      subtitle="Create and run leagues in your browser. Default demo: MTG Maui Season 4. Export JSON to share."
    >
      <div className="space-y-6">
        {message && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-200">
            {message}
          </p>
        )}

        <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4">
          <label htmlFor="active-league" className="mb-2 block text-sm font-medium text-slate-300">
            Active league
          </label>
          <select
            id="active-league"
            value={activeId}
            onChange={(e) => {
              setActiveLeagueId(e.target.value);
              setActiveId(e.target.value);
            }}
            className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
          >
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} (Season {l.season})
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New league name"
              className="min-w-[12rem] flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
            />
            <Button size="sm" onClick={handleCreate}>
              Create league
            </Button>
            {leagues.length > 1 && activeLeague && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  deleteLeague(activeLeague.id);
                  refresh();
                }}
              >
                Delete selected
              </Button>
            )}
          </div>
        </div>

        {activeLeague && (
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-white">{activeLeague.name} — players</h2>
              <Button size="sm" variant="secondary" onClick={addPlayer}>
                Add player
              </Button>
            </div>
            <div className="space-y-2">
              {activeLeague.players.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 sm:grid-cols-[1fr_5rem_5rem_auto]"
                >
                  <input
                    value={p.name}
                    onChange={(e) => updatePlayer(p.id, { name: e.target.value })}
                    className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white"
                    aria-label="Player name"
                  />
                  <input
                    type="number"
                    min={0}
                    value={p.commanderPoints}
                    onChange={(e) =>
                      updatePlayer(p.id, { commanderPoints: parseInt(e.target.value, 10) || 0 })
                    }
                    className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white"
                    aria-label="Commander points"
                    placeholder="CMD"
                  />
                  <input
                    type="number"
                    min={0}
                    value={p.draftPoints}
                    onChange={(e) =>
                      updatePlayer(p.id, { draftPoints: parseInt(e.target.value, 10) || 0 })
                    }
                    className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white"
                    aria-label="Draft points"
                    placeholder="DFT"
                  />
                  <button
                    type="button"
                    onClick={() => removePlayer(p.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Changes save automatically. View standings on{' '}
              <Link href="/leaderboard" className="text-amber-400 hover:underline">
                Leaderboard
              </Link>
              .
            </p>
          </div>
        )}

        <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-4">
          <h2 className="mb-2 font-semibold text-white">Export / import</h2>
          <Button
            size="sm"
            variant="outline"
            className="mb-3"
            onClick={() => {
              const json = exportLeaguesJson();
              void navigator.clipboard.writeText(json);
              setMessage('Leagues JSON copied to clipboard');
            }}
          >
            Copy all leagues JSON
          </Button>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste league JSON to import…"
            rows={5}
            className="mb-2 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-xs text-slate-200"
          />
          <Button size="sm" onClick={handleImport}>
            Import JSON
          </Button>
        </div>
      </div>
    </LeagueHqShell>
  );
}
