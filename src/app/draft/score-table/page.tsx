'use client';

import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  FaTable,
  FaDice,
  FaUsers,
  FaArrowLeft,
  FaSyncAlt,
  FaEdit,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';

const TOTAL_ROUNDS = 4;
const EXPECTED_PARTICIPANTS = 16;

type Draft = { id: string; name: string; format: string; date: string; status: string; maxParticipants: number; participants?: unknown[] };
type Participant = {
  id: string;
  seatNumber: number;
  user: { id: string; name: string | null; email: string };
};
type Match = {
  id: string;
  round: number;
  gamesWon1: number;
  gamesWon2: number;
  participant1: Participant;
  participant2: Participant;
};
type Standing = {
  participantId: string;
  name: string;
  matchWins: number;
  matchLosses: number;
  gamesWon: number;
  gamesLost: number;
  matchPoints: number;
};

function DraftScoreTableContent() {
  const searchParams = useSearchParams();
  const draftIdFromUrl = useMemo(() => searchParams.get('draftId'), [searchParams]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [leagues, setLeagues] = useState<Array<{ id: string; name: string }>>([]);
  const [leaguePlayers, setLeaguePlayers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [scoreTable, setScoreTable] = useState<{
    draft: Draft;
    participants: Participant[];
    matches: Match[];
    standings: Standing[];
    totalRounds: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingParticipants, setSettingParticipants] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState({ g1: 0, g2: 0 });
  const [showImportScores, setShowImportScores] = useState(false);
  const [importScoresText, setImportScoresText] = useState('');
  const [importingScores, setImportingScores] = useState(false);
  const [showImportStandings, setShowImportStandings] = useState(false);
  const [importStandingsText, setImportStandingsText] = useState(
    `Zach 6\nNate 5\nAaron H 5\nJames 4\nTre 4\nTim 5\nKevin 4\nTravis 3\nAaron V 3\nScott 3\nKaipo 3\nApril 2\nRonnie 2\nAaron S 2\nKendra 1\nDustin 1`
  );
  const [importingStandings, setImportingStandings] = useState(false);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/drafts', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch {
      setDrafts([]);
    }
  }, []);

  const fetchLeagues = useCallback(async () => {
    try {
      const res = await fetch('/api/leagues');
      if (!res.ok) return;
      const data = await res.json();
      setLeagues(data.leagues?.map((l: { id: string; name: string }) => ({ id: l.id, name: l.name })) || []);
    } catch {
      setLeagues([]);
    }
  }, []);

  const fetchLeaguePlayers = useCallback(async (leagueId: string) => {
    if (!leagueId) return;
    try {
      const res = await fetch(`/api/admin/players?leagueId=${leagueId}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.players || [];
      setLeaguePlayers(list.map((p: { id: string; name: string; email: string }) => ({ id: p.id, name: p.name || p.email, email: p.email })));
    } catch {
      setLeaguePlayers([]);
    }
  }, []);

  const fetchScoreTable = useCallback(async (draftId: string) => {
    if (!draftId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drafts/${draftId}/score-table`, { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) toast.error('Login required');
        setScoreTable(null);
        return;
      }
      const data = await res.json();
      setScoreTable({
        draft: data.draft,
        participants: data.participants || [],
        matches: data.matches || [],
        standings: data.standings || [],
        totalRounds: data.totalRounds ?? TOTAL_ROUNDS,
      });
    } catch {
      setScoreTable(null);
      toast.error('Failed to load score table');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
    fetchLeagues();
  }, [fetchDrafts, fetchLeagues]);

  useEffect(() => {
    if (draftIdFromUrl && !selectedDraftId) setSelectedDraftId(draftIdFromUrl);
  }, [draftIdFromUrl, selectedDraftId]);

  useEffect(() => {
    if (selectedDraftId) fetchScoreTable(selectedDraftId);
    else setScoreTable(null);
  }, [selectedDraftId, fetchScoreTable]);

  useEffect(() => {
    if (selectedLeagueId) fetchLeaguePlayers(selectedLeagueId);
    else setLeaguePlayers([]);
  }, [selectedLeagueId, fetchLeaguePlayers]);

  const handleSetParticipants = async () => {
    if (selectedPlayerIds.length !== EXPECTED_PARTICIPANTS || !selectedDraftId) {
      toast.error(`Select exactly ${EXPECTED_PARTICIPANTS} players`);
      return;
    }
    setSettingParticipants(true);
    try {
      const res = await fetch(`/api/admin/drafts/${selectedDraftId}/score-table`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantUserIds: selectedPlayerIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to set participants');
        return;
      }
      toast.success('Participants set');
      setShowAddParticipants(false);
      setSelectedPlayerIds([]);
      fetchScoreTable(selectedDraftId);
    } catch {
      toast.error('Failed to set participants');
    } finally {
      setSettingParticipants(false);
    }
  };

  const handleGeneratePairings = async () => {
    if (!selectedDraftId) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/drafts/${selectedDraftId}/score-table/generate-pairings`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to generate pairings');
        return;
      }
      toast.success('Pairings generated (4 rounds, best of 3)');
      fetchScoreTable(selectedDraftId);
    } catch {
      toast.error('Failed to generate pairings');
    } finally {
      setGenerating(false);
    }
  };

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < EXPECTED_PARTICIPANTS ? [...prev, id] : prev
    );
  };

  const handleSaveMatchResult = async () => {
    if (!editingMatchId || !selectedDraftId) return;
    const m = scoreTable?.matches.find(x => x.id === editingMatchId);
    if (!m) return;
    try {
      const res = await fetch(`/api/admin/drafts/${selectedDraftId}/matches/${editingMatchId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gamesWon1: editScore.g1, gamesWon2: editScore.g2 }),
      });
      if (!res.ok) {
        toast.error('Failed to save result');
        return;
      }
      toast.success('Result saved');
      setEditingMatchId(null);
      fetchScoreTable(selectedDraftId);
    } catch {
      toast.error('Failed to save result');
    }
  };

  const parseImportScores = (text: string): Array<{ matchId: string; gamesWon1: number; gamesWon2: number }> => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const arr = JSON.parse(trimmed) as unknown[];
        return arr
          .filter((x): x is { matchId?: string; gamesWon1?: number; gamesWon2?: number } => x != null && typeof x === 'object')
          .map(x => ({
            matchId: String(x.matchId ?? ''),
            gamesWon1: Number(x.gamesWon1) || 0,
            gamesWon2: Number(x.gamesWon2) || 0,
          }))
          .filter(x => x.matchId);
      } catch {
        return [];
      }
    }
    return trimmed
      .split(/\r?\n/)
      .map(line => {
        const parts = line.split(/[\t,]/).map(s => s.trim());
        if (parts.length >= 3) {
          const matchId = parts[0];
          const g1 = parseInt(parts[1], 10) || 0;
          const g2 = parseInt(parts[2], 10) || 0;
          return { matchId, gamesWon1: g1, gamesWon2: g2 };
        }
        return null;
      })
      .filter((x): x is { matchId: string; gamesWon1: number; gamesWon2: number } => x != null && !!x.matchId);
  };

  const handleImportScores = async () => {
    if (!selectedDraftId || !scoreTable) return;
    const results = parseImportScores(importScoresText);
    if (results.length === 0) {
      toast.error('Paste JSON array or CSV (matchId, gamesWon1, gamesWon2) per line');
      return;
    }
    setImportingScores(true);
    try {
      const res = await fetch(`/api/admin/drafts/${selectedDraftId}/score-table/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ results }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to import scores');
        return;
      }
      toast.success(data.message || `Updated ${data.updated ?? results.length} match(es)`);
      setShowImportScores(false);
      setImportScoresText('');
      await fetchScoreTable(selectedDraftId);
    } finally {
      setImportingScores(false);
    }
  };

  const parseStandingsText = (text: string): Array<{ name: string; score: number }> => {
    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const match = line.match(/^(.*?)\s*(\d+)\s*$/);
        if (match) {
          return { name: match[1]!.trim(), score: parseInt(match[2]!, 10) || 0 };
        }
        return null;
      })
      .filter((x): x is { name: string; score: number } => x != null && x.name.length > 0);
  };

  const handleImportStandings = async () => {
    if (!selectedDraftId) return;
    const standings = parseStandingsText(importStandingsText);
    if (standings.length !== 16) {
      toast.error('Enter exactly 16 lines: "Name score" (e.g. Kendra 1)');
      return;
    }
    setImportingStandings(true);
    try {
      const res = await fetch(`/api/admin/drafts/${selectedDraftId}/score-table/import-standings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ standings }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to import standings');
        return;
      }
      toast.success(data.message || 'Standings imported.');
      setShowImportStandings(false);
      await fetchScoreTable(selectedDraftId);
    } finally {
      setImportingStandings(false);
    }
  };

  const matchesByRound =
    scoreTable?.matches.reduce<Record<number, Match[]>>((acc, m) => {
      if (!acc[m.round]) acc[m.round] = [];
      acc[m.round].push(m);
      return acc;
    }, {}) ?? {};

  const name = (p: Participant) => p?.user?.name || p?.user?.email || '—';

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/wizards"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Wizards
          </Link>
        </div>

        <Card className="bg-slate-800/90 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FaTable className="w-5 h-5" />
              Draft Score Table
            </CardTitle>
            <CardDescription className="text-gray-300">
              16 players, 4 rounds, 1v1 best of 3. Tournament-style pairings. Enter results when the event is finished.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-300 mb-1">Draft event</label>
                <select
                  value={selectedDraftId}
                  onChange={e => setSelectedDraftId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select a draft</option>
                  {drafts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {new Date(d.date).toLocaleDateString()} ({(d.participants?.length ?? 0)}/{d.maxParticipants})
                    </option>
                  ))}
                </select>
              </div>
              {scoreTable && (
                <>
                  {scoreTable.participants.length === 0 && (
                    <Button
                      onClick={() => setShowAddParticipants(true)}
                      className="shrink-0"
                    >
                      <FaUsers className="w-4 h-4 mr-2" />
                      Add 16 players
                    </Button>
                  )}
                  {scoreTable.participants.length === EXPECTED_PARTICIPANTS && scoreTable.matches.length === 0 && (
                    <Button
                      onClick={handleGeneratePairings}
                      disabled={generating}
                      className="shrink-0"
                    >
                      {generating ? (
                        <FaSyncAlt className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FaDice className="w-4 h-4 mr-2" />
                      )}
                      Generate pairings (4 rounds)
                    </Button>
                  )}
                  {scoreTable.matches.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowImportStandings(true)}
                        className="shrink-0"
                      >
                        Import standings (name + score)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowImportScores(true)}
                        className="shrink-0"
                      >
                        Import scores
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <FaSyncAlt className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            )}

            {!loading && scoreTable && scoreTable.participants.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-semibold text-white mb-2">Standings</h3>
                  <table className="w-full border border-slate-600 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-700 text-left">
                        <th className="px-4 py-2 text-gray-200">#</th>
                        <th className="px-4 py-2 text-gray-200">Player</th>
                        <th className="px-4 py-2 text-center text-gray-200">Points earned (draft games)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreTable.standings.map((s, i) => (
                        <tr key={s.participantId} className="border-t border-slate-600 bg-slate-800/50">
                          <td className="px-4 py-2 text-gray-300">{i + 1}</td>
                          <td className="px-4 py-2 text-white">{s.name}</td>
                          <td className="px-4 py-2 text-center font-medium text-amber-400">{s.matchPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {[1, 2, 3, 4].map(round => (
                  <div key={round} className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Round {round}</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(matchesByRound[round] || []).map(m => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-white truncate block">{name(m.participant1)}</span>
                            <span className="text-gray-400 text-sm">vs</span>
                            <span className="text-white truncate block">{name(m.participant2)}</span>
                          </div>
                          <div className="shrink-0 ml-3">
                            {editingMatchId === m.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={3}
                                  value={editScore.g1}
                                  onChange={e => setEditScore(prev => ({ ...prev, g1: parseInt(e.target.value, 10) || 0 }))}
                                  className="w-12 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={3}
                                  value={editScore.g2}
                                  onChange={e => setEditScore(prev => ({ ...prev, g2: parseInt(e.target.value, 10) || 0 }))}
                                  className="w-12 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
                                />
                                <Button size="sm" onClick={handleSaveMatchResult}>
                                  <FaCheck className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingMatchId(null)}>
                                  <FaTimes className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-amber-400 font-mono tabular-nums">
                                  {m.gamesWon1 === 0 && m.gamesWon2 === 0 ? '— —' : `${m.gamesWon1}-${m.gamesWon2}`}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingMatchId(m.id);
                                    setEditScore({ g1: m.gamesWon1, g2: m.gamesWon2 });
                                  }}
                                  title="Enter result (best of 3)"
                                >
                                  <FaEdit className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {!loading && scoreTable && scoreTable.participants.length === 0 && selectedDraftId && (
              <p className="text-gray-400 py-4">
                This draft has no participants yet. Click &quot;Add 16 players&quot; and select players from a league.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showAddParticipants}
        onClose={() => {
          setShowAddParticipants(false);
          setSelectedPlayerIds([]);
        }}
        title="Add 16 players"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">League</label>
            <select
              value={selectedLeagueId}
              onChange={e => setSelectedLeagueId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select league</option>
              {leagues.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Players ({selectedPlayerIds.length}/{EXPECTED_PARTICIPANTS})
            </label>
            <div className="max-h-64 overflow-y-auto border border-slate-600 rounded-lg p-2 bg-slate-800">
              {leaguePlayers.map(p => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlayerIds.includes(p.id)}
                    onChange={() => togglePlayer(p.id)}
                    className="rounded border-slate-600 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-white">{p.name || p.email}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowAddParticipants(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSetParticipants}
              disabled={selectedPlayerIds.length !== EXPECTED_PARTICIPANTS || settingParticipants}
            >
              {settingParticipants ? 'Saving…' : `Set ${EXPECTED_PARTICIPANTS} participants`}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportScores}
        onClose={() => {
          setShowImportScores(false);
          setImportScoresText('');
        }}
        title="Import 1v1 scores"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Paste new data as JSON or CSV. JSON: array of objects with <code className="text-amber-400">matchId</code>,{' '}
            <code className="text-amber-400">gamesWon1</code>, <code className="text-amber-400">gamesWon2</code>. CSV:
            one line per match: <code className="text-amber-400">matchId,gamesWon1,gamesWon2</code>.
          </p>
          <textarea
            value={importScoresText}
            onChange={e => setImportScoresText(e.target.value)}
            placeholder='[{"matchId":"...","gamesWon1":2,"gamesWon2":1},...]'
            rows={8}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowImportScores(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportScores} disabled={importingScores || !importScoresText.trim()}>
              {importingScores ? 'Importing…' : 'Import scores'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportStandings}
        onClose={() => setShowImportStandings(false)}
        title="Import standings (name + score)"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Enter exactly 16 lines: <code className="text-amber-400">Name score</code> (e.g. Kendra 1). Scores are converted to match wins and all match results are updated.
          </p>
          <textarea
            value={importStandingsText}
            onChange={e => setImportStandingsText(e.target.value)}
            placeholder="Kendra 1\nApril 2\n..."
            rows={18}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowImportStandings(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportStandings} disabled={importingStandings || !importStandingsText.trim()}>
              {importingStandings ? 'Importing…' : 'Import standings'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DraftScoreTablePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><LoadingSpinner /></div>}>
      <DraftScoreTableContent />
    </Suspense>
  );
}
