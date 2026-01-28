'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useLeague } from '@/contexts/LeagueContext';
import { usePageContent } from '@/contexts/PageContentContext';
import {
  FaCog,
  FaUsers,
  FaTrophy,
  FaEdit,
  FaSave,
  FaPlus,
  FaTrash,
  FaCalendar,
  FaNewspaper,
  FaDice,
  FaChess,
  FaExclamationTriangle,
  FaTable,
  FaChartLine,
  FaSearch,
  FaMagic,
  FaRedo,
  FaCalculator,
  FaSignOutAlt,
  FaFileAlt,
  FaPlusCircle,
  FaSpinner,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { siteImages } from '@/lib/site-images';
import { EditableLeaderboardTable } from '@/components/admin/EditableLeaderboardTable';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard').then(mod => mod.AdminDashboard),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    ),
  }
);
import { BulkOperations } from '@/components/admin/BulkOperations';
import { AdvancedSearch } from '@/components/admin/AdvancedSearch';
import { ScoringRulesManager } from '@/components/admin/ScoringRulesManager';
import { SeasonManager } from '@/components/admin/SeasonManager';

type TabType =
  | 'dashboard'
  | 'search'
  | 'players'
  | 'games'
  | 'events'
  | 'news'
  | 'drafts'
  | 'pairings'
  | 'leaderboard'
  | 'bulk'
  | 'scoring'
  | 'seasons'
  | 'pages'
  | 'settings';

interface Player {
  id: string;
  name: string;
  email: string;
  commander: string;
  totalPoints: number;
  gamesPlayed: number;
  active: boolean;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  participants: number;
  maxParticipants: number;
  status: string;
}

interface News {
  id: string;
  title: string;
  excerpt?: string;
  category: string;
  author?: string;
  publishedAt: string;
}

interface Pairing {
  id: string;
  date: string;
  gameType: string;
  players: any[];
  tableNumber?: number;
  round?: number;
  notes?: string;
}

