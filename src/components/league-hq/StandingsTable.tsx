'use client';

import React from 'react';
import type { StandingsRow } from '@/lib/league-hq';

interface StandingsTableProps {
  rows: StandingsRow[];
  compact?: boolean;
  disclaimer?: string;
}

export function StandingsTable({ rows, compact = false, disclaimer }: StandingsTableProps) {
  return (
    <div>
      {disclaimer && (
        <p className="mb-4 text-center text-xs text-amber-300/70">{disclaimer}</p>
      )}
      <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700/80 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium w-12">#</th>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium text-right tabular-nums">CMD</th>
              <th className="px-4 py-3 font-medium text-right tabular-nums">DFT</th>
              <th className="px-4 py-3 font-medium text-right tabular-nums text-amber-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-slate-800/60 last:border-0 ${
                  row.rank <= 3 && !compact ? 'bg-amber-950/10' : ''
                }`}
              >
                <td className="px-4 py-3 tabular-nums text-slate-500">{row.rank}</td>
                <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-300">{row.commanderPoints}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-300">{row.draftPoints}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-300">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No players yet. Add them on the Leagues page.</p>
        )}
      </div>
    </div>
  );
}
