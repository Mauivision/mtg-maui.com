'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { FaFilter, FaDownload, FaSort } from 'react-icons/fa';

interface LeaderboardFiltersProps {
  gameType: 'all' | 'commander' | 'draft';
  onGameTypeChange: (type: 'all' | 'commander' | 'draft') => void;
  sortBy: 'points' | 'winRate' | 'gamesPlayed' | 'recentForm';
  onSortChange: (sort: 'points' | 'winRate' | 'gamesPlayed' | 'recentForm') => void;
  dateRange: 'all' | 'week' | 'month' | 'season';
  onDateRangeChange: (range: 'all' | 'week' | 'month' | 'season') => void;
  commanderFilter: string;
  onCommanderChange: (commander: string) => void;
  availableCommanders: string[];
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export function LeaderboardFilters({
  gameType,
  onGameTypeChange,
  sortBy,
  onSortChange,
  dateRange,
  onDateRangeChange,
  commanderFilter,
  onCommanderChange,
  availableCommanders,
  onExportCSV,
  onExportPDF,
}: LeaderboardFiltersProps) {
  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-4 mb-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Game Type Filter */}
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Game Type:</span>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'commander', label: 'Commander' },
              { value: 'draft', label: 'Draft' },
            ].map(tab => (
              <Button
                key={tab.value}
                variant={gameType === tab.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onGameTypeChange(tab.value as any)}
                className={gameType === tab.value ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Period:</span>
          <Select value={dateRange} onValueChange={v => onDateRangeChange(v as any)}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="season">This Season</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commander Filter */}
        {gameType === 'commander' || gameType === 'all' ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Commander:</span>
            <Select value={commanderFilter} onValueChange={onCommanderChange}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="All Commanders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Commanders</SelectItem>
                {availableCommanders.map(cmd => (
                  <SelectItem key={cmd} value={cmd}>
                    {cmd}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <FaSort className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Sort:</span>
          <Select value={sortBy} onValueChange={v => onSortChange(v as any)}>
            <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Total Points</SelectItem>
              <SelectItem value="winRate">Win Rate</SelectItem>
              <SelectItem value="gamesPlayed">Games Played</SelectItem>
              <SelectItem value="recentForm">Recent Form</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white"
          >
            <FaDownload className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            className="border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white"
          >
            <FaDownload className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
