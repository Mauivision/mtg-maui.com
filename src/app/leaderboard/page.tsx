'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useLeague } from '@/contexts/LeagueContext';
import {
  FaTrophy,
  FaMedal,
  FaAward,
  FaChartLine,
  FaCrown,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaCalendar,
  FaUsers,
  FaClock,
  FaDice,
  FaEdit,
  FaRedo,
} from 'react-icons/fa';
import { RealtimeLeaderboard } from '@/components/leaderboard/RealtimeLeaderboard';
import { EditableLeaderboardTable } from '@/components/admin/EditableLeaderboardTable';
import { LeagueStatus } from '@/components/league/LeagueStatus';
import { usePageContent } from '@/contexts/PageContentContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import dynamic from 'next/dynamic';
import type { 
  TraditionalLeaderboardEntry, 
  ScoringRules, 
  PlayerGameHistory 
} from '@/types/leaderboard';

// Default scoring rules configuration (fallback)
const defaultScoringRules = {
  goldObjective: 5,
  silverObjective: 2,
  placementBonus: {
    1: 0, // Winner already gets gold
    2: 1,
    3: 1,
    4: 1,
  },
};

export default function LeaderboardPage() {
  const { currentLeague, loading: leagueLoading } = useLeague();
  const { getPage } = usePageContent();
  const leaderboardPage = getPage('/leaderboard');
  const [leaderboard, setLeaderboard] = useState<TraditionalLeaderboardEntry[]>([]);
  const [allLeaderboardData, setAllLeaderboardData] = useState<TraditionalLeaderboardEntry[]>([]); // Store all data for filtering
  const [scoringRules, setScoringRules] = useState<ScoringRules>(defaultScoringRules);
  const [selectedPlayer, setSelectedPlayer] = useState<TraditionalLeaderboardEntry | null>(null);
  const [playerGameHistory, setPlayerGameHistory] = useState<PlayerGameHistory[]>([]);
  const [loadingGameHistory, setLoadingGameHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameType, setGameType] = useState<'all' | 'commander' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'points' | 'winRate' | 'gamesPlayed' | 'recentForm'>(
    'points'
  );
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'season'>('all');
  const [commanderFilter, setCommanderFilter] = useState<string>('all');
  const [leaderboardTab, setLeaderboardTab] = useState<string>('realtime');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const applyFilters = useCallback((data: TraditionalLeaderboardEntry[]) => {
    let filtered = [...data];

    // Apply date range filter (simplified - would need game dates in real implementation)
    // For now, we'll just pass through as we don't have date data in the current response

    // Apply commander filter (would need commander data in response)
    // For now, we'll just pass through

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'points':
          if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
          }
          return a.averagePlacement - b.averagePlacement;
        case 'winRate':
          const aWinRate = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
          const bWinRate = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
          if (bWinRate !== aWinRate) {
            return bWinRate - aWinRate;
          }
          return b.totalPoints - a.totalPoints;
        case 'gamesPlayed':
          if (b.gamesPlayed !== a.gamesPlayed) {
            return b.gamesPlayed - a.gamesPlayed;
          }
          return b.totalPoints - a.totalPoints;
        case 'recentForm':
          const aRecentWins = a.recentForm?.filter((r) => r === 'W').length || 0;
          const bRecentWins = b.recentForm?.filter((r) => r === 'W').length || 0;
          if (bRecentWins !== aRecentWins) {
            return bRecentWins - aRecentWins;
          }
          return b.totalPoints - a.totalPoints;
        default:
          return 0;
      }
    });

    // Re-assign ranks after sorting
    filtered = filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    setLeaderboard(filtered);
  }, [sortBy]);

  const fetchLeaderboard = useCallback(async () => {
    if (!currentLeague) return;

    setLoading(true);
    try {
      const gameTypeParam = gameType !== 'all' ? `?gameType=${gameType}` : '';
      const response = await fetch(`/api/leagues/${currentLeague.id}/leaderboard${gameTypeParam}`);

      if (response.ok) {
        const data = await response.json();
        const entries = data.entries || [];
        setAllLeaderboardData(entries);
        // Apply initial filters
        applyFilters(entries);
      } else {
        setLeaderboard([]);
        setAllLeaderboardData([]);
      }
    } catch (error) {
      logger.error('Error fetching leaderboard', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, [currentLeague, gameType, applyFilters]);

  const fetchScoringRules = useCallback(async () => {
    if (!currentLeague) return;

    try {
      const response = await fetch(
        `/api/admin/scoring-rules?leagueId=${currentLeague.id}&gameType=commander`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.scoringRules && data.scoringRules.length > 0) {
          // Transform API response to match our display format
          const rules = data.scoringRules.reduce(
            (acc: ScoringRules, rule: { name?: string; points?: number }) => {
              if (rule.name === 'Gold Objective' && rule.points !== undefined) {
                acc.goldObjective = rule.points;
              }
              if (rule.name === 'Silver Objective' && rule.points !== undefined) {
                acc.silverObjective = rule.points;
              }
              if (rule.name?.includes('Placement') && rule.points !== undefined) {
                const place = parseInt(rule.name.match(/\d+/)?.[0] || '1');
                acc.placementBonus[place] = rule.points;
              }
              return acc;
            },
            { ...defaultScoringRules }
          );
          setScoringRules(rules);
        } else {
          // Use default rules if none configured
          setScoringRules(defaultScoringRules);
        }
      } else {
        // Fallback to default rules
        setScoringRules(defaultScoringRules);
      }
    } catch (error) {
      logger.error('Error fetching scoring rules', error);
      // Fallback to default rules on error
      setScoringRules(defaultScoringRules);
    }
  }, [currentLeague]);

  useEffect(() => {
    if (currentLeague && !leagueLoading) {
      fetchLeaderboard();
      fetchScoringRules();
    }
  }, [gameType, currentLeague, leagueLoading, fetchLeaderboard, fetchScoringRules]);

  const refreshLeaderboard = useCallback(async () => {
    if (!currentLeague) return;
    await fetchLeaderboard();
    await fetchScoringRules();
    setLastUpdated(new Date());
  }, [currentLeague, fetchLeaderboard, fetchScoringRules]);

  const prevTabRef = React.useRef<string>(leaderboardTab);
  useEffect(() => {
    const switchedToTraditional =
      prevTabRef.current !== 'traditional' && leaderboardTab === 'traditional';
    prevTabRef.current = leaderboardTab;
    if (switchedToTraditional && currentLeague) {
      refreshLeaderboard();
    }
  }, [leaderboardTab, currentLeague, refreshLeaderboard]);

  useEffect(() => {
    if (leaderboardTab !== 'traditional' || !currentLeague) return;
    const interval = setInterval(refreshLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [leaderboardTab, currentLeague, refreshLeaderboard]);

  // Fetch player game history when player is selected
  const fetchPlayerGameHistory = useCallback(async () => {
    if (!selectedPlayer || !currentLeague) return;

    setLoadingGameHistory(true);
    try {
      const response = await fetch(
        `/api/players/${selectedPlayer.playerId}/games?leagueId=${currentLeague.id}&gameType=${gameType}&limit=20`
      );

      if (response.ok) {
        const data = await response.json();
        setPlayerGameHistory(data.games || []);
      } else {
        setPlayerGameHistory([]);
      }
    } catch (error) {
      logger.error('Error fetching player game history', error);
      setPlayerGameHistory([]);
    } finally {
      setLoadingGameHistory(false);
    }
  }, [selectedPlayer, currentLeague, gameType]);

  // Fetch game history when player is selected
  useEffect(() => {
    if (selectedPlayer && currentLeague) {
      fetchPlayerGameHistory();
    } else {
      setPlayerGameHistory([]);
    }
  }, [selectedPlayer, currentLeague, gameType, fetchPlayerGameHistory]);

  // Apply filters when filter state changes
  useEffect(() => {
    if (allLeaderboardData.length > 0) {
      applyFilters(allLeaderboardData);
    }
  }, [sortBy, dateRange, commanderFilter, gameType, applyFilters, allLeaderboardData]);

  // Get available commanders from leaderboard data
  const availableCommanders = useMemo(() => {
    // This would come from actual data - for now return empty array
    // In real implementation, extract unique commanders from game data
    return [];
  }, []);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Player',
      'Points',
      'Games',
      'Wins',
      'Win Rate',
      'Avg Placement',
      'Recent Form',
    ];
    const rows = leaderboard.map(entry => {
      const winRate =
        entry.gamesPlayed > 0 ? ((entry.wins / entry.gamesPlayed) * 100).toFixed(1) : '0.0';
      const recentForm = entry.recentForm?.join('') || '';
      return [
        entry.rank,
        entry.playerName,
        entry.totalPoints,
        entry.gamesPlayed,
        entry.wins,
        `${winRate}%`,
        entry.averagePlacement.toFixed(2),
        recentForm,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leaderboard-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF using jsPDF
  const handleExportPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Set up PDF document
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;
      const margin = 20;
      const lineHeight = 7;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('MTG Maui League Leaderboard', margin, yPosition);
      yPosition += 10;

      // League info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      if (currentLeague) {
        doc.text(`League: ${currentLeague.name}`, margin, yPosition);
        yPosition += lineHeight;
      }
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += lineHeight;
      if (gameType !== 'all') {
        doc.text(
          `Game Type: ${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`,
          margin,
          yPosition
        );
        yPosition += lineHeight;
      }
      yPosition += 5;

      // Table headers
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const headers = ['Rank', 'Player', 'Points', 'Games', 'Wins', 'Win Rate', 'Avg Place'];
      const colWidths = [15, 70, 20, 20, 20, 25, 25];
      let xPosition = margin;

      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += lineHeight;

      // Draw line under headers
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      yPosition += 3;

      // Table rows
      doc.setFont('helvetica', 'normal');
      leaderboard.forEach((entry, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        const winRate =
          entry.gamesPlayed > 0 ? ((entry.wins / entry.gamesPlayed) * 100).toFixed(1) : '0.0';
        const rowData = [
          entry.rank.toString(),
          entry.playerName || 'Unknown',
          entry.totalPoints.toString(),
          entry.gamesPlayed.toString(),
          entry.wins.toString(),
          `${winRate}%`,
          entry.averagePlacement.toFixed(2),
        ];

        xPosition = margin;
        rowData.forEach((cell, cellIndex) => {
          doc.text(cell, xPosition, yPosition);
          xPosition += colWidths[cellIndex];
        });

        yPosition += lineHeight;
      });

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${totalPages} - MTG Maui League`, pageWidth / 2, pageHeight - 10, {
          align: 'center',
        });
      }

      // Save PDF
      doc.save(
        `leaderboard-${currentLeague?.name || 'mtg-maui'}-${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error) {
      logger.error('Error generating PDF', error);
      alert('Failed to generate PDF. Please try again or use CSV export.');
    }
  };

  // Calculate rank change (would need previous rank data)
  const getRankChange = (currentRank: number, previousRank?: number) => {
    if (!previousRank) return null;
    if (currentRank < previousRank) return 'up';
    if (currentRank > previousRank) return 'down';
    return 'same';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <FaMedal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <FaAward className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getTrendMeta = (form: Array<'W' | 'L' | 'D'> | undefined) => {
    const f = form ?? [];
    const wins = f.filter((r) => r === 'W').length;
    const total = f.length;
    const pct = total > 0 ? wins / total : 0;
    let label = 'Struggling';
    let badgeClass = 'border-red-500/40 text-red-300 bg-red-900/40';
    if (pct >= 0.8) {
      label = 'Hot Streak';
      badgeClass = 'border-emerald-500/40 text-emerald-300 bg-emerald-900/40';
    } else if (pct >= 0.6) {
      label = 'Good Form';
      badgeClass = 'border-blue-500/40 text-blue-300 bg-blue-900/40';
    } else if (pct >= 0.4) {
      label = 'Average';
      badgeClass = 'border-amber-500/40 text-amber-300 bg-amber-900/40';
    }
    return { label, badgeClass };
  };

  // Temporarily bypass league loading to show leaderboard
  // if (leagueLoading) {
  //   return (
  //     <div className="min-h-screen py-8 flex items-center justify-center">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  // Show leaderboard even without a specific league (general leaderboard)

  return (
    <div className="min-h-screen static-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 static-page-content">
        {/* Hero — Arena */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
            🏆 {leaderboardPage?.title ?? 'League Leaderboard'}
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-6 animate-fade-in-delayed">
            {leaderboardPage?.description ?? 'Track your progress and see how you stack up. Real-time rankings and comprehensive statistics.'}
          </p>
        </div>

        <div className="mb-8">
          <LeagueStatus leagueId={currentLeague?.id} />
        </div>

        <Tabs
          value={leaderboardTab}
          onValueChange={(v) => setLeaderboardTab(v)}
          className="mb-8"
        >
          <div className="flex justify-center mb-6">
            <TabsList className="bg-slate-800/80 border border-slate-700/50 p-1.5 rounded-xl">
              <TabsTrigger value="realtime">🔴 Live Rankings</TabsTrigger>
              <TabsTrigger value="traditional">📊 Detailed Stats</TabsTrigger>
              <TabsTrigger value="edit">✏️ Edit Scores</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="realtime">
            <RealtimeLeaderboard leagueId={currentLeague?.id} />
          </TabsContent>

          <TabsContent value="traditional">
            <Card className="card-arena mb-8 border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <FaChartLine className="w-5 h-5 mr-2 text-amber-400" />
                  Current Scoring Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-400 mb-2">
                      {scoringRules.goldObjective}
                    </div>
                    <div className="text-sm text-slate-400">Gold Objective</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {scoringRules.silverObjective}
                    </div>
                    <div className="text-sm text-slate-400">Per Silver Objective</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-2xl font-bold text-emerald-400 mb-2">1-3</div>
                    <div className="text-sm text-slate-400">Placement Bonus</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Filters */}
            <LeaderboardFilters
              gameType={gameType}
              onGameTypeChange={setGameType}
              sortBy={sortBy}
              onSortChange={setSortBy}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              commanderFilter={commanderFilter}
              onCommanderChange={setCommanderFilter}
              availableCommanders={availableCommanders}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              onRefresh={refreshLeaderboard}
            />

            <Card className="card-arena border-amber-500/20">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-white">Current Standings</CardTitle>
                  {lastUpdated && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <FaClock className="w-4 h-4" />
                      Updated {lastUpdated.toLocaleTimeString()}
                      {' · '}
                      <span className="text-green-400">Auto-refresh 60s</span>
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                    <span className="ml-2 text-slate-400">Loading leaderboard...</span>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <FaTrophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No players yet</p>
                    <p className="text-gray-500 text-sm">Be the first to join the league!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-200">Rank</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-200">
                            Player
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-200">
                            Points
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-200">
                            Games
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-200">
                            Wins
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-200">
                            Win Rate
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-200">
                            Avg Place
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-200">
                            Form
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-200">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {leaderboard.map((entry, index) => {
                          const gp = entry.gamesPlayed ?? 0;
                          const winRate = gp > 0 ? (entry.wins / gp) * 100 : 0;
                          const rankChange = getRankChange(entry.rank, entry.previousRank ?? entry.rank);
                          const trend = getTrendMeta(entry.recentForm);
                          return (
                            <tr
                              key={entry.id || index}
                              className="hover:bg-slate-700/30 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {getRankIcon(entry.rank)}
                                  {rankChange === 'up' && (
                                    <FaArrowUp
                                      className="w-3 h-3 text-green-500"
                                      title="Rank improved"
                                    />
                                  )}
                                  {rankChange === 'down' && (
                                    <FaArrowDown
                                      className="w-3 h-3 text-red-500"
                                      title="Rank decreased"
                                    />
                                  )}
                                  {rankChange === 'same' && (
                                    <FaMinus
                                      className="w-3 h-3 text-gray-500"
                                      title="Rank unchanged"
                                    />
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <button
                                  onClick={() => setSelectedPlayer(entry)}
                                  className="font-medium text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                                >
                                  {entry.playerName}
                                </button>
                              </td>
                              <td className="py-4 px-6 text-center font-semibold text-white">
                                {entry.totalPoints}
                              </td>
                              <td className="py-4 px-6 text-center text-gray-300">
                                {entry.gamesPlayed}
                              </td>
                              <td className="py-4 px-6 text-center text-gray-300">{entry.wins}</td>
                              <td className="py-4 px-6 text-center text-gray-300">
                                <span
                                  className={
                                    winRate >= 60
                                      ? 'text-green-400 font-semibold'
                                      : winRate >= 40
                                        ? 'text-yellow-400'
                                        : 'text-red-400'
                                  }
                                >
                                  {winRate.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center text-gray-300">
                                {typeof entry.averagePlacement === 'number' &&
                                !Number.isNaN(entry.averagePlacement)
                                  ? entry.averagePlacement.toFixed(2)
                                  : '0.00'}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex justify-center space-x-1">
                                  {(entry.recentForm ?? [])
                                    .slice(-5)
                                    .map((result: string, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant={result === 'W' ? 'default' : 'secondary'}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                          result === 'W'
                                            ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/40'
                                            : 'bg-red-900/50 text-red-300 border-red-500/40'
                                        }`}
                                      >
                                        {result}
                                      </Badge>
                                    ))}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <Badge variant="outline" className={trend.badgeClass}>
                                  {trend.label}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            <Card className="card-arena border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <FaEdit className="w-5 h-5 mr-2 text-amber-400" />
                  Edit Player Scores
                </CardTitle>
                <p className="text-sm text-slate-400">
                  Double-click any cell to edit. Use +/- on numbers when available. Save when done.
                </p>
              </CardHeader>
              <CardContent>
                {currentLeague?.id ? (
                  <EditableLeaderboardTable leagueId={currentLeague.id} />
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FaTrophy className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p>Select or create a league to edit scores.</p>
                    <p className="text-sm mt-2">League data loads from the header or admin.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Player Detail Modal */}
        {selectedPlayer && (
          <Modal
            isOpen={!!selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
            title={`${selectedPlayer.playerName}'s Game History`}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{selectedPlayer.totalPoints}</div>
                  <div className="text-sm text-slate-400">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {selectedPlayer.gamesPlayed}
                  </div>
                  <div className="text-sm text-slate-400">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{selectedPlayer.wins}</div>
                  <div className="text-sm text-slate-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {typeof selectedPlayer.averagePlacement === 'number' &&
                    !Number.isNaN(selectedPlayer.averagePlacement)
                      ? selectedPlayer.averagePlacement.toFixed(1)
                      : '0.0'}
                  </div>
                  <div className="text-sm text-slate-400">Avg Placement</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Recent Games</h3>
                {loadingGameHistory ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : playerGameHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <FaDice className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p>No games recorded yet.</p>
                    <p className="text-sm mt-2">Games will appear here once they&apos;re recorded.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {playerGameHistory.map(game => (
                      <div
                        key={game.id}
                        className="border border-slate-700 rounded-xl p-4 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`${
                                game.placement === 1
                                  ? 'bg-amber-900/50 text-amber-300 border-amber-500/40'
                                  : game.placement === 2
                                    ? 'bg-slate-700 text-slate-300 border-slate-500/40'
                                    : game.placement === 3
                                      ? 'bg-amber-900/40 text-amber-200 border-amber-500/30'
                                      : 'bg-slate-800 text-slate-400 border-slate-600'
                              }`}
                            >
                              {game.placement === 1 ? (
                                <FaTrophy className="w-3 h-3 mr-1" />
                              ) : (
                                `#${game.placement}`
                              )}
                            </Badge>
                            <div>
                              <div className="font-semibold text-white capitalize">
                                {game.gameType} Game
                              </div>
                              <div className="text-sm text-slate-400 flex items-center gap-2">
                                <FaCalendar className="w-3 h-3" />
                                {new Date(game.date).toLocaleDateString()}
                                {game.duration && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <FaClock className="w-3 h-3" />
                                    {game.duration} min
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-400">
                              +{game.points} pts
                            </div>
                            {game.commander && (
                              <div className="text-xs text-slate-500 mt-1">{game.commander}</div>
                            )}
                          </div>
                        </div>

                        {game.opponents && game.opponents.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                              <FaUsers className="w-4 h-4" />
                              <span>Opponents:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {game.opponents.map((opponent: any, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs border-slate-600 text-slate-300"
                                >
                                  {opponent.name} (
                                  {opponent.placement ? `#${opponent.placement}` : 'N/A'})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {game.objectives && game.objectives.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex flex-wrap gap-2">
                              {game.objectives.map((obj: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  className="bg-amber-900/40 text-amber-200 border-amber-500/30 text-xs"
                                >
                                  {obj}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {game.notes && (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <p className="text-sm text-slate-400 italic">{game.notes}</p>
                          </div>
                        )}

                        {game.tableNumber && (
                          <div className="mt-2 text-xs text-slate-500">
                            Table {game.tableNumber}
                            {game.round && ` • Round ${game.round}`}
                            {game.tournamentPhase && ` • ${game.tournamentPhase}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
