'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FaTrophy, FaUsers, FaMedal, FaCrown, FaRedo } from 'react-icons/fa';

interface PlayerStat {
  id: string;
  name: string;
  rank: number;
  points: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
}

interface PodResult {
  playerName: string;
  place: number;
  points: number;
}

interface Pod {
  pod: string;
  date: string;
  round: number | null;
  results: PodResult[];
}

interface Wave1Data {
  players: PlayerStat[];
  pods: Pod[];
}

interface Wave1PodResultsProps {
  leagueId: string | undefined | null;
}

export const Wave1PodResults: React.FC<Wave1PodResultsProps> = ({ leagueId }) => {
  const [data, setData] = useState<Wave1Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!leagueId) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/leagues/${leagueId}/wave1`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!leagueId) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center text-slate-400">
          Select a league to view players and pod results.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div
        className="flex justify-center py-12"
        role="status"
        aria-label="Loading pod results"
        aria-busy="true"
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 flex flex-col items-center gap-3">
          <p className="text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData()}
            className="border-amber-400 text-amber-400 hover:bg-amber-900/30"
          >
            <FaRedo className="w-4 h-4 mr-2" aria-hidden />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || (data.players.length === 0 && data.pods.length === 0)) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400 mb-4">No players or games yet.</p>
          <p className="text-slate-500 text-sm mb-4">
            Run <code className="bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">npm run prisma:seed:games</code> or add games via Edit.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData()}
            className="border-amber-400 text-amber-400 hover:bg-amber-900/30"
          >
            <FaRedo className="w-4 h-4 mr-2" aria-hidden />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8" role="region" aria-label="Players and Wave 1 pod results" aria-busy="false">
      {/* Header with refresh */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 id="wave1-heading" className="text-xl font-bold text-white">
          Players &amp; Wave 1 Pod Results
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData()}
          className="border-amber-400 text-amber-400 hover:bg-amber-900/30 shrink-0"
          aria-label="Refresh player stats and pod results"
        >
          <FaRedo className="w-4 h-4 mr-2" aria-hidden />
          Refresh
        </Button>
      </div>

      {/* Player Stats */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2" id="player-stats-heading">
          <FaUsers className="w-5 h-5 text-amber-400" aria-hidden />
          Player Stats
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-600">
          <table className="w-full min-w-[480px] border-collapse" aria-labelledby="player-stats-heading">
            <thead>
              <tr className="border-b border-slate-600 bg-slate-700/50">
                <th scope="col" className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Rank</th>
                <th scope="col" className="text-left py-3 px-4 text-slate-300 font-semibold text-sm">Player</th>
                <th scope="col" className="text-right py-3 px-4 text-slate-300 font-semibold text-sm">Total VP</th>
                <th scope="col" className="text-right py-3 px-4 text-slate-300 font-semibold text-sm">Games</th>
                <th scope="col" className="text-right py-3 px-4 text-slate-300 font-semibold text-sm">W–L</th>
                <th scope="col" className="text-right py-3 px-4 text-slate-300 font-semibold text-sm">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.players.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-700/80 hover:bg-slate-700/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    {p.rank <= 3 ? (
                      <span className="flex items-center gap-1.5">
                        {p.rank === 1 && <FaCrown className="w-4 h-4 text-yellow-400" aria-hidden />}
                        {p.rank === 2 && <FaMedal className="w-4 h-4 text-gray-300" aria-hidden />}
                        {p.rank === 3 && <FaTrophy className="w-4 h-4 text-amber-600" aria-hidden />}
                        #{p.rank}
                      </span>
                    ) : (
                      <span className="text-slate-400">#{p.rank}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{p.name}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-400">{p.points}</td>
                  <td className="py-3 px-4 text-right text-blue-400">{p.gamesPlayed}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{p.wins}W–{p.losses}L</td>
                  <td className="py-3 px-4 text-right font-medium text-green-400">{p.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wave 1 Pod Results */}
      {data.pods.length > 0 && (
        <div>
          <h3 id="wave1-pods-heading" className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaTrophy className="w-5 h-5 text-amber-400" aria-hidden />
            Wave 1 — Game 1 per Pod
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.pods.map((pod) => (
              <Card key={pod.pod} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center justify-between">
                    <span>Pod {pod.pod}</span>
                    <span className="text-slate-400 font-normal text-sm">{pod.date}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm" aria-label={`Pod ${pod.pod} results`}>
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-1.5 text-slate-400 font-medium">#</th>
                        <th className="text-left py-1.5 text-slate-400 font-medium">Player</th>
                        <th className="text-right py-1.5 text-slate-400 font-medium">VP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pod.results.map((r, i) => (
                        <tr key={i} className="border-b border-slate-700/60 last:border-0">
                          <td className="py-1.5 text-slate-300">
                            {r.place === 1 && <FaCrown className="w-3.5 h-3.5 text-yellow-400 inline mr-1" aria-hidden />}
                            {r.place}
                          </td>
                          <td className="py-1.5 text-white font-medium">{r.playerName}</td>
                          <td className="py-1.5 text-right text-amber-400 font-semibold">{r.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
