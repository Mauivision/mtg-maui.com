'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/Input';
import { FaSave, FaUndo, FaPlus, FaTrash, FaExclamationTriangle, FaSearch, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import type { EditableLeaderboardEntry } from '@/types/leaderboard';

// Alias for cleaner code
type LeaderboardEntry = EditableLeaderboardEntry;

interface EditableCellProps {
  value: string | number;
  onSave: (value: string | number) => void;
  type?: 'text' | 'number';
  disabled?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  showControls?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  type = 'text',
  disabled = false,
  onIncrement,
  onDecrement,
  showControls = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  const handleClick = () => {
    if (!disabled && !isEditing) {
      setIsEditing(true);
      setEditValue(String(value));
    }
  };

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
      setEditValue(String(value));
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(String(value));
    } else if (e.key === 'Tab') {
      handleSave();
    } else if (e.key === 'ArrowUp' && type === 'number' && onIncrement) {
      e.preventDefault();
      onIncrement();
    } else if (e.key === 'ArrowDown' && type === 'number' && onDecrement) {
      e.preventDefault();
      onDecrement();
    }
  };

  const handleSave = () => {
    if (isEditing) {
      const newValue = type === 'number' ? parseFloat(editValue) || 0 : editValue;
      onSave(newValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 border-2 border-purple-500 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
        style={{ minWidth: '80px' }}
      />
    );
  }

  return (
    <div className="flex items-center group">
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={`flex-1 px-2 py-1 min-h-[32px] flex items-center ${disabled ? 'cursor-default' : 'cursor-pointer hover:bg-slate-700/50'} transition-colors`}
        title={disabled ? '' : 'Click or double-click to edit'}
      >
        {value}
      </div>
      {showControls && type === 'number' && !disabled && onIncrement && onDecrement && (
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIncrement();
            }}
            className="px-1 py-0.5 text-xs text-green-400 hover:bg-green-900/30 rounded-t"
            title="Increment (↑)"
          >
            <FaChevronUp className="w-2 h-2" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDecrement();
            }}
            className="px-1 py-0.5 text-xs text-red-400 hover:bg-red-900/30 rounded-b"
            title="Decrement (↓)"
          >
            <FaChevronDown className="w-2 h-2" />
          </button>
        </div>
      )}
    </div>
  );
};

interface EditableLeaderboardTableProps {
  leagueId: string;
}

