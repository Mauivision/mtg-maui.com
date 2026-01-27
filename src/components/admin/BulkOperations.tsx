'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  FaUsers,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaUpload,
  FaDownload,
  FaMagic,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface BulkOperation {
  id: string;
  name: string;
  description: string;
  type: 'players' | 'events' | 'games' | 'system';
  action: () => Promise<void>;
  confirmMessage: string;
  danger?: boolean;
}

interface BulkOperationsProps {
  onOperationComplete: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({ onOperationComplete }) => {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationType, setOperationType] = useState<'players' | 'events' | 'games' | 'system'>(
    'players'
  );

  const bulkOperations: BulkOperation[] = [
    // Player Operations
    {
      id: 'activate-all-players',
      name: 'Activate All Players',
      description: 'Set all players as active members',
      type: 'players',
      action: async () => {
        const response = await fetch('/api/admin/bulk/players?action=activate', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to activate players');
      },
      confirmMessage: 'This will activate all players in the league. Continue?',
    },
    {
      id: 'deactivate-inactive',
      name: 'Deactivate Inactive Players',
      description: "Remove players who haven't played in 90 days",
      type: 'players',
      action: async () => {
        const response = await fetch('/api/admin/bulk/players/deactivate-inactive', {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to deactivate inactive players');
      },
      confirmMessage: "This will deactivate players who haven't played in 90 days. Continue?",
      danger: true,
    },
    {
      id: 'reset-all-points',
      name: 'Reset All Points',
      description: 'Set all player points to zero',
      type: 'players',
      action: async () => {
        const response = await fetch('/api/admin/bulk/players?action=reset-points', {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to reset points');
      },
      confirmMessage: 'This will reset ALL player points to zero. This cannot be undone. Continue?',
      danger: true,
    },

    // Event Operations
    {
      id: 'cancel-upcoming-events',
      name: 'Cancel All Upcoming Events',
      description: 'Cancel all events scheduled for the next 7 days',
      type: 'events',
      action: async () => {
        const response = await fetch('/api/admin/bulk/events?action=cancel-upcoming', {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to cancel events');
      },
      confirmMessage: 'This will cancel all upcoming events. Continue?',
      danger: true,
    },
    {
      id: 'duplicate-events',
      name: 'Duplicate Events This Month',
      description: "Create next month's events based on this month",
      type: 'events',
      action: async () => {
        const response = await fetch('/api/admin/bulk/events/duplicate-month', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to duplicate events');
      },
      confirmMessage: "This will create next month's events. Continue?",
    },

    // Game Operations
    {
      id: 'recalculate-scores',
      name: 'Recalculate All Scores',
      description: 'Recalculate points for all games using current rules',
      type: 'games',
      action: async () => {
        const response = await fetch('/api/admin/bulk/games?action=recalculate-scores', {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to recalculate scores');
      },
      confirmMessage: 'This will recalculate all game scores. Continue?',
    },
    {
      id: 'delete-old-games',
      name: 'Delete Games Older Than 1 Year',
      description: 'Remove games older than 365 days to free up space',
      type: 'games',
      action: async () => {
        const response = await fetch('/api/admin/bulk/games?action=delete-old', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to delete old games');
      },
      confirmMessage: 'This will permanently delete games older than 1 year. Continue?',
      danger: true,
    },

    // System Operations
    {
      id: 'generate-pairings',
      name: 'Generate Tournament Pairings',
      description: 'Auto-generate pairings for the next tournament round',
      type: 'system',
      action: async () => {
        const response = await fetch('/api/admin/bulk/system/generate-pairings', {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to generate pairings');
      },
      confirmMessage: 'This will generate pairings for the next tournament round. Continue?',
    },
    {
      id: 'backup-database',
      name: 'Create Database Backup',
      description: 'Download a complete backup of all league data',
      type: 'system',
      action: async () => {
        const response = await fetch('/api/admin/bulk/export');
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `mtg-maui-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          throw new Error('Failed to create backup');
        }
      },
      confirmMessage: 'Download a complete backup of all league data?',
    },
  ];

  const filteredOperations = bulkOperations.filter(
    op =>
      op.type === operationType &&
      (op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOperationExecute = async (operation: BulkOperation) => {
    if (!confirming) {
      setSelectedOperation(operation.id);
      setConfirming(true);
      return;
    }

    try {
      await operation.action();
      toast.success(`${operation.name} completed successfully!`);
      onOperationComplete();
    } catch (error) {
      toast.error(
        `${operation.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setSelectedOperation(null);
      setConfirming(false);
    }
  };

  const handleFileImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/bulk/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Data imported successfully!');
        onOperationComplete();
      } else {
        const error = await response.json();
        toast.error(`Import failed: ${error.error}`);
      }
    } catch (error) {
      toast.error('Import failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Bulk Operations</h2>
          <p className="text-gray-400">
            Perform mass operations on players, events, games, and system data
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search operations..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {(['players', 'events', 'games', 'system'] as const).map(type => (
                <Button
                  key={type}
                  variant={operationType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOperationType(type)}
                  className={
                    operationType === type ? 'bg-amber-600' : 'border-amber-400 text-amber-400'
                  }
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOperations.map(operation => (
          <Card
            key={operation.id}
            className={`bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer ${
              operation.danger ? 'border-red-500/50' : ''
            }`}
            onClick={() => !confirming && handleOperationExecute(operation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    operation.danger
                      ? 'bg-red-600'
                      : operation.type === 'players'
                        ? 'bg-blue-600'
                        : operation.type === 'events'
                          ? 'bg-green-600'
                          : operation.type === 'games'
                            ? 'bg-purple-600'
                            : 'bg-cyan-600'
                  }`}
                >
                  {operation.type === 'players' ? (
                    <FaUsers className="w-4 h-4" />
                  ) : operation.type === 'events' ? (
                    <FaEdit className="w-4 h-4" />
                  ) : operation.type === 'games' ? (
                    <FaMagic className="w-4 h-4" />
                  ) : (
                    <FaCheck className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{operation.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{operation.description}</p>
                  {operation.danger && <Badge className="bg-red-600 text-xs">⚠️ Destructive</Badge>}
                </div>
              </div>

              {/* Confirmation */}
              {selectedOperation === operation.id && confirming && (
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-amber-500/30">
                  <div className="flex items-start gap-2 mb-3">
                    <FaExclamationTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-300 text-sm">{operation.confirmMessage}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleOperationExecute(operation);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <FaCheck className="w-3 h-3 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedOperation(null);
                        setConfirming(false);
                      }}
                      className="border-slate-600 text-slate-300"
                    >
                      <FaTimes className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import/Export Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaUpload className="w-5 h-5 text-green-500" />
            Data Import/Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import */}
            <div>
              <h3 className="text-white font-medium mb-3">Import Data</h3>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                />
                <Button
                  onClick={handleFileImport}
                  disabled={!file}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                >
                  <FaUpload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Supports JSON and CSV formats. Use with caution - this will modify existing data.
              </p>
            </div>

            {/* Export */}
            <div>
              <h3 className="text-white font-medium mb-3">Export Data</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => window.open('/api/admin/bulk/export', '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <FaDownload className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                <Button
                  onClick={() => window.open('/api/admin/bulk/export?type=players', '_blank')}
                  variant="outline"
                  className="w-full border-blue-400 text-blue-400"
                >
                  <FaDownload className="w-4 h-4 mr-2" />
                  Export Players Only
                </Button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Downloads complete data backups in JSON format for safekeeping.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredOperations.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <FaFilter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No operations found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
