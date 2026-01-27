'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import type { WizardPlayer, WizardGame, ScoringRules, FormErrors } from '@/types/wizards';
import { logger } from '@/lib/logger';
import { validatePlayerData as validatePlayer } from '@/lib/validation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useLeague } from '@/contexts/LeagueContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SeasonManager } from '@/components/admin/SeasonManager';
import {
  FaMagic,
  FaUsers,
  FaTrophy,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaUserPlus,
  FaGamepad,
  FaCrown,
  FaStar,
  FaExclamationTriangle,
} from 'react-icons/fa';

// Default scoring rules structure
const defaultScoringRules = {
  goldObjective: 5,
  silverObjective: 2,
  placementBonus: {
    1: 0,
    2: 1,
    3: 1,
    4: 1,
  },
};

const mockGames = [
  {
    id: 'g1',
    date: '2024-03-10',
    season: 'Season 2',
    pod: 'A',
    format: 'Commander',
    players: [
      {
        playerId: '1',
        playerName: 'DragonMaster',
        commander: 'The Ur-Dragon',
        points: 5,
        placement: 1,
        goldObjective: true,
        silverObjectives: 0,
      },
      {
        playerId: '2',
        playerName: 'SpellSlinger',
        commander: 'Jace, the Mind Sculptor',
        points: 2,
        placement: 2,
        goldObjective: false,
        silverObjectives: 1,
      },
      {
        playerId: '3',
        playerName: 'CardShark',
        commander: 'Thrasios, Triton Hero',
        points: 1,
        placement: 3,
        goldObjective: false,
        silverObjectives: 0,
      },
      {
        playerId: '4',
        playerName: 'ManaBurn',
        commander: 'Chandra, Torch of Defiance',
        points: 0,
        placement: 4,
        goldObjective: false,
        silverObjectives: 0,
      },
    ],
    notes: 'Standard Commander pod - DragonMaster dominated with Ur-Dragon',
    winner: 'DragonMaster',
  },
  {
    id: 'g2',
    date: '2024-03-08',
    season: 'Season 2',
    pod: 'B',
    format: 'Commander',
    players: [
      {
        playerId: '2',
        playerName: 'SpellSlinger',
        commander: 'Jace, the Mind Sculptor',
        points: 5,
        placement: 1,
        goldObjective: true,
        silverObjectives: 0,
      },
      {
        playerId: '1',
        playerName: 'DragonMaster',
        commander: 'The Ur-Dragon',
        points: 3,
        placement: 2,
        goldObjective: false,
        silverObjectives: 1,
      },
      {
        playerId: '3',
        playerName: 'CardShark',
        commander: 'Thrasios, Triton Hero',
        points: 1,
        placement: 3,
        goldObjective: false,
        silverObjectives: 0,
      },
    ],
    notes: 'Three-player pod - Jace control won out',
    winner: 'SpellSlinger',
  },
];

