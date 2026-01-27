'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/Input';
import {
  FaUsers,
  FaTrophy,
  FaChartLine,
  FaCog,
  FaDatabase,
  FaShieldAlt,
  FaMagic,
  FaCalendar,
  FaBullhorn,
  FaDownload,
  FaUpload,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaPlay,
  FaPause,
  FaCalculator,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  totalTournaments: number;
  totalEvents: number;
  dbSize: string;
  uptime: string;
  serverLoad: number;
}

interface RecentActivity {
  id: string;
  type: 'user_join' | 'game_recorded' | 'tournament_created' | 'event_created';
  message: string;
  timestamp: string;
  user?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/activity'),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const newStats = statsData.stats;
        setStats(newStats);
        
        // Determine system status based on stats
        if (newStats) {
          const load = newStats.serverLoad ?? 0;
          if (load > 80) {
            setSystemStatus('error');
          } else if (load > 60) {
            setSystemStatus('warning');
          } else {
            setSystemStatus('healthy');
          }
        }
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activity || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setSystemStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const quickActions: QuickAction[] = [
    {
      id: 'create-tournament',
      title: 'Create Tournament',
      description: 'Set up a new competitive tournament',
      icon: <FaTrophy className="w-5 h-5" />,
      action: () => window.open('/admin?action=create-tournament', '_blank'),
      variant: 'primary',
    },
    {
      id: 'generate-pairings',
      title: 'Generate Pairings',
      description: 'Auto-generate tournament pairings',
      icon: <FaMagic className="w-5 h-5" />,
      action: () => handleGeneratePairings(),
      variant: 'success',
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download league data backup',
      icon: <FaDownload className="w-5 h-5" />,
      action: () => handleExportData(),
      variant: 'secondary',
    },
    {
      id: 'recalculate-scores',
      title: 'Recalculate Scores',
      description: 'Update all leaderboard points based on current scoring rules',
      icon: <FaCalculator className="w-5 h-5" />,
      action: () => handleRecalculateScores(),
      variant: 'danger',
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Check database and server status',
      icon: <FaShieldAlt className="w-5 h-5" />,
      action: () => handleSystemHealth(),
      variant:
        systemStatus === 'healthy'
          ? 'success'
          : systemStatus === 'warning'
            ? 'secondary'
            : 'danger',
    },
    {
      id: 'populate-database',
      title: 'Populate Database',
      description: 'Add 16 sample players with games and scores',
      icon: <FaDatabase className="w-5 h-5" />,
      action: () => handlePopulateDatabase(),
      variant: 'primary',
    },
    {
      id: 'bulk-import',
      title: 'Bulk Import',
      description: 'Import players or tournament data',
      icon: <FaUpload className="w-5 h-5" />,
      action: () => handleBulkImport(),
      variant: 'secondary',
    },
    {
      id: 'announcement',
      title: 'Send Announcement',
      description: 'Broadcast message to all players',
      icon: <FaBullhorn className="w-5 h-5" />,
      action: () => handleSendAnnouncement(),
      variant: 'primary',
    },
  ];

  const handleGeneratePairings = async () => {
    try {
      const response = await fetch('/api/admin/pairings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: 'current', // Would get from context
          gameType: 'commander',
          date: new Date().toISOString(),
          players: [],
          recordedBy: 'system',
        }),
      });

      if (response.ok) {
        toast.success('Pairings generated successfully!');
        fetchDashboardData();
      } else {
        toast.error('Failed to generate pairings');
      }
    } catch (error) {
      toast.error('Failed to generate pairings');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/admin/bulk/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mtg-maui-league-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Data export completed!');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/health');
      if (response.ok) {
        const health = await response.json();
        toast.success(`System healthy! Load: ${health.load}%`);
      } else {
        toast.error('System health check failed');
      }
    } catch (error) {
      toast.error('System health check failed');
    }
  };

  const handlePopulateDatabase = async () => {
    if (!confirm('This will add 16 sample players with games and scores to the database. Continue?')) return;

    try {
      toast.loading('Populating database...', { id: 'populate' });
      const response = await fetch('/api/admin/populate', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Database populated successfully!', { id: 'populate' });
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to populate database', { id: 'populate' });
      }
    } catch (error) {
      console.error('Error populating database:', error);
      toast.error('Failed to populate database', { id: 'populate' });
    }
  };

  const handleBulkImport = () => {
    // Bulk import is available through the Bulk Operations tab
    window.location.href = '/admin?tab=bulk';
  };

  const handleRecalculateScores = async () => {
    if (
      !confirm(
        'This will recalculate all leaderboard points based on current scoring rules. Continue?'
      )
    )
      return;

    try {
      const response = await fetch('/api/admin/leaderboard/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: 'current' }), // Would get from context
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Recalculated ${data.updatedCount} game results!`);
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        toast.error('Failed to recalculate scores');
      }
    } catch (error) {
      toast.error('Failed to recalculate scores');
    }
  };

  const handleSendAnnouncement = () => {
    // Announcements are managed through the News API
    // This can open a modal or navigate to the news management page
    window.location.href = '/admin?tab=news';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="text-amber-500" />
        <span className="ml-3 text-white">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Banner */}
      <Card
        className={`border-2 ${
          systemStatus === 'healthy'
            ? 'border-green-500 bg-green-900/20'
            : systemStatus === 'warning'
              ? 'border-yellow-500 bg-yellow-900/20'
              : 'border-red-500 bg-red-900/20'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {systemStatus === 'healthy' ? (
                <FaCheckCircle className="w-6 h-6 text-green-500" />
              ) : systemStatus === 'warning' ? (
                <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />
              ) : (
                <FaExclamationTriangle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <h3 className="text-white font-semibold">
                  System Status: {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
                </h3>
                <p className="text-gray-300 text-sm">
                  {systemStatus === 'healthy'
                    ? 'All systems operational'
                    : systemStatus === 'warning'
                      ? 'Minor issues detected'
                      : 'Critical issues require attention'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Uptime</div>
              <div className="text-white font-mono">{stats?.uptime || 'Unknown'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
              <FaUsers className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Players</p>
                <p className="text-2xl font-bold text-green-400">{stats?.activeUsers || 0}</p>
              </div>
              <FaPlay className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Games Played</p>
                <p className="text-2xl font-bold text-purple-400">{stats?.totalGames || 0}</p>
              </div>
              <FaTrophy className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Server Load</p>
                <p
                  className={`text-2xl font-bold ${
                    (stats?.serverLoad || 0) > 80
                      ? 'text-red-400'
                      : (stats?.serverLoad || 0) > 60
                        ? 'text-yellow-400'
                        : 'text-green-400'
                  }`}
                >
                  {stats?.serverLoad || 0}%
                </p>
              </div>
              <FaDatabase className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaMagic className="w-5 h-5 text-amber-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map(action => (
              <Card
                key={action.id}
                className="bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-all hover:scale-105"
                onClick={action.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        action.variant === 'primary'
                          ? 'bg-blue-600'
                          : action.variant === 'success'
                            ? 'bg-green-600'
                            : action.variant === 'danger'
                              ? 'bg-red-600'
                              : 'bg-slate-600'
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm">{action.title}</h3>
                      <p className="text-gray-400 text-xs">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaClock className="w-5 h-5 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {activity.user?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.type === 'user_join'
                        ? 'default'
                        : activity.type === 'game_recorded'
                          ? 'secondary'
                          : activity.type === 'tournament_created'
                            ? 'primary'
                            : 'outline'
                    }
                    className="text-xs"
                  >
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