export const EditableLeaderboardTable: React.FC<EditableLeaderboardTableProps> = ({ leagueId }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [originalEntries, setOriginalEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'points' | 'name' | 'wins'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leagues/${leagueId}/leaderboard`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch leaderboard' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      const fetchedEntries: LeaderboardEntry[] = (data.entries || []).map((entry: any) => ({
        rank: entry.rank || 0,
        playerId: entry.playerId || entry.id || '',
        playerName: entry.playerName || entry.name || 'Unknown',
        totalPoints: entry.totalPoints || entry.points || 0,
        gamesPlayed: entry.gamesPlayed || 0,
        wins: entry.wins || 0,
        losses: entry.losses || 0,
        averagePlacement: entry.averagePlacement || 0,
        eloRating: entry.eloRating || 1500,
        recentForm: entry.recentForm || [],
      }));
      setEntries(fetchedEntries);
      setOriginalEntries(JSON.parse(JSON.stringify(fetchedEntries)));
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leaderboard';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const updateCell = (playerId: string, field: keyof LeaderboardEntry, value: string | number) => {
    setEntries(prev => {
      const updated = prev.map(entry => {
        if (entry.playerId === playerId) {
          const updatedEntry = { ...entry, [field]: value };
          return updatedEntry;
        }
        return entry;
      });

      // Check if there are changes
      const hasModifications = JSON.stringify(updated) !== JSON.stringify(originalEntries);
      setHasChanges(hasModifications);

      return updated;
    });
  };

  const incrementValue = (playerId: string, field: keyof LeaderboardEntry, step: number = 1) => {
    const entry = entries.find(e => e.playerId === playerId);
    if (entry) {
      const currentValue = entry[field];
      if (typeof currentValue === 'number') {
        updateCell(playerId, field, currentValue + step);
      }
    }
  };

  const decrementValue = (playerId: string, field: keyof LeaderboardEntry, step: number = 1) => {
    const entry = entries.find(e => e.playerId === playerId);
    if (entry) {
      const currentValue = entry[field];
      if (typeof currentValue === 'number') {
        updateCell(playerId, field, Math.max(0, currentValue - step));
      }
    }
  };

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    return entries
      .filter(entry => 
        entry.playerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'rank':
            comparison = a.rank - b.rank;
            break;
          case 'points':
            comparison = a.totalPoints - b.totalPoints;
            break;
          case 'name':
            comparison = a.playerName.localeCompare(b.playerName);
            break;
          case 'wins':
            comparison = a.wins - b.wins;
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [entries, searchQuery, sortBy, sortDirection]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Update each player that has changes
      const changes = entries
        .map(entry => {
          const original = originalEntries.find(o => o.playerId === entry.playerId);
          if (!original) return null;

          // Check if this entry has changes
          const changed =
            entry.totalPoints !== original.totalPoints ||
            entry.gamesPlayed !== original.gamesPlayed ||
            entry.wins !== original.wins ||
            entry.averagePlacement !== original.averagePlacement;

          if (changed) {
            return {
              playerId: entry.playerId,
              totalPoints: entry.totalPoints,
              gamesPlayed: entry.gamesPlayed,
              wins: entry.wins,
              averagePlacement: entry.averagePlacement,
            };
          }
          return null;
        })
        .filter(Boolean);

      if (changes.length === 0) {
        toast('No changes to save');
        setSaving(false);
        return;
      }

      // Save via API
      const response = await fetch('/api/admin/leaderboard/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ leagueId, updates: changes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save changes' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const result = await response.json();
      toast.success(result.message || `Successfully updated ${changes.length} player(s)`);
      await fetchLeaderboard(); // Refresh to get latest data
    } catch (error) {
      console.error('Error saving leaderboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setEntries(JSON.parse(JSON.stringify(originalEntries)));
    setHasChanges(false);
    toast('Changes discarded');
  };

  const addRow = () => {
      toast('To add a new player, use the "Players" tab first. Then refresh the leaderboard.');
  };

  const deleteRow = (playerId: string) => {
    if (
      confirm(
        'Note: This only removes the player from this view. To permanently deactivate a player, use the Players tab.'
      )
    ) {
      setEntries(prev => prev.filter(e => e.playerId !== playerId));
      setHasChanges(false); // Don't mark as changed since this is just a view filter
      toast('Player removed from view. Refresh to see all players again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-gray-400 text-sm">Loading leaderboard data...</p>
      </div>
    );
  }

  if (entries.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-2">No players found</p>
        <p className="text-gray-500 text-sm">Add players to the league to see them here.</p>
        <Button
          onClick={fetchLeaderboard}
          variant="outline"
          className="mt-4 border-slate-600 text-gray-300 hover:bg-slate-700"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            onClick={saveChanges}
            disabled={!hasChanges || saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FaSave className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={resetChanges}
            disabled={!hasChanges}
            variant="outline"
            className="border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            <FaUndo className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={fetchLeaderboard}
            variant="outline"
            className="border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            Refresh
          </Button>
        </div>
        <Button
          onClick={addRow}
          variant="outline"
          className="border-purple-600 text-purple-400 hover:bg-purple-900/30"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-4 py-2 rounded-lg flex items-center gap-2">
          <FaExclamationTriangle className="w-4 h-4" />
          <span>You have unsaved changes. Click &quot;Save Changes&quot; to apply them.</span>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search players by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-gray-500 focus:border-amber-500"
          />
        </div>
        {searchQuery && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            Clear
          </Button>
        )}
        <div className="text-sm text-gray-400">
          Showing {filteredAndSortedEntries.length} of {entries.length} players
        </div>
      </div>

      {/* Excel-like Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Leaderboard Editor</CardTitle>
          <p className="text-gray-400 text-sm mt-2">
            <span className="text-green-400 font-semibold">Easy Editing:</span> Click or double-click any cell to edit. 
            Use ↑/↓ arrow keys or hover buttons to adjust numbers. Press Enter to save, Esc to cancel.
            <span className="text-yellow-400">
              {' '}
              *Games played is calculated from actual games and cannot be edited directly.
            </span>
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-700 border-b border-slate-600">
                  <th 
                    className="text-left py-3 px-4 text-white font-semibold border-r border-slate-600 sticky left-0 bg-slate-700 z-10 cursor-pointer hover:bg-slate-600 transition-colors select-none"
                    onClick={() => {
                      if (sortBy === 'rank') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('rank');
                        setSortDirection('asc');
                      }
                    }}
                    title="Click to sort by rank"
                  >
                    <div className="flex items-center gap-2">
                      <span>#</span>
                      {sortBy === 'rank' && (
                        <span className="text-amber-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-white font-semibold border-r border-slate-600 min-w-[200px] cursor-pointer hover:bg-slate-600 transition-colors select-none"
                    onClick={() => {
                      if (sortBy === 'name') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('name');
                        setSortDirection('asc');
                      }
                    }}
                    title="Click to sort by name"
                  >
                    <div className="flex items-center gap-2">
                      <span>Player Name</span>
                      {sortBy === 'name' && (
                        <span className="text-amber-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-center py-3 px-4 text-white font-semibold border-r border-slate-600 min-w-[100px] cursor-pointer hover:bg-slate-600 transition-colors select-none"
                    onClick={() => {
                      if (sortBy === 'points') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('points');
                        setSortDirection('desc');
                      }
                    }}
                    title="Click to sort by points"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Points</span>
                      {sortBy === 'points' && (
                        <span className="text-amber-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="text-center py-3 px-4 text-white font-semibold border-r border-slate-600 min-w-[100px]"
                    title="Games played is calculated from actual games"
                  >
                    Games*
                  </th>
                  <th 
                    className="text-center py-3 px-4 text-white font-semibold border-r border-slate-600 min-w-[100px] cursor-pointer hover:bg-slate-600 transition-colors select-none"
                    onClick={() => {
                      if (sortBy === 'wins') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('wins');
                        setSortDirection('desc');
                      }
                    }}
                    title="Click to sort by wins"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Wins</span>
                      {sortBy === 'wins' && (
                        <span className="text-amber-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 text-white font-semibold border-r border-slate-600 min-w-[120px]">
                    Avg Place
                  </th>
                  <th className="text-center py-3 px-4 text-white font-semibold border-r border-slate-600 min-w-[100px]">
                    ELO
                  </th>
                  <th className="text-center py-3 px-4 text-white font-semibold min-w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      {searchQuery ? 'No players found matching your search.' : 'No players in leaderboard. Add players to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedEntries.map((entry, index) => (
                    <tr
                      key={entry.playerId}
                      className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-2 px-4 text-gray-300 border-r border-slate-700 sticky left-0 bg-slate-800 z-10">
                        {index + 1}
                      </td>
                      <td className="py-2 px-0 border-r border-slate-700">
                        <EditableCell
                          value={entry.playerName}
                          onSave={value => updateCell(entry.playerId, 'playerName', value)}
                          type="text"
                        />
                      </td>
                      <td className="py-2 px-0 border-r border-slate-700">
                        <EditableCell
                          value={entry.totalPoints}
                          onSave={value => updateCell(entry.playerId, 'totalPoints', value)}
                          type="number"
                          onIncrement={() => incrementValue(entry.playerId, 'totalPoints', 1)}
                          onDecrement={() => decrementValue(entry.playerId, 'totalPoints', 1)}
                          showControls={true}
                        />
                      </td>
                      <td className="py-2 px-0 border-r border-slate-700">
                        <EditableCell
                          value={entry.gamesPlayed}
                          onSave={value => updateCell(entry.playerId, 'gamesPlayed', value)}
                          type="number"
                          disabled={true}
                        />
                      </td>
                      <td className="py-2 px-0 border-r border-slate-700">
                        <EditableCell
                          value={entry.wins}
                          onSave={value => updateCell(entry.playerId, 'wins', value)}
                          type="number"
                          onIncrement={() => incrementValue(entry.playerId, 'wins', 1)}
                          onDecrement={() => decrementValue(entry.playerId, 'wins', 1)}
                          showControls={true}
                        />
                      </td>
                      <td className="py-2 px-0 border-r border-slate-700">
                        <EditableCell
                          value={entry.averagePlacement.toFixed(2)}
                          onSave={value =>
                            updateCell(
                              entry.playerId,
                              'averagePlacement',
                              parseFloat(String(value)) || 0
                            )
                          }
                          type="number"
                          onIncrement={() => incrementValue(entry.playerId, 'averagePlacement', 0.1)}
                          onDecrement={() => decrementValue(entry.playerId, 'averagePlacement', 0.1)}
                          showControls={true}
                        />
                      </td>
                      <td className="py-2 px-4 text-center text-gray-300 border-r border-slate-700">
                        {entry.eloRating}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRow(entry.playerId)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
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
  );
};