export default function WizardsControlPage() {
  const { currentLeague, loading: leagueLoading } = useLeague();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'players' | 'games' | 'scoring' | 'seasons'
  >('dashboard');
  const [scoringRules, setScoringRules] = useState<ScoringRules>(defaultScoringRules);
  const [players, setPlayers] = useState<WizardPlayer[]>([]);
  const [games, setGames] = useState<WizardGame[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<'commander' | 'draft' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRules, setEditingRules] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Simple cache for API responses
  const [cache, setCache] = useState<{ [key: string]: { data: any; timestamp: number } }>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes - constant, not in deps

  // Get league ID from context, fallback to default
  const leagueId = currentLeague?.id || 'default-league';

  // Gold objectives for Commander games
  const goldObjectives = [
    { id: 1, name: "Archmage's Gambit", description: 'Cast 3+ spells in one turn' },
    { id: 2, name: 'Board Control', description: 'Control 5+ permanents by turn 5' },
    { id: 3, name: 'Commander Damage', description: 'Deal 10+ commander damage to opponents' },
    { id: 4, name: 'Creature Assault', description: 'Attack with 5+ creatures in one turn' },
    { id: 5, name: 'Mana Mastery', description: 'Generate 10+ mana in one turn' },
    { id: 6, name: 'Artifact Overload', description: 'Control 5+ artifacts by game end' },
  ];

  // Cached fetch function
  const cachedFetch = useCallback(async (url: string, options?: RequestInit) => {
    const cacheKey = `${url}${JSON.stringify(options)}`;
    const now = Date.now();

    // Check if we have cached data
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    const response = await fetch(url, options);
    const data = await response.json();

    // Cache the response
    setCache(prev => ({
      ...prev,
      [cacheKey]: { data, timestamp: now },
    }));

    return data;
  }, [cache, CACHE_DURATION]);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cachedFetch(`/api/admin/players?leagueId=${leagueId}`);
      setPlayers(data.players || []);
    } catch (error) {
      logger.error('Error fetching players', error);
      // Don't set error for empty data, just use empty array
      setPlayers([]);
      if (error instanceof Error && !error.message.includes('404')) {
        setError('Failed to fetch players. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [leagueId, cachedFetch]);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const gameTypeParam = selectedGameType !== 'all' ? `&gameType=${selectedGameType}` : '';
      const response = await fetch(`/api/admin/games?leagueId=${leagueId}${gameTypeParam}`);

      if (!response.ok) {
        if (response.status === 404) {
          setGames([]);
          return;
        }
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }

      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      logger.error('Error fetching games', error);
      setGames([]);
      if (error instanceof Error && !error.message.includes('404')) {
        setError('Failed to fetch games. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [leagueId, selectedGameType]);

  const fetchScoringRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/scoring-rules?leagueId=${leagueId}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Use default rules if none exist
          setScoringRules(defaultScoringRules);
          return;
        }
        throw new Error(`Failed to fetch scoring rules: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.scoringRules && data.scoringRules.length > 0) {
        // Transform API response to match our format
        const rules = data.scoringRules.reduce(
          (acc: any, rule: any) => {
            if (rule.name === 'Gold Objective') acc.goldObjective = rule.points;
            if (rule.name === 'Silver Objective') acc.silverObjective = rule.points;
            if (rule.name?.includes('Placement')) {
              const place = parseInt(rule.name.match(/\d+/)?.[0] || '1');
              acc.placementBonus[place] = rule.points;
            }
            return acc;
          },
          { ...defaultScoringRules }
        );
        setScoringRules(rules);
      } else {
        setScoringRules(defaultScoringRules);
      }
    } catch (error) {
      logger.error('Error fetching scoring rules', error);
      // Use default rules on error
      setScoringRules(defaultScoringRules);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    // Load initial data when league is available
    if (currentLeague && !leagueLoading) {
      fetchPlayers();
      fetchGames();
      fetchScoringRules();
    }
  }, [currentLeague, leagueLoading, fetchPlayers, fetchGames, fetchScoringRules]);

  useEffect(() => {
    // Refetch games when game type filter changes
    if (currentLeague && !leagueLoading) {
      fetchGames();
    }
  }, [selectedGameType, currentLeague, leagueLoading, fetchGames]);

  const saveScoringRules = async () => {
    logger.info('Saving scoring rules', { scoringRules });
    setEditingRules(false);
    // In real app, save to API
  };

  const updatePlayer = async (playerId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, ...updates }),
      });

      if (response.ok) {
        setPlayers(prev => prev.map(p => (p.id === playerId ? { ...p, ...updates } : p)));
        setEditingPlayer(null);
      } else {
        logger.error('Failed to update player');
      }
    } catch (error) {
      logger.error('Error updating player', error);
    }
  };

  const deletePlayer = async (playerId: string) => {
    if (
      confirm('Are you sure you want to delete this player? This will remove them from all games.')
    ) {
      try {
        const response = await fetch(`/api/admin/players?id=${playerId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setPlayers(prev => prev.filter(p => p.id !== playerId));
        } else {
          logger.error('Failed to delete player');
        }
      } catch (error) {
        logger.error('Error deleting player', error);
      }
    }
  };

  const validatePlayerData = (data: unknown) => validatePlayer(data);

  const invalidateCache = (urlPattern: string) => {
    setCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (key.includes(urlPattern)) {
          delete newCache[key];
        }
      });
      return newCache;
    });
  };

  const addPlayer = async (playerData: any) => {
    const validationResult = validatePlayerData(playerData);
    if (!validationResult.valid) {
      setFormErrors(validationResult.errors);
      return;
    }

    setFormErrors({});

    try {
      setLoading(true);
      const response = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, ...playerData }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlayers(prev => [...prev, data.player]);
        setShowAddPlayerModal(false);
        // Invalidate player cache
        invalidateCache('/api/admin/players');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add player');
      }
    } catch (error) {
      logger.error('Error adding player', error);
      setError('Failed to add player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addGame = async (gameData: any) => {
    const newGame = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      season: 'Season 2',
      ...gameData,
    };
    setGames(prev => [newGame, ...prev]);
    setShowAddGameModal(false);
  };

  const updateGame = async (gameId: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gameId, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update game');
      }

      const { game } = await response.json();

      // Update local state with the updated game
      setGames(prev => prev.map(g => (g.id === gameId ? { ...g, ...updates } : g)));
      setEditingGame(null);

      // Show success message
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.success('Game updated successfully!');
      }

      // Refresh leaderboard data
      await fetchGames();
    } catch (err: any) {
      console.error('Error updating game:', err);
      setError(err.message || 'Failed to update game');
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (gameId: string) => {
    if (
      !confirm('Are you sure you want to delete this game result? This action cannot be undone.')
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/games?id=${gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete game');
      }

      // Remove from local state
      setGames(prev => prev.filter(g => g.id !== gameId));

      // Show success message
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.success('Game deleted successfully!');
      }

      // Refresh leaderboard data
      await fetchGames();
    } catch (err: any) {
      logger.error('Error deleting game', err);
      setError(err.message || 'Failed to delete game');
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const totalPlayers = players.filter(p => p.active).length;
    const totalGames = games.length;
    const totalPoints = players.reduce((sum, p) => sum + p.totalPoints, 0);
    const avgPointsPerGame = totalGames > 0 ? (totalPoints / totalGames).toFixed(1) : '0';

    return { totalPlayers, totalGames, totalPoints, avgPointsPerGame };
  };

  // Game form helper functions
  const handleGameTypeChange = () => {
    const gameTypeSelect = document.getElementById('game-type') as HTMLSelectElement;
    const goldObjectiveSelect = document.getElementById('gold-objective') as HTMLSelectElement;
    const goldDisplay = document.getElementById('gold-objective-display');

    if (gameTypeSelect && goldObjectiveSelect && goldDisplay) {
      if (gameTypeSelect.value === 'commander') {
        goldDisplay.classList.remove('hidden');
        goldObjectiveSelect.value = '1'; // Default to first objective
      } else {
        goldDisplay.classList.add('hidden');
        goldObjectiveSelect.value = '';
      }
      updateObjectiveDisplay();
    }
  };

  const updateObjectiveDisplay = () => {
    const goldObjectiveSelect = document.getElementById('gold-objective') as HTMLSelectElement;
    const objectiveDetails = document.getElementById('objective-details');

    if (goldObjectiveSelect && objectiveDetails) {
      const selectedId = parseInt(goldObjectiveSelect.value);
      const selectedObjective = goldObjectives.find(obj => obj.id === selectedId);

      if (selectedObjective) {
        objectiveDetails.innerHTML = `
          <strong>${selectedObjective.name}</strong><br>
          <span class="text-sm">${selectedObjective.description}</span>
        `;
      } else {
        objectiveDetails.innerHTML = '';
      }
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FaMagic },
    { id: 'players', label: 'Manage Players', icon: FaUsers },
    { id: 'games', label: 'Game Results', icon: FaGamepad },
    { id: 'scoring', label: 'Scoring Rules', icon: FaTrophy },
    { id: 'seasons', label: 'Seasons', icon: FaCrown },
  ];

  // Show loading state while league is loading
  if (leagueLoading) {
    return (
      <div
        className="min-h-screen py-8 flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url(/images/medieval-background.jpg)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(10, 12, 18, 0.85)',
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  // Show message if no league is available
  if (!currentLeague) {
    return (
      <div
        className="min-h-screen py-8 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url(/images/medieval-background.jpg)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(10, 12, 18, 0.85)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="card-arena border-amber-500/20">
            <CardContent className="p-8 text-center">
              <FaExclamationTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No League Available</h2>
              <p className="text-slate-400">
                Please create a league first or contact an administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero — Arena */}
      <section
        className="relative py-16 bg-cover bg-center bg-fixed overflow-hidden"
        style={{
          backgroundImage: 'url(/images/medieval-background.jpg)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(10, 12, 18, 0.85)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4 animate-fade-in">
              <FaMagic className="w-12 h-12 text-amber-400 mr-4" />
              <h1 className="text-4xl font-bold text-white">
                🧙‍♂️ <span className="text-gradient-arena">Wizards Control</span>
              </h1>
              <FaMagic className="w-12 h-12 text-amber-400 ml-4" />
            </div>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in-delayed">
              Master control panel for the MTG Maui League. Shape destinies, command the arcane, and
              wield the power to alter scores and summon champions.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-900/50 border border-red-500/40 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-200">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-amber-600 border-amber-500/40 text-white'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-800/80 hover:border-amber-500/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

        {/* Tab Content with Suspense */}
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <span className="ml-2 text-purple-200">Loading...</span>
            </div>
          }
        >
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-600">
                  <CardContent className="p-6 text-center">
                    <FaUsers className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {getTotalStats().totalPlayers}
                    </div>
                    <div className="text-blue-200">Active Players</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-600">
                  <CardContent className="p-6 text-center">
                    <FaGamepad className="w-8 h-8 text-green-300 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {getTotalStats().totalGames}
                    </div>
                    <div className="text-green-200">Games Played</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-600">
                  <CardContent className="p-6 text-center">
                    <FaTrophy className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {getTotalStats().totalPoints}
                    </div>
                    <div className="text-yellow-200">Total Points</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-600">
                  <CardContent className="p-6 text-center">
                    <FaStar className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {getTotalStats().avgPointsPerGame}
                    </div>
                    <div className="text-purple-200">Avg Points/Game</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Games */}
              <Card className="card-arena border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FaGamepad className="w-5 h-5 mr-2 text-amber-400" />
                    Recent Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {games.slice(0, 5).map(game => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-slate-400">{game.date}</div>
                          <Badge className="bg-blue-900/50 text-blue-300 border-blue-500/40">{game.pod}</Badge>
                          <div className="text-white font-medium">{game.winner}</div>
                          <div className="text-slate-400 text-sm">
                            ({game.players.length} players)
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingGame(game.id)}
                          className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Players Management Tab */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaUsers className="w-6 h-6 mr-3 text-purple-400" />
                  Player Management
                </h2>
                <Button
                  onClick={() => setShowAddPlayerModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <FaUserPlus className="w-4 h-4 mr-2" />
                  Summon New Player
                </Button>
              </div>

              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-purple-300">
                            Player
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-purple-300">
                            Commander
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-purple-300">
                            Points
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-purple-300">
                            Games
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-purple-300">
                            Status
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-purple-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {players.map(player => (
                          <tr key={player.id} className="hover:bg-gray-800">
                            <td className="py-4 px-6">
                              {editingPlayer === player.id ? (
                                <input
                                  type="text"
                                  defaultValue={player.name}
                                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      updatePlayer(player.id, {
                                        name: (e.target as HTMLInputElement).value,
                                      });
                                    } else if (e.key === 'Escape') {
                                      setEditingPlayer(null);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-white font-medium">{player.name}</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {editingPlayer === player.id ? (
                                <input
                                  type="text"
                                  defaultValue={player.commander}
                                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      updatePlayer(player.id, {
                                        commander: (e.target as HTMLInputElement).value,
                                      });
                                    } else if (e.key === 'Escape') {
                                      setEditingPlayer(null);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-gray-300">{player.commander}</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {editingPlayer === player.id ? (
                                <input
                                  type="number"
                                  defaultValue={player.totalPoints}
                                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      updatePlayer(player.id, {
                                        totalPoints:
                                          parseInt((e.target as HTMLInputElement).value) || 0,
                                      });
                                    } else if (e.key === 'Escape') {
                                      setEditingPlayer(null);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-yellow-400 font-semibold">
                                  {player.totalPoints}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center text-white">
                              {player.gamesPlayed}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <Badge
                                variant={player.active ? 'default' : 'secondary'}
                                className={
                                  player.active
                                    ? 'bg-green-900 text-green-200'
                                    : 'bg-red-900 text-red-200'
                                }
                              >
                                {player.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setEditingPlayer(editingPlayer === player.id ? null : player.id)
                                  }
                                  className="border-purple-500 text-purple-300 hover:bg-purple-900"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deletePlayer(player.id)}
                                  className="border-red-500 text-red-300 hover:bg-red-900"
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaGamepad className="w-6 h-6 mr-3 text-purple-400" />
                  Game Results Management
                </h2>
                <Button
                  onClick={() => setShowAddGameModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Record New Game
                </Button>
              </div>

              {/* Game Type Filter */}
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All Games' },
                  { value: 'commander', label: 'Commander (4FFA)' },
                  { value: 'draft', label: 'Draft (1v1)' },
                ].map(filter => (
                  <Button
                    key={filter.value}
                    variant={selectedGameType === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGameType(filter.value as any)}
                    className={
                      selectedGameType === filter.value
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'border-purple-400 text-purple-200 hover:bg-purple-800'
                    }
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {games.map(game => (
                  <Card key={game.id} className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Badge className="bg-blue-900 text-blue-200">{game.pod}</Badge>
                            {game.date} - {game.winner} Wins!
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {game.season} • {game.format} • {game.players.length} players
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingGame(editingGame === game.id ? null : game.id)}
                          className="border-purple-500 text-purple-300 hover:bg-purple-900"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingGame === game.id ? (
                        /* Edit Mode */
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Date
                              </label>
                              <input
                                type="date"
                                defaultValue={game.date}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                                onChange={e => {
                                  const updatedGame = { ...game, date: e.target.value };
                                  setGames(prev =>
                                    prev.map(g => (g.id === game.id ? updatedGame : g))
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Pod
                              </label>
                              <select
                                defaultValue={game.pod}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                                onChange={e => {
                                  const updatedGame = { ...game, pod: e.target.value };
                                  setGames(prev =>
                                    prev.map(g => (g.id === game.id ? updatedGame : g))
                                  );
                                }}
                              >
                                <option>A</option>
                                <option>B</option>
                                <option>C</option>
                                <option>D</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Winner
                            </label>
                            <select
                              defaultValue={game.winner}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                              onChange={e => {
                                const updatedGame = { ...game, winner: e.target.value };
                                // Update placements to reflect new winner
                                const updatedPlayers = game.players.map((p: any) => ({
                                  ...p,
                                  placement: p.playerName === e.target.value ? 1 : p.placement + 1,
                                }));
                                updatedGame.players = updatedPlayers;
                                setGames(prev =>
                                  prev.map(g => (g.id === game.id ? updatedGame : g))
                                );
                              }}
                            >
                              {players
                                .filter(p => p.active)
                                .map(player => (
                                  <option key={player.id} value={player.name}>
                                    {player.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Player Scores
                            </label>
                            <div className="space-y-2">
                              {game.players
                                .sort((a: any, b: any) => a.placement - b.placement)
                                .map((player: any, index: number) => (
                                  <div
                                    key={player.playerId}
                                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                                  >
                                    <div className="w-12 text-center">
                                      <input
                                        type="number"
                                        min="1"
                                        max="4"
                                        defaultValue={player.placement}
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                        onChange={e => {
                                          const updatedPlayers = game.players.map((p: any) =>
                                            p.playerId === player.playerId
                                              ? { ...p, placement: parseInt(e.target.value) || 1 }
                                              : p
                                          );
                                          const updatedGame = { ...game, players: updatedPlayers };
                                          setGames(prev =>
                                            prev.map(g => (g.id === game.id ? updatedGame : g))
                                          );
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-white font-medium text-sm">
                                        {player.playerName}
                                      </div>
                                      <div className="text-gray-400 text-xs">
                                        {player.commander}
                                      </div>
                                    </div>
                                    <div className="w-20">
                                      <input
                                        type="number"
                                        min="0"
                                        defaultValue={player.points}
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                        onChange={e => {
                                          const updatedPlayers = game.players.map((p: any) =>
                                            p.playerId === player.playerId
                                              ? { ...p, points: parseInt(e.target.value) || 0 }
                                              : p
                                          );
                                          const updatedGame = { ...game, players: updatedPlayers };
                                          setGames(prev =>
                                            prev.map(g => (g.id === game.id ? updatedGame : g))
                                          );
                                        }}
                                      />
                                      <div className="text-xs text-gray-400 text-center mt-1">
                                        points
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Notes
                            </label>
                            <textarea
                              defaultValue={game.notes || ''}
                              rows={3}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                              onChange={e => {
                                const updatedGame = { ...game, notes: e.target.value };
                                setGames(prev =>
                                  prev.map(g => (g.id === game.id ? updatedGame : g))
                                );
                              }}
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => {
                                const currentGame = games.find(g => g.id === game.id);
                                if (currentGame) {
                                  updateGame(game.id, {
                                    date: currentGame.date,
                                    pod: currentGame.pod,
                                    winner: currentGame.winner,
                                    players: currentGame.players,
                                    placements: currentGame.players.map((p: any) => ({
                                      playerId: p.playerId,
                                      playerName: p.playerName,
                                      placement: p.placement,
                                      points: p.points,
                                    })),
                                    notes: currentGame.notes,
                                    gameType: currentGame.gameType || 'commander',
                                    goldObjective: currentGame.goldObjective || false,
                                  });
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <FaSave className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingGame(null)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              <FaTimes className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => deleteGame(game.id)}
                              className="border-red-600 text-red-300 hover:bg-red-900 ml-auto"
                            >
                              <FaTrash className="w-4 h-4 mr-2" />
                              Delete Game
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <>
                          {/* Gold Objective Display */}
                          {game.goldObjective && typeof game.goldObjective === 'object' && (
                            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                              <div className="flex items-center mb-2">
                                <FaStar className="w-4 h-4 text-yellow-400 mr-2" />
                                <span className="text-yellow-300 font-medium">Gold Objective:</span>
                              </div>
                              <div className="text-yellow-100">
                                <strong>
                                  {typeof game.goldObjective === 'object' && game.goldObjective !== null && 'name' in game.goldObjective
                                    ? (game.goldObjective as { name: string; description: string }).name 
                                    : 'Gold Objective'}
                                </strong>
                                <div className="text-sm text-yellow-200 mt-1">
                                  {typeof game.goldObjective === 'object' && game.goldObjective !== null && 'description' in game.goldObjective
                                    ? (game.goldObjective as { name: string; description: string }).description 
                                    : 'Completed'}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            {game.players
                              .sort((a: any, b: any) => a.placement - b.placement)
                              .map((player: any, index: number) => (
                                <div
                                  key={player.playerId}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    player.placement === 1
                                      ? 'bg-yellow-900/30 border border-yellow-600'
                                      : player.placement === 2
                                        ? 'bg-gray-700/50'
                                        : player.placement === 3
                                          ? 'bg-orange-900/30'
                                          : 'bg-gray-800/50'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <span
                                      className={`text-lg font-bold ${
                                        player.placement === 1
                                          ? 'text-yellow-400'
                                          : player.placement === 2
                                            ? 'text-gray-400'
                                            : player.placement === 3
                                              ? 'text-orange-400'
                                              : 'text-gray-500'
                                      }`}
                                    >
                                      #{player.placement}
                                    </span>
                                    <div>
                                      <div className="text-white font-medium">
                                        {player.playerName}
                                      </div>
                                      <div className="text-gray-400 text-sm">
                                        {player.commander}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                      <div className="text-yellow-400 font-semibold">
                                        {player.points} pts
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {player.goldObjective && 'Gold + '}
                                        {player.silverObjectives > 0 &&
                                          `${player.silverObjectives} Silver`}
                                      </div>
                                    </div>
                                    {player.placement === 1 && (
                                      <FaCrown className="w-5 h-5 text-yellow-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                          {game.notes && (
                            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                              <div className="text-gray-400 text-sm">{game.notes}</div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Scoring Rules Tab */}
          {activeTab === 'scoring' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <FaTrophy className="w-5 h-5 mr-2 text-purple-400" />
                      Scoring Rules Configuration
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure how points are awarded for different game outcomes and objectives.
                    </CardDescription>
                  </div>
                  {!editingRules ? (
                    <Button
                      onClick={() => setEditingRules(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <FaEdit className="w-4 h-4 mr-2" />
                      Edit Rules
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={saveScoringRules}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <FaSave className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingRules(false)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <FaTimes className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gold Objective */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-300">
                      Gold Objective Points
                    </label>
                    {editingRules ? (
                      <input
                        type="number"
                        value={scoringRules.goldObjective}
                        onChange={e =>
                          setScoringRules(prev => ({
                            ...prev,
                            goldObjective: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-yellow-400">
                        {scoringRules.goldObjective}
                      </div>
                    )}
                  </div>

                  {/* Silver Objective */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-300">
                      Silver Objective Points (per objective)
                    </label>
                    {editingRules ? (
                      <input
                        type="number"
                        value={scoringRules.silverObjective}
                        onChange={e =>
                          setScoringRules(prev => ({
                            ...prev,
                            silverObjective: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-blue-400">
                        {scoringRules.silverObjective}
                      </div>
                    )}
                  </div>
                </div>

                {/* Placement Bonuses */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Placement Bonuses</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(place => (
                      <div key={place} className="space-y-2">
                        <label className="block text-sm font-medium text-purple-300">
                          {place === 1
                            ? '1st Place'
                            : `${place}${place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'} Place`}
                        </label>
                        {editingRules ? (
                          <input
                            type="number"
                            value={
                              scoringRules.placementBonus[
                                place as keyof typeof scoringRules.placementBonus
                              ]
                            }
                            onChange={e =>
                              setScoringRules(prev => ({
                                ...prev,
                                placementBonus: {
                                  ...prev.placementBonus,
                                  [place]: parseInt(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        ) : (
                          <div className="text-xl font-bold text-green-400">
                            +
                            {
                              scoringRules.placementBonus[
                                place as keyof typeof scoringRules.placementBonus
                              ]
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seasons Tab */}
          {activeTab === 'seasons' && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FaCrown className="w-5 h-5 mr-2 text-purple-400" />
                  Season Management
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage league seasons, championships, and historical data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FaCrown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Season Management</h3>
                  <p className="text-gray-400 mb-6">
                    Manage seasons, track progress, and archive completed seasons.
                  </p>
                  {currentLeague ? (
                    <SeasonManager leagueId={currentLeague.id} />
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>Please select a league to manage seasons.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Player Modal */}
          <Modal
            isOpen={showAddPlayerModal}
            onClose={() => setShowAddPlayerModal(false)}
            title="Summon New Player"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Player Name *
                </label>
                <input
                  type="text"
                  id="new-player-name"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter player name"
                />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="new-player-email"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Commander Name *
                </label>
                <input
                  type="text"
                  id="new-player-commander"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    formErrors.commander ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter commander name"
                />
                {formErrors.commander && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.commander}</p>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    const name = (
                      document.getElementById('new-player-name') as HTMLInputElement
                    )?.value.trim();
                    const email = (
                      document.getElementById('new-player-email') as HTMLInputElement
                    )?.value.trim();
                    const commander = (
                      document.getElementById('new-player-commander') as HTMLInputElement
                    )?.value.trim();

                    if (name && email && commander) {
                      addPlayer({ name, email, commander });
                    } else {
                      addPlayer({ name, email, commander });
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Summoning...' : 'Summon Player'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddPlayerModal(false);
                    setFormErrors({});
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>

          {/* Add Game Modal */}
          <Modal
            isOpen={showAddGameModal}
            onClose={() => setShowAddGameModal(false)}
            title="Record New Game"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    id="game-date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Pod</label>
                  <select
                    id="game-pod"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Game Type</label>
                  <select
                    id="game-type"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="commander">Commander (4FFA)</option>
                    <option value="draft">Draft (1v1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Gold Objective (Commander Only)
                  </label>
                  <select
                    id="gold-objective"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">None (Draft Game)</option>
                    {goldObjectives.map(objective => (
                      <option key={objective.id} value={objective.id}>
                        {objective.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Winner</label>
                <select
                  id="game-winner"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Winner</option>
                  {players
                    .filter(p => p.active)
                    .map(player => (
                      <option key={player.id} value={player.name}>
                        {player.name} ({player.commander})
                      </option>
                    ))}
                </select>
              </div>

              {/* Gold Objective Display */}
              <div
                id="gold-objective-display"
                className="hidden p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg"
              >
                <h4 className="text-yellow-300 font-medium mb-2">Selected Gold Objective:</h4>
                <div id="objective-details" className="text-yellow-100"></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  id="game-notes"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Game notes and highlights..."
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    const date = (document.getElementById('game-date') as HTMLInputElement)?.value;
                    const pod = (document.getElementById('game-pod') as HTMLSelectElement)?.value;
                    const gameType = (document.getElementById('game-type') as HTMLSelectElement)
                      ?.value;
                    const goldObjective = (
                      document.getElementById('gold-objective') as HTMLSelectElement
                    )?.value;
                    const winner = (document.getElementById('game-winner') as HTMLSelectElement)
                      ?.value;
                    const notes = (document.getElementById('game-notes') as HTMLTextAreaElement)
                      ?.value;

                    if (date && pod && gameType && winner) {
                      const selectedObjective = goldObjective
                        ? goldObjectives.find(obj => obj.id === parseInt(goldObjective))
                        : null;

                      addGame({
                        date,
                        pod,
                        gameType,
                        goldObjective: selectedObjective
                          ? {
                              id: selectedObjective.id,
                              name: selectedObjective.name,
                              description: selectedObjective.description,
                            }
                          : null,
                        winner,
                        notes,
                        players: [], // Would be populated with actual player data
                      });
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Record Game
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddGameModal(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </Suspense>
        </div>
      </section>
    </div>
  );
}
