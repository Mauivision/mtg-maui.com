'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  FaCalendar,
  FaTrophy,
  FaUsers,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaPlus,
  FaArchive,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  totalGames: number;
  totalPlayers: number;
  description?: string;
}

interface SeasonManagerProps {
  leagueId: string;
}

export const SeasonManager: React.FC<SeasonManagerProps> = ({ leagueId }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<string | null>(null);
  const [seasonForm, setSeasonForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'completed' | 'archived',
  });

  useEffect(() => {
    fetchSeasons();
  }, [leagueId]);

  const fetchSeasons = async () => {
    setLoading(true);
    try {
      // Fetch events that are marked as seasons
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        // Filter for season-type events or use all events as seasons
        const seasonEvents = (data.events || []).filter(
          (e: any) => e.title?.toLowerCase().includes('season') || e.location === 'Season'
        );

        // Transform to Season format
        const transformedSeasons: Season[] = seasonEvents.map((event: any) => ({
          id: event.id,
          name: event.title,
          startDate: event.date,
          endDate: event.date, // Would need endDate field
          status:
            event.status === 'upcoming'
              ? 'upcoming'
              : event.status === 'completed'
                ? 'completed'
                : event.status === 'cancelled'
                  ? 'archived'
                  : 'active',
          totalGames: 0, // Would calculate from games
          totalPlayers: event.participants || 0,
          description: event.description,
        }));

        setSeasons(transformedSeasons);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeason = async () => {
    if (!seasonForm.name || !seasonForm.startDate || !seasonForm.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create season as a special event type (using location='Season' as identifier)
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: seasonForm.name,
          description:
            seasonForm.description ||
            `Season running from ${seasonForm.startDate} to ${seasonForm.endDate}`,
          date: seasonForm.startDate,
          time: '00:00',
          location: 'Season', // Special identifier for seasons
          maxParticipants: 16,
          status: seasonForm.status === 'active' ? 'upcoming' : seasonForm.status,
        }),
      });

      if (response.ok) {
        toast.success('Season created successfully!');
        setShowCreateModal(false);
        setEditingSeason(null);
        setSeasonForm({
          name: '',
          startDate: '',
          endDate: '',
          description: '',
          status: 'upcoming',
        });
        fetchSeasons();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create season');
      }
    } catch (error) {
      console.error('Create season error:', error);
      toast.error('Failed to create season');
    }
  };

  const archiveSeason = async (seasonId: string) => {
    if (!confirm('Are you sure you want to archive this season? This will mark it as completed.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: seasonId,
          status: 'archived',
        }),
      });

      if (response.ok) {
        toast.success('Season archived');
        fetchSeasons();
      } else {
        toast.error('Failed to archive season');
      }
    } catch (error) {
      toast.error('Failed to archive season');
    }
  };

  const currentSeason = seasons.find(s => s.status === 'active');
  const upcomingSeasons = seasons.filter(s => s.status === 'upcoming');
  const completedSeasons = seasons.filter(s => s.status === 'completed' || s.status === 'archived');

  return (
    <div className="space-y-6">
      {/* Current Season */}
      {currentSeason && (
        <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-amber-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <FaTrophy className="text-amber-400" />
                  Current Season: {currentSeason.name}
                </CardTitle>
                <div className="text-sm text-gray-300 mt-2">
                  {new Date(currentSeason.startDate).toLocaleDateString()} -{' '}
                  {new Date(currentSeason.endDate).toLocaleDateString()}
                </div>
              </div>
              <Badge className="bg-green-600">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{currentSeason.totalGames}</div>
                <div className="text-sm text-gray-300">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {currentSeason.totalPlayers}
                </div>
                <div className="text-sm text-gray-300">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {Math.ceil(
                    (new Date().getTime() - new Date(currentSeason.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </div>
                <div className="text-sm text-gray-300">Days Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Season List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Seasons</CardTitle>
            <Button onClick={() => setShowCreateModal(true)}>
              <FaPlus className="mr-2" />
              Create Season
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
            </div>
          ) : seasons.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaCalendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No seasons yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upcoming Seasons */}
              {upcomingSeasons.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Upcoming Seasons</h3>
                  {upcomingSeasons.map(season => (
                    <Card key={season.id} className="bg-slate-700 border-slate-600 mb-3">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{season.name}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(season.startDate).toLocaleDateString()} -{' '}
                              {new Date(season.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600">Upcoming</Badge>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingSeason(season.id);
                                  setSeasonForm({
                                    name: season.name,
                                    startDate: season.startDate,
                                    endDate: season.endDate,
                                    description: season.description || '',
                                    status: season.status,
                                  });
                                  setShowCreateModal(true);
                                }}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => archiveSeason(season.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Archive season"
                              >
                                <FaArchive />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Completed Seasons */}
              {completedSeasons.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Past Seasons</h3>
                  {completedSeasons.map(season => (
                    <Card key={season.id} className="bg-slate-700 border-slate-600 mb-3">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{season.name}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(season.startDate).toLocaleDateString()} -{' '}
                              {new Date(season.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {season.totalGames} games • {season.totalPlayers} players
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gray-600">Completed</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => archiveSeason(season.id)}
                              className="text-gray-400"
                              title="Archive season"
                            >
                              <FaArchive />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Season Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSeason(null);
          setSeasonForm({
            name: '',
            startDate: '',
            endDate: '',
            description: '',
            status: 'upcoming',
          });
        }}
        title={editingSeason ? 'Edit Season' : 'Create New Season'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Season Name</label>
            <Input
              value={seasonForm.name}
              onChange={e => setSeasonForm({ ...seasonForm, name: e.target.value })}
              placeholder="Season 3 - 2026"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
              <Input
                type="date"
                value={seasonForm.startDate}
                onChange={e => setSeasonForm({ ...seasonForm, startDate: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
              <Input
                type="date"
                value={seasonForm.endDate}
                onChange={e => setSeasonForm({ ...seasonForm, endDate: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={seasonForm.status}
              onChange={e => setSeasonForm({ ...seasonForm, status: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={seasonForm.description}
              onChange={e => setSeasonForm({ ...seasonForm, description: e.target.value })}
              placeholder="Season description and goals..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleCreateSeason}>
              {editingSeason ? 'Update Season' : 'Create Season'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingSeason(null);
                setSeasonForm({
                  name: '',
                  startDate: '',
                  endDate: '',
                  description: '',
                  status: 'upcoming',
                });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