export default function WizardsControlPage() {
  const { currentLeague, loading: leagueLoading, refreshLeagues } = useLeague();
  const { refresh: refreshPageContent } = usePageContent();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [pageContentList, setPageContentList] = useState<Array<{ id: string; path: string; title: string | null; description: string | null; config: Record<string, unknown>; updatedAt: string }>>([]);
  const [pageContentEdit, setPageContentEdit] = useState<{ path: string; title: string; description: string; configJson: string } | null>(null);
  const [pageContentSaving, setPageContentSaving] = useState(false);

  // Modal states
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [showAddPairingModal, setShowAddPairingModal] = useState(false);
  const [showAddDraftModal, setShowAddDraftModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<string | null>(null);

  // Form states
  const [playerForm, setPlayerForm] = useState({ name: '', email: '', commander: '' });
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: 32,
  });
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', category: 'Updates' });
  const [gameForm, setGameForm] = useState({
    gameType: 'commander' as 'commander' | 'draft',
    date: new Date().toISOString().split('T')[0],
    tournamentPhase: 'swiss',
    round: '',
    tableNumber: '',
    players: [] as string[],
    placements: [] as Array<{ playerId: string; placement: number; points: number; commander?: string }>,
    notes: '',
  });
  const [pairingForm, setPairingForm] = useState({
    gameType: 'commander',
    date: new Date().toISOString().split('T')[0],
    time: '',
    selectedPlayers: [] as string[],
    tableNumber: '',
    round: '',
    tournamentPhase: '',
    notes: '',
  });
  const [creatingRecords, setCreatingRecords] = useState(false);
  const [draftForm, setDraftForm] = useState({
    name: '',
    format: 'draft',
    date: new Date().toISOString().split('T')[0],
    maxParticipants: 16,
  });

  // Skip auth check for now - allow direct access to control panel
  useEffect(() => {
    // Temporarily bypass authentication for development
    setIsAdmin(true);
    setCheckingAuth(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/simple-admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setIsAdmin(true);
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Invalid username or password');
      }
    } catch {
      setLoginError('Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/simple-admin-logout', { method: 'POST', credentials: 'include' });
    } catch {}
    setIsAdmin(false);
  };

  const savePageContent = async () => {
    if (!pageContentEdit) return;
    setPageContentSaving(true);
    try {
      let config: Record<string, unknown> = {};
      try {
        config = JSON.parse(pageContentEdit.configJson || '{}');
      } catch {
        toast.error('Invalid JSON in config');
        setPageContentSaving(false);
        return;
      }
      const res = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          path: pageContentEdit.path,
          title: pageContentEdit.title || null,
          description: pageContentEdit.description || null,
          config,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || 'Failed to save');
        setPageContentSaving(false);
        return;
      }
      toast.success('Page content saved');
      setPageContentEdit(null);
      await fetchPages();
      await refreshPageContent();
    } catch {
      toast.error('Failed to save page content');
    } finally {
      setPageContentSaving(false);
    }
  };

  const fetchPlayers = useCallback(async () => {
    if (!currentLeague) return;
    const response = await fetch(`/api/admin/players?leagueId=${currentLeague.id}`, {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      setPlayers(data.players || []);
    } else {
      toast.error('Failed to fetch players');
    }
  }, [currentLeague]);

  const fetchEvents = useCallback(async () => {
    const response = await fetch('/api/admin/events', { credentials: 'include' });
    if (response.ok) {
      const data = await response.json();
      setEvents(data.events || []);
    } else {
      toast.error('Failed to fetch events');
    }
  }, []);

  const fetchNews = useCallback(async () => {
    const response = await fetch('/api/admin/news', { credentials: 'include' });
    if (response.ok) {
      const data = await response.json();
      setNews(data.news || []);
    } else {
      toast.error('Failed to fetch news');
    }
  }, []);

  const fetchPairings = useCallback(async () => {
    if (!currentLeague) return;
    const response = await fetch(
      `/api/admin/pairings?leagueId=${currentLeague.id}&gameType=commander`
    );
    if (response.ok) {
      const data = await response.json();
      setPairings(data.pairings || []);
    } else {
      toast.error('Failed to fetch pairings');
    }
  }, [currentLeague]);

  const fetchDrafts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/drafts', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      } else {
        toast.error('Failed to fetch drafts');
      }
    } catch {
      toast.error('Failed to fetch drafts');
    }
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/pages', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPageContentList(data.pages || []);
      } else {
        toast.error('Failed to fetch page content');
      }
    } catch {
      toast.error('Failed to fetch page content');
    }
  }, []);

  const fetchGames = useCallback(async () => {
    if (!currentLeague) return;
    try {
      const response = await fetch(`/api/admin/games?leagueId=${currentLeague.id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      } else {
        toast.error('Failed to fetch games');
      }
    } catch {
      toast.error('Failed to fetch games');
    }
  }, [currentLeague]);

  const fetchData = useCallback(async () => {
    if (!currentLeague) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'players':
          await fetchPlayers();
          break;
        case 'games':
          await fetchGames();
          break;
        case 'events':
          await fetchEvents();
          break;
        case 'news':
          await fetchNews();
          break;
        case 'pairings':
          await fetchPairings();
          break;
        case 'drafts':
          await fetchDrafts();
          break;
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentLeague, fetchPlayers, fetchEvents, fetchNews, fetchPairings, fetchDrafts, fetchGames]);

  // Fetch data when league is ready and user is admin
  useEffect(() => {
    if (!checkingAuth && isAdmin && currentLeague && !leagueLoading) {
      fetchData();
    }
  }, [checkingAuth, isAdmin, currentLeague, leagueLoading, activeTab, fetchData]);

  useEffect(() => {
    if (!checkingAuth && isAdmin && activeTab === 'pages') {
      fetchPages();
    }
  }, [checkingAuth, isAdmin, activeTab, fetchPages]);

  // Player management
  const addPlayer = async () => {
    if (!currentLeague || !playerForm.name || !playerForm.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: currentLeague.id,
          name: playerForm.name,
          email: playerForm.email,
          commander: playerForm.commander,
        }),
      });

      if (response.ok) {
        toast.success('Player added successfully');
        setShowAddPlayerModal(false);
        setPlayerForm({ name: '', email: '', commander: '' });
        fetchPlayers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add player');
      }
    } catch (error) {
      toast.error('Failed to add player');
    }
  };

  const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
    try {
      const response = await fetch('/api/admin/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ playerId, ...updates }),
      });

      if (response.ok) {
        toast.success('Player updated successfully');
        setEditingPlayer(null);
        fetchPlayers();
      } else {
        toast.error('Failed to update player');
      }
    } catch (error) {
      toast.error('Failed to update player');
    }
  };

  const deletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to deactivate this player?')) return;

    try {
      const response = await fetch(`/api/admin/players?id=${playerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Player deactivated');
        fetchPlayers();
      } else {
        toast.error('Failed to delete player');
      }
    } catch (error) {
      toast.error('Failed to delete player');
    }
  };

  // Event management
  const addEvent = async () => {
    if (!eventForm.title || !eventForm.date) {
      toast.error('Title and date are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventForm),
      });

      if (response.ok) {
        toast.success('Event added successfully');
        setShowAddEventModal(false);
        setEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          maxParticipants: 32,
        });
        fetchEvents();
      } else {
        toast.error('Failed to add event');
      }
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const updateEvent = async () => {
    if (!editingEvent || !eventForm.title || !eventForm.date) {
      toast.error('Title and date are required');
      return;
    }

    try {
      const event = events.find(e => e.id === editingEvent);
      if (!event) {
        toast.error('Event not found');
        return;
      }

      const response = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: editingEvent,
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          time: eventForm.time,
          location: eventForm.location,
          maxParticipants: eventForm.maxParticipants,
          participants: event.participants,
          status: event.status,
        }),
      });

      if (response.ok) {
        toast.success('Event updated successfully');
        setShowAddEventModal(false);
        setEditingEvent(null);
        setEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          maxParticipants: 32,
        });
        fetchEvents();
      } else {
        toast.error('Failed to update event');
      }
    } catch {
      toast.error('Failed to update event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Event deleted');
        fetchEvents();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  // News management
  const addNews = async () => {
    if (!newsForm.title || !newsForm.category) {
      toast.error('Title and category are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newsForm),
      });

      if (response.ok) {
        toast.success('News added successfully');
        setShowAddNewsModal(false);
        setNewsForm({ title: '', excerpt: '', category: 'Updates' });
        fetchNews();
      } else {
        toast.error('Failed to add news');
      }
    } catch (error) {
      toast.error('Failed to add news');
    }
  };

  const updateNews = async () => {
    if (!editingNews || !newsForm.title || !newsForm.category) {
      toast.error('Title and category are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: editingNews,
          title: newsForm.title,
          excerpt: newsForm.excerpt,
          category: newsForm.category,
        }),
      });

      if (response.ok) {
        toast.success('News updated successfully');
        setShowAddNewsModal(false);
        setEditingNews(null);
        setNewsForm({ title: '', excerpt: '', category: 'Updates' });
        fetchNews();
      } else {
        toast.error('Failed to update news');
      }
    } catch {
      toast.error('Failed to update news');
    }
  };

  const deleteNews = async (newsId: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;

    try {
      const response = await fetch(`/api/admin/news?id=${newsId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('News deleted');
        fetchNews();
      } else {
        toast.error('Failed to delete news');
      }
    } catch (error) {
      toast.error('Failed to delete news');
    }
  };

  // Pairing management
  const addPairing = async () => {
    if (!currentLeague) {
      toast.error('No league selected');
      return;
    }
    setShowAddPairingModal(true);
  };

  const handleCreatePairing = async () => {
    if (!currentLeague) {
      toast.error('No league selected');
      return;
    }

    if (pairingForm.selectedPlayers.length < 2) {
      toast.error('Please select at least 2 players');
      return;
    }

    try {
      const response = await fetch('/api/admin/pairings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: currentLeague.id,
          gameType: pairingForm.gameType,
          date: `${pairingForm.date}T${pairingForm.time || '12:00'}:00`,
          players: pairingForm.selectedPlayers,
          tableNumber: pairingForm.tableNumber ? parseInt(pairingForm.tableNumber) : null,
          round: pairingForm.round ? parseInt(pairingForm.round) : null,
          tournamentPhase: pairingForm.tournamentPhase || null,
          notes: pairingForm.notes || null,
        }),
      });

      if (response.ok) {
        toast.success('Pairing created successfully!');
        setShowAddPairingModal(false);
        setPairingForm({
          gameType: 'commander',
          date: new Date().toISOString().split('T')[0],
          time: '',
          selectedPlayers: [],
          tableNumber: '',
          round: '',
          tournamentPhase: '',
          notes: '',
        });
        fetchPairings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create pairing');
      }
    } catch {
      toast.error('Failed to create pairing');
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    setPairingForm(prev => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.includes(playerId)
        ? prev.selectedPlayers.filter(id => id !== playerId)
        : [...prev.selectedPlayers, playerId],
    }));
  };

  const addGame = async () => {
    if (!currentLeague) {
      toast.error('No league selected');
      return;
    }

    if (gameForm.players.length < 2) {
      toast.error('Please select at least 2 players');
      return;
    }

    if (gameForm.placements.length !== gameForm.players.length) {
      toast.error('Please set placements for all players');
      return;
    }

    try {
      const url = editingGame ? '/api/admin/games' : '/api/admin/games';
      const method = editingGame ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...(editingGame && { id: editingGame }),
          leagueId: currentLeague.id,
          gameType: gameForm.gameType,
          date: gameForm.date,
          tournamentPhase: gameForm.tournamentPhase || null,
          round: gameForm.round ? parseInt(gameForm.round) : null,
          tableNumber: gameForm.tableNumber ? parseInt(gameForm.tableNumber) : null,
          players: gameForm.players,
          placements: gameForm.placements,
          notes: gameForm.notes || null,
        }),
      });

      if (response.ok) {
        toast.success(editingGame ? 'Game updated successfully' : 'Game added successfully');
        setShowAddGameModal(false);
        setEditingGame(null);
        setGameForm({
          gameType: 'commander',
          date: new Date().toISOString().split('T')[0],
          tournamentPhase: 'swiss',
          round: '',
          tableNumber: '',
          players: [],
          placements: [],
          notes: '',
        });
        fetchGames();
      } else {
        const error = await response.json();
        toast.error(error.error || (editingGame ? 'Failed to update game' : 'Failed to add game'));
      }
    } catch {
      toast.error(editingGame ? 'Failed to update game' : 'Failed to add game');
    }
  };

  const handleCreateDraft = async () => {
    if (!draftForm.name) {
      toast.error('Draft name is required');
      return;
    }

    try {
      // Get current user for creatorId - we'll get it from session on backend
      const url = '/api/admin/drafts';
      const method = editingDraft ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...(editingDraft && { id: editingDraft }),
          name: draftForm.name,
          format: draftForm.format,
          date: draftForm.date,
          maxParticipants: draftForm.maxParticipants,
        }),
      });

      if (response.ok) {
        toast.success(editingDraft ? 'Draft updated!' : 'Draft created!');
        setShowAddDraftModal(false);
        setEditingDraft(null);
        setDraftForm({
          name: '',
          format: 'draft',
          date: new Date().toISOString().split('T')[0],
          maxParticipants: 16,
        });
        fetchDrafts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save draft');
      }
    } catch {
      toast.error('Failed to save draft');
    }
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: FaChartLine },
    { id: 'search' as TabType, label: 'Advanced Search', icon: FaSearch },
    { id: 'players' as TabType, label: 'Players (1-16)', icon: FaUsers },
    { id: 'games' as TabType, label: 'Games', icon: FaTrophy },
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: FaTable },
    { id: 'events' as TabType, label: 'Events', icon: FaCalendar },
    { id: 'news' as TabType, label: 'News', icon: FaNewspaper },
    { id: 'pairings' as TabType, label: 'Commander Pairings', icon: FaChess },
    { id: 'bulk' as TabType, label: 'Bulk Operations', icon: FaMagic },
    { id: 'drafts' as TabType, label: 'Drafts', icon: FaDice },
    { id: 'scoring' as TabType, label: 'Scoring Rules', icon: FaTrophy },
    { id: 'seasons' as TabType, label: 'Seasons', icon: FaCalendar },
    { id: 'pages' as TabType, label: 'Page Content', icon: FaFileAlt },
    { id: 'settings' as TabType, label: 'Settings', icon: FaCog },
  ];

  // Auth check removed - control panel is now open for development
  // if (checkingAuth) { ... }
  // if (!isAdmin) { ... }

  const handleCreateRecords = useCallback(async () => {
    setCreatingRecords(true);
    try {
      const res = await fetch('/api/admin/populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      toast.success('League, players, and sample games created.');
      await refreshLeagues();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create records');
    } finally {
      setCreatingRecords(false);
    }
  }, [refreshLeagues]);

  if (leagueLoading || !currentLeague) {
    return (
      <div className="min-h-screen py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center space-y-6">
              <FaExclamationTriangle className="w-16 h-16 text-yellow-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">No League Available</h2>
              <p className="text-gray-400">Create a default league with 16 players and sample games to get started.</p>
              <Button
                onClick={handleCreateRecords}
                disabled={creatingRecords}
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 inline-flex items-center gap-2"
              >
                {creatingRecords ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaPlusCircle className="w-4 h-4" />
                )}
                Create League Tournament Records
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${siteImages.backgrounds.wizards})`,
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(139, 69, 19, 0.75)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">⚔️ Chaos League Tracker <span className="text-amber-400">Season 3</span></h1>
            <p className="text-gray-200">
              Edit players, scores, games, events, news. Changes appear on Leaderboard, Home, and Bulletin.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 shrink-0">
            <FaSignOutAlt className="w-4 h-4" />
            Log out
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-700 pb-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && <AdminDashboard />}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <AdvancedSearch
                onResultSelect={_result => {
                  // Handle result selection - could navigate to edit mode for that item
                }}
              />
            )}

            {/* Players Tab */}
            {activeTab === 'players' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Manage Players (1-16)</h2>
                  <Button onClick={() => setShowAddPlayerModal(true)}>
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Player
                  </Button>
                </div>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-700">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-200">#</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-200">
                              Name
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-200">
                              Email
                            </th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-200">
                              Commander
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-200">
                              Points
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-200">
                              Games
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-200">
                              Status
                            </th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-200">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {players.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-gray-400">
                                No players found. Add players to get started.
                              </td>
                            </tr>
                          ) : (
                            players.map((player, index) => (
                              <tr key={player.id} className="hover:bg-slate-700/50">
                                <td className="py-4 px-6 text-gray-300">{index + 1}</td>
                                <td className="py-4 px-6">
                                  {editingPlayer === player.id ? (
                                    <Input
                                      defaultValue={player.name}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          updatePlayer(player.id, {
                                            name: (e.target as HTMLInputElement).value,
                                          });
                                        } else if (e.key === 'Escape') {
                                          setEditingPlayer(null);
                                        }
                                      }}
                                      className="bg-slate-700 border-slate-600 text-white"
                                    />
                                  ) : (
                                    <span className="text-white font-medium">{player.name}</span>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-gray-300">{player.email}</td>
                                <td className="py-4 px-6 text-gray-300">
                                  {player.commander || 'Unknown'}
                                </td>
                                <td className="py-4 px-6 text-center text-gray-300">
                                  {player.totalPoints}
                                </td>
                                <td className="py-4 px-6 text-center text-gray-300">
                                  {player.gamesPlayed}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <Badge className={player.active ? 'bg-green-600' : 'bg-gray-600'}>
                                    {player.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setEditingPlayer(
                                          editingPlayer === player.id ? null : player.id
                                        )
                                      }
                                    >
                                      <FaEdit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deletePlayer(player.id)}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <FaTrash className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && currentLeague && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Manage Games</h2>
                  <Button onClick={() => setShowAddGameModal(true)}>
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Game
                  </Button>
                </div>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-700">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-200">Date</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-200">Type</th>
                            <th className="text-left py-4 px-6 font-semibold text-gray-200">Players</th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-200">Round</th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-200">Table</th>
                            <th className="text-center py-4 px-6 font-semibold text-gray-200">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {games.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-gray-400">
                                No games found. Add games to get started.
                              </td>
                            </tr>
                          ) : (
                            games.map((game) => {
                              const gamePlayers = typeof game.players === 'string' 
                                ? JSON.parse(game.players) 
                                : game.players || [];
                              const gamePlacements = typeof game.placements === 'string'
                                ? JSON.parse(game.placements)
                                : game.placements || [];
                              
                              return (
                                <tr key={game.id} className="hover:bg-slate-700/50">
                                  <td className="py-4 px-6 text-gray-300">
                                    {new Date(game.date).toLocaleDateString()}
                                  </td>
                                  <td className="py-4 px-6">
                                    <Badge className="bg-purple-600">
                                      {game.gameType || 'commander'}
                                    </Badge>
                                  </td>
                                  <td className="py-4 px-6 text-gray-300">
                                    {gamePlacements.length > 0 ? (
                                      <div className="space-y-1">
                                        {gamePlacements.slice(0, 2).map((p: any, idx: number) => (
                                          <div key={idx} className="text-sm">
                                            #{p.placement} - {p.playerName || 'Player'}
                                          </div>
                                        ))}
                                        {gamePlacements.length > 2 && (
                                          <div className="text-xs text-gray-500">
                                            +{gamePlacements.length - 2} more
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">{gamePlayers.length} players</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6 text-center text-gray-300">
                                    {game.round || '-'}
                                  </td>
                                  <td className="py-4 px-6 text-center text-gray-300">
                                    {game.tableNumber || '-'}
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                    <div className="flex justify-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          // Load game data for editing
                                          try {
                                            const response = await fetch(
                                              `/api/admin/games?leagueId=${currentLeague.id}&id=${game.id}`,
                                              { credentials: 'include' }
                                            );
                                            if (response.ok) {
                                              const data = await response.json();
                                              const gameData = data.games?.find((g: { id: string }) => g.id === game.id) || game;
                                              
                                              const gamePlayers = typeof gameData.players === 'string' 
                                                ? JSON.parse(gameData.players) 
                                                : gameData.players || [];
                                              const gamePlacements = typeof gameData.placements === 'string'
                                                ? JSON.parse(gameData.placements)
                                                : gameData.placements || [];
                                              
                                              setGameForm({
                                                gameType: gameData.gameType || 'commander',
                                                date: new Date(gameData.date).toISOString().split('T')[0],
                                                tournamentPhase: gameData.tournamentPhase || 'swiss',
                                                round: gameData.round?.toString() || '',
                                                tableNumber: gameData.tableNumber?.toString() || '',
                                                players: gamePlayers,
                                                placements: gamePlacements.map((p: any) => ({
                                                  playerId: p.playerId || p.id,
                                                  placement: p.placement || p.place || 1,
                                                  points: p.points || 0,
                                                  commander: p.commander || '',
                                                })),
                                                notes: gameData.notes || '',
                                              });
                                              setEditingGame(game.id);
                                              setShowAddGameModal(true);
                                            }
                                          } catch {
                                            toast.error('Failed to load game data');
                                          }
                                        }}
                                      >
                                        <FaEdit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          if (!confirm('Are you sure you want to delete this game?')) return;
                                          try {
                                            const response = await fetch(`/api/admin/games?id=${game.id}`, {
                                              method: 'DELETE',
                                              credentials: 'include',
                                            });
                                            if (response.ok) {
                                              toast.success('Game deleted');
                                              fetchGames();
                                            } else {
                                              toast.error('Failed to delete game');
                                            }
                                          } catch (error) {
                                            toast.error('Failed to delete game');
                                          }
                                        }}
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <FaTrash className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Manage Events</h2>
                  <Button onClick={() => setShowAddEventModal(true)}>
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-400">No events found. Add events to get started.</p>
                    </div>
                  ) : (
                    events.map(event => (
                      <Card
                        key={event.id}
                        className="bg-slate-800/90 border-slate-700 backdrop-blur-sm"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-white">{event.title}</CardTitle>
                              <CardDescription className="text-gray-300 mt-2">
                                {event.description || 'No description'}
                              </CardDescription>
                            </div>
                            <Badge
                              className={
                                event.status === 'upcoming' ? 'bg-blue-600' : 'bg-gray-600'
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-gray-300">
                            <p>
                              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                            </p>
                            {event.time && (
                              <p>
                                <strong>Time:</strong> {event.time}
                              </p>
                            )}
                            {event.location && (
                              <p>
                                <strong>Location:</strong> {event.location}
                              </p>
                            )}
                            <p>
                              <strong>Participants:</strong> {event.participants}/
                              {event.maxParticipants}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const eventToEdit = events.find(e => e.id === event.id);
                                if (eventToEdit) {
                                  setEventForm({
                                    title: eventToEdit.title,
                                    description: eventToEdit.description || '',
                                    date: new Date(eventToEdit.date).toISOString().split('T')[0],
                                    time: eventToEdit.time || '',
                                    location: eventToEdit.location || '',
                                    maxParticipants: eventToEdit.maxParticipants,
                                  });
                                  setEditingEvent(event.id);
                                  setShowAddEventModal(true);
                                }
                              }}
                            >
                              <FaEdit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteEvent(event.id)}
                              className="text-red-400"
                            >
                              <FaTrash className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* News Tab */}
            {activeTab === 'news' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Manage News</h2>
                  <Button onClick={() => setShowAddNewsModal(true)}>
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add News
                  </Button>
                </div>

                <div className="space-y-4">
                  {news.length === 0 ? (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-400">
                          No news items found. Add news to get started.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    news.map(item => (
                      <Card key={item.id} className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-purple-600">{item.category}</Badge>
                                <span className="text-sm text-gray-400">
                                  {new Date(item.publishedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <CardTitle className="text-white">{item.title}</CardTitle>
                              {item.excerpt && (
                                <CardDescription className="text-gray-300 mt-2">
                                  {item.excerpt}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newsToEdit = news.find(n => n.id === item.id);
                                if (newsToEdit) {
                                  setNewsForm({
                                    title: newsToEdit.title,
                                    excerpt: newsToEdit.excerpt || '',
                                    category: newsToEdit.category,
                                  });
                                  setEditingNews(item.id);
                                  setShowAddNewsModal(true);
                                }
                              }}
                            >
                              <FaEdit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteNews(item.id)}
                              className="text-red-400"
                            >
                              <FaTrash className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && currentLeague && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Leaderboard Editor</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Excel-like editable table. Double-click any cell to edit player stats.
                    </p>
                  </div>
                </div>
                <EditableLeaderboardTable leagueId={currentLeague.id} />
              </div>
            )}

            {/* Bulk Operations Tab */}
            {activeTab === 'bulk' && (
              <BulkOperations
                onOperationComplete={() => {
                  // Refresh data when bulk operations complete
                  fetchPlayers();
                  fetchEvents();
                }}
              />
            )}

            {/* Pairings Tab */}
            {activeTab === 'pairings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Commander Game Pairings</h2>
                  <Button onClick={addPairing}>
                    <FaPlus className="w-4 h-4 mr-2" />
                    Create Pairing
                  </Button>
                </div>

                <div className="space-y-4">
                  {pairings.length === 0 ? (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-400">
                          No pairings found. Create pairings to schedule games.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    pairings.map(pairing => (
                      <Card
                        key={pairing.id}
                        className="bg-slate-800/90 border-slate-700 backdrop-blur-sm"
                      >
                        <CardHeader>
                          <CardTitle className="text-white">
                            Game on {new Date(pairing.date).toLocaleDateString()}
                          </CardTitle>
                          {pairing.tableNumber && (
                            <CardDescription className="text-gray-400">
                              Table {pairing.tableNumber} • Round {pairing.round}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {pairing.players.map((player: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-slate-700 rounded"
                              >
                                <span className="text-white">
                                  {player.playerName || player.name || `Player ${index + 1}`}
                                </span>
                                {player.commander && (
                                  <span className="text-sm text-gray-400">{player.commander}</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {pairing.notes && (
                            <p className="mt-4 text-sm text-gray-400">{pairing.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Drafts Tab */}
            {activeTab === 'drafts' && (
              <div className="space-y-6">
                <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Draft Management</CardTitle>
                        <CardDescription className="text-gray-300">
                          Create and manage draft events for your league
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setShowAddDraftModal(true);
                          setDraftForm({
                            name: '',
                            format: 'draft',
                            date: new Date().toISOString().split('T')[0],
                            maxParticipants: 16,
                          });
                        }}
                      >
                        <FaPlus className="w-4 h-4 mr-2" />
                        Create Draft
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {drafts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <FaDice className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p>No draft events yet. Create your first draft!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {drafts.map(draft => (
                          <Card key={draft.id} className="bg-slate-700 border-slate-600">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-white">
                                      {draft.name}
                                    </h3>
                                    <Badge
                                      className={
                                        draft.status === 'upcoming'
                                          ? 'bg-blue-600'
                                          : draft.status === 'in_progress'
                                            ? 'bg-green-600'
                                            : 'bg-gray-600'
                                      }
                                    >
                                      {draft.status}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-300 space-y-1">
                                    <p>
                                      <strong>Format:</strong> {draft.format}
                                    </p>
                                    <p>
                                      <strong>Date:</strong>{' '}
                                      {new Date(draft.date).toLocaleDateString()}
                                    </p>
                                    <p>
                                      <strong>Participants:</strong>{' '}
                                      {draft.participants?.length || 0} / {draft.maxParticipants}
                                    </p>
                                    <p>
                                      <strong>Pods:</strong> {draft.pods?.length || 0}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingDraft(draft.id);
                                      setDraftForm({
                                        name: draft.name,
                                        format: draft.format,
                                        date: new Date(draft.date).toISOString().split('T')[0],
                                        maxParticipants: draft.maxParticipants,
                                      });
                                      setShowAddDraftModal(true);
                                    }}
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      if (!confirm('Delete this draft event?')) return;
                                      try {
                                        const response = await fetch(
                                          `/api/admin/drafts?id=${draft.id}`,
                                          {
                                            method: 'DELETE',
                                            credentials: 'include',
                                          }
                                        );
                                        if (response.ok) {
                                          toast.success('Draft deleted');
                                          fetchDrafts();
                                        } else {
                                          toast.error('Failed to delete draft');
                                        }
                                      } catch (error) {
                                        toast.error('Failed to delete draft');
                                      }
                                    }}
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Scoring Rules Tab */}
            {activeTab === 'scoring' && currentLeague && (
              <ScoringRulesManager leagueId={currentLeague.id} />
            )}

            {/* Seasons Tab */}
            {activeTab === 'seasons' && currentLeague && (
              <SeasonManager leagueId={currentLeague.id} />
            )}

            {/* Page Content Tab — control titles, nav labels, hero, footer, etc. per page */}
            {activeTab === 'pages' && (
              <div className="space-y-6">
                <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Page Content</CardTitle>
                    <CardDescription className="text-gray-300">
                      Edit titles, nav labels, hero text, footer blurb, and other per-page info. Changes appear on Home, Leaderboard, Bulletin, header, and footer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pageContentEdit ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-white">Edit: {pageContentEdit.path}</h3>
                          <Button variant="outline" size="sm" onClick={() => setPageContentEdit(null)}>
                            Back to list
                          </Button>
                        </div>
                        <div>
                          <Label className="text-gray-300">Title</Label>
                          <Input
                            value={pageContentEdit.title}
                            onChange={e => setPageContentEdit({ ...pageContentEdit, title: e.target.value })}
                            className="bg-slate-900 border-slate-600 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Description</Label>
                          <Input
                            value={pageContentEdit.description}
                            onChange={e => setPageContentEdit({ ...pageContentEdit, description: e.target.value })}
                            className="bg-slate-900 border-slate-600 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Config (JSON)</Label>
                          <textarea
                            value={pageContentEdit.configJson}
                            onChange={e => setPageContentEdit({ ...pageContentEdit, configJson: e.target.value })}
                            className="w-full min-h-[200px] px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono text-sm mt-1"
                            spellCheck={false}
                          />
                          <p className="text-gray-500 text-xs mt-1">
                            e.g. navLabel, heroSubtitle, heroHeadline, heroTagline, footerBlurb, exploreTitle, exploreSubtitle, features (array of &#123; title, desc, href, cta &#125;)
                          </p>
                        </div>
                        <Button onClick={savePageContent} disabled={pageContentSaving}>
                          {pageContentSaving ? 'Saving…' : 'Save'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pageContentList.map(p => (
                          <div
                            key={p.path}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-amber-500/40"
                          >
                            <div>
                              <span className="font-medium text-white">{p.path}</span>
                              {p.title && <span className="text-gray-400 ml-2">— {p.title}</span>}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setPageContentEdit({
                                  path: p.path,
                                  title: p.title ?? '',
                                  description: p.description ?? '',
                                  configJson: JSON.stringify(p.config, null, 2),
                                })
                              }
                            >
                              Edit
                            </Button>
                          </div>
                        ))}
                        {pageContentList.length === 0 && (
                          <p className="text-gray-400">No page content. Run seed to add defaults.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">System Settings</CardTitle>
                    <CardDescription className="text-gray-300">
                      Configure global league settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* League Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">League Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Default Game Type
                          </label>
                          <select className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white">
                            <option value="commander">Commander</option>
                            <option value="draft">Draft</option>
                            <option value="standard">Standard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Auto-refresh Interval (seconds)
                          </label>
                          <Input
                            type="number"
                            defaultValue={60}
                            className="bg-slate-800 border-slate-600 text-white"
                            min={10}
                            max={300}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="live-updates"
                            defaultChecked
                            className="rounded border-slate-600 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="live-updates" className="text-gray-300">
                            Enable live leaderboard updates
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Display Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Display Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="show-avatars"
                            defaultChecked
                            className="rounded border-slate-600 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="show-avatars" className="text-gray-300">
                            Show player avatars
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="show-trends"
                            defaultChecked
                            className="rounded border-slate-600 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="show-trends" className="text-gray-300">
                            Show rank trends
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="compact-view"
                            className="rounded border-slate-600 text-amber-600 focus:ring-amber-500"
                          />
                          <label htmlFor="compact-view" className="text-gray-300">
                            Compact table view
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-slate-700">
                      <Button onClick={() => toast.success('Settings saved')}>
                        <FaSave className="w-4 h-4 mr-2" />
                        Save Settings
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toast('Settings reset to defaults')}
                      >
                        <FaRedo className="w-4 h-4 mr-2" />
                        Reset to Defaults
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Database Management */}
                <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Database Management</CardTitle>
                    <CardDescription className="text-gray-300">
                      Database maintenance and utilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!confirm('This will recalculate all leaderboard scores. Continue?')) return;
                          try {
                            const response = await fetch('/api/admin/leaderboard/recalculate', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ leagueId: currentLeague?.id }),
                            });
                            if (response.ok) {
                              toast.success('Leaderboard recalculated');
                            } else {
                              toast.error('Failed to recalculate');
                            }
                          } catch (error) {
                            toast.error('Failed to recalculate');
                          }
                        }}
                        className="border-amber-500/50 text-amber-400 hover:bg-amber-900/30"
                      >
                        <FaCalculator className="w-4 h-4 mr-2" />
                        Recalculate Scores
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/admin/health', {
                              credentials: 'include',
                            });
                            if (response.ok) {
                              const health = await response.json();
                              toast.success(`System healthy! Load: ${health.load || 0}%`);
                            } else {
                              toast.error('Health check failed');
                            }
                          } catch {
                            toast.error('Health check failed');
                          }
                        }}
                        className="border-green-500/50 text-green-400 hover:bg-green-900/30"
                      >
                        <FaExclamationTriangle className="w-4 h-4 mr-2" />
                        System Health Check
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Add Player Modal */}
        <Modal
          isOpen={showAddPlayerModal}
          onClose={() => setShowAddPlayerModal(false)}
          title="Add New Player"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Player Name</label>
              <Input
                value={playerForm.name}
                onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })}
                placeholder="Player 1, Player 2, etc."
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <Input
                value={playerForm.email}
                onChange={e => setPlayerForm({ ...playerForm, email: e.target.value })}
                type="email"
                placeholder="player@example.com"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Commander</label>
              <Input
                value={playerForm.commander}
                onChange={e => setPlayerForm({ ...playerForm, commander: e.target.value })}
                placeholder="Commander name"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={addPlayer}>Add Player</Button>
              <Button variant="outline" onClick={() => setShowAddPlayerModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit Event Modal */}
        <Modal
          isOpen={showAddEventModal}
          onClose={() => {
            setShowAddEventModal(false);
            setEditingEvent(null);
            setEventForm({
              title: '',
              description: '',
              date: '',
              time: '',
              location: '',
              maxParticipants: 32,
            });
          }}
          title={editingEvent ? 'Edit Event' : 'Add New Event'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Event Title</label>
              <Input
                value={eventForm.title}
                onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Monthly Commander Tournament"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={eventForm.description}
                onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="Event description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <Input
                  type="date"
                  value={eventForm.date}
                  onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                <Input
                  value={eventForm.time}
                  onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                  placeholder="2:00 PM"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
              <Input
                value={eventForm.location}
                onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Maui Community Center"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Max Participants
              </label>
              <Input
                type="number"
                value={eventForm.maxParticipants}
                onChange={e =>
                  setEventForm({ ...eventForm, maxParticipants: parseInt(e.target.value) || 32 })
                }
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={editingEvent ? updateEvent : addEvent}>
                {editingEvent ? 'Update Event' : 'Add Event'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddEventModal(false);
                  setEditingEvent(null);
                  setEventForm({
                    title: '',
                    description: '',
                    date: '',
                    time: '',
                    location: '',
                    maxParticipants: 32,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit News Modal */}
        <Modal
          isOpen={showAddNewsModal}
          onClose={() => {
            setShowAddNewsModal(false);
            setEditingNews(null);
            setNewsForm({ title: '', excerpt: '', category: 'Updates' });
          }}
          title={editingNews ? 'Edit News Item' : 'Add News Item'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <Input
                value={newsForm.title}
                onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                placeholder="News title"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={newsForm.category}
                onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              >
                <option>Updates</option>
                <option>Announcements</option>
                <option>Community</option>
                <option>Tournaments</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Excerpt</label>
              <textarea
                value={newsForm.excerpt}
                onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="News excerpt..."
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={editingNews ? updateNews : addNews}>
                {editingNews ? 'Update News' : 'Add News'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddNewsModal(false);
                  setEditingNews(null);
                  setNewsForm({ title: '', excerpt: '', category: 'Updates' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Pairing Modal */}
        <Modal
          isOpen={showAddPairingModal}
          onClose={() => setShowAddPairingModal(false)}
          title="Create New Pairing"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Game Type</label>
              <select
                value={pairingForm.gameType}
                onChange={e => setPairingForm({ ...pairingForm, gameType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              >
                <option value="commander">Commander (4FFA)</option>
                <option value="draft">Draft (1v1)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <Input
                  type="date"
                  value={pairingForm.date}
                  onChange={e => setPairingForm({ ...pairingForm, date: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                <Input
                  type="time"
                  value={pairingForm.time}
                  onChange={e => setPairingForm({ ...pairingForm, time: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Players ({pairingForm.selectedPlayers.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg p-2 bg-slate-800">
                {players
                  .filter(p => p.active)
                  .map(player => (
                    <label
                      key={player.id}
                      className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={pairingForm.selectedPlayers.includes(player.id)}
                        onChange={() => togglePlayerSelection(player.id)}
                        className="rounded border-slate-600 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-white">{player.name}</span>
                      {player.commander && (
                        <span className="text-xs text-gray-400">({player.commander})</span>
                      )}
                    </label>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Table Number (optional)
                </label>
                <Input
                  type="number"
                  value={pairingForm.tableNumber}
                  onChange={e => setPairingForm({ ...pairingForm, tableNumber: e.target.value })}
                  placeholder="Table number"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Round (optional)
                </label>
                <Input
                  type="number"
                  value={pairingForm.round}
                  onChange={e => setPairingForm({ ...pairingForm, round: e.target.value })}
                  placeholder="Round number"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tournament Phase (optional)
              </label>
              <select
                value={pairingForm.tournamentPhase}
                onChange={e => setPairingForm({ ...pairingForm, tournamentPhase: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              >
                <option value="">None</option>
                <option value="swiss">Swiss</option>
                <option value="top8">Top 8</option>
                <option value="quarterfinals">Quarterfinals</option>
                <option value="semifinals">Semifinals</option>
                <option value="finals">Finals</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={pairingForm.notes}
                onChange={e => setPairingForm({ ...pairingForm, notes: e.target.value })}
                placeholder="Game notes and highlights..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCreatePairing}>Create Pairing</Button>
              <Button variant="outline" onClick={() => setShowAddPairingModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit Game Modal */}
        <Modal
          isOpen={showAddGameModal}
          onClose={() => {
            setShowAddGameModal(false);
            setEditingGame(null);
            setGameForm({
              gameType: 'commander',
              date: new Date().toISOString().split('T')[0],
              tournamentPhase: 'swiss',
              round: '',
              tableNumber: '',
              players: [],
              placements: [],
              notes: '',
            });
          }}
          title={editingGame ? 'Edit Game' : 'Add New Game'}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Game Type</label>
                <select
                  value={gameForm.gameType}
                  onChange={e => setGameForm({ ...gameForm, gameType: e.target.value as 'commander' | 'draft' })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                >
                  <option value="commander">Commander</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <Input
                  type="date"
                  value={gameForm.date}
                  onChange={e => setGameForm({ ...gameForm, date: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Round (optional)</label>
                <Input
                  type="number"
                  value={gameForm.round}
                  onChange={e => setGameForm({ ...gameForm, round: e.target.value })}
                  placeholder="Round number"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Table Number (optional)</label>
                <Input
                  type="number"
                  value={gameForm.tableNumber}
                  onChange={e => setGameForm({ ...gameForm, tableNumber: e.target.value })}
                  placeholder="Table number"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tournament Phase</label>
              <select
                value={gameForm.tournamentPhase}
                onChange={e => setGameForm({ ...gameForm, tournamentPhase: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              >
                <option value="swiss">Swiss</option>
                <option value="top8">Top 8</option>
                <option value="quarterfinals">Quarterfinals</option>
                <option value="semifinals">Semifinals</option>
                <option value="finals">Finals</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Players ({gameForm.players.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg p-2 bg-slate-800">
                {players
                  .filter(p => p.active)
                  .map(player => (
                    <label
                      key={player.id}
                      className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={gameForm.players.includes(player.id)}
                        onChange={() => {
                          const isSelected = gameForm.players.includes(player.id);
                          if (isSelected) {
                            setGameForm({
                              ...gameForm,
                              players: gameForm.players.filter(id => id !== player.id),
                              placements: gameForm.placements.filter(p => p.playerId !== player.id),
                            });
                          } else {
                            setGameForm({
                              ...gameForm,
                              players: [...gameForm.players, player.id],
                              placements: [
                                ...gameForm.placements,
                                {
                                  playerId: player.id,
                                  placement: gameForm.placements.length + 1,
                                  points: 0,
                                  commander: (player as { commander?: string }).commander || '',
                                },
                              ],
                            });
                          }
                        }}
                        className="rounded border-slate-600 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-white">{player.name}</span>
                    </label>
                  ))}
              </div>
            </div>

            {gameForm.players.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Set Placements & Points</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-600 rounded-lg p-3 bg-slate-800">
                  {gameForm.placements.map((placement, idx) => {
                    const player = players.find(p => p.id === placement.playerId);
                    return (
                      <div
                        key={placement.playerId}
                        className={`flex flex-wrap items-center gap-3 p-2 bg-slate-700/50 rounded ${gameForm.gameType === 'commander' ? 'gap-y-2' : ''}`}
                      >
                        <span className="text-white text-sm w-32 shrink-0">{player?.name || 'Player'}</span>
                        <Input
                          type="number"
                          min="1"
                          value={placement.placement}
                          onChange={e => {
                            const newPlacements = [...gameForm.placements];
                            newPlacements[idx].placement = parseInt(e.target.value) || 1;
                            setGameForm({ ...gameForm, placements: newPlacements });
                          }}
                          placeholder="Place"
                          className="w-20 bg-slate-700 border-slate-600 text-white"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={placement.points}
                          onChange={e => {
                            const newPlacements = [...gameForm.placements];
                            newPlacements[idx].points = parseInt(e.target.value) || 0;
                            setGameForm({ ...gameForm, placements: newPlacements });
                          }}
                          placeholder="Points"
                          className="w-24 bg-slate-700 border-slate-600 text-white"
                        />
                        {gameForm.gameType === 'commander' && (
                          <Input
                            value={placement.commander ?? ''}
                            onChange={e => {
                              const newPlacements = [...gameForm.placements];
                              newPlacements[idx] = { ...newPlacements[idx], commander: e.target.value };
                              setGameForm({ ...gameForm, placements: newPlacements });
                            }}
                            placeholder="Commander"
                            className="min-w-[140px] flex-1 max-w-xs bg-slate-700 border-slate-600 text-white"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Notes (optional)</label>
              <textarea
                value={gameForm.notes}
                onChange={e => setGameForm({ ...gameForm, notes: e.target.value })}
                placeholder="Game notes..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={addGame}>
                {editingGame ? 'Update Game' : 'Add Game'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddGameModal(false);
                  setEditingGame(null);
                  setGameForm({
                    gameType: 'commander',
                    date: new Date().toISOString().split('T')[0],
                    tournamentPhase: 'swiss',
                    round: '',
                    tableNumber: '',
                    players: [],
                    placements: [],
                    notes: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit Draft Modal */}
        <Modal
          isOpen={showAddDraftModal}
          onClose={() => {
            setShowAddDraftModal(false);
            setEditingDraft(null);
            setDraftForm({
              name: '',
              format: 'draft',
              date: new Date().toISOString().split('T')[0],
              maxParticipants: 16,
            });
          }}
          title={editingDraft ? 'Edit Draft Event' : 'Create Draft Event'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Draft Name</label>
              <Input
                value={draftForm.name}
                onChange={e => setDraftForm({ ...draftForm, name: e.target.value })}
                placeholder="Chaos Draft - January 2026"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Format</label>
              <select
                value={draftForm.format}
                onChange={e => setDraftForm({ ...draftForm, format: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              >
                <option value="draft">Draft</option>
                <option value="sealed">Sealed</option>
                <option value="cube">Cube Draft</option>
                <option value="chaos">Chaos Draft</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <Input
                  type="date"
                  value={draftForm.date}
                  onChange={e => setDraftForm({ ...draftForm, date: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Participants
                </label>
                <Input
                  type="number"
                  value={draftForm.maxParticipants}
                  onChange={e =>
                    setDraftForm({ ...draftForm, maxParticipants: parseInt(e.target.value) || 16 })
                  }
                  min="4"
                  max="32"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleCreateDraft}>
                {editingDraft ? 'Update Draft' : 'Create Draft'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDraftModal(false);
                  setEditingDraft(null);
                  setDraftForm({
                    name: '',
                    format: 'draft',
                    date: new Date().toISOString().split('T')[0],
                    maxParticipants: 16,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}

