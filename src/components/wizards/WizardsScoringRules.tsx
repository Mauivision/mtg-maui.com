'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import type { ScoringRules } from '@/types/wizards';

interface WizardsScoringRulesProps {
  scoringRules: ScoringRules;
  setScoringRules: (rules: ScoringRules | ((prev: ScoringRules) => ScoringRules)) => void;
  editingRules: boolean;
  setEditingRules: (editing: boolean) => void;
  onSave: () => void;
}

export function WizardsScoringRules({
  scoringRules,
  setScoringRules,
  editingRules,
  setEditingRules,
  onSave,
}: WizardsScoringRulesProps) {
  return (
    <div className="space-y-6">
      {/* Gold Objective Points */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Gold Objective</h3>
          <p className="text-sm text-slate-400">Points awarded for completing gold objectives</p>
        </div>
        <div className="flex items-center gap-4">
          {editingRules ? (
            <input
              type="number"
              value={scoringRules.goldObjective}
              onChange={e =>
                setScoringRules((prev: ScoringRules) => ({
                  ...prev,
                  goldObjective: parseInt(e.target.value) || 0,
                }))
              }
              className="w-20 px-3 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
            />
          ) : (
            <div className="text-2xl font-bold text-yellow-400">
              {scoringRules.goldObjective}
            </div>
          )}
          <span className="text-slate-400">points</span>
        </div>
      </div>

      {/* Silver Objective Points */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Silver Objective</h3>
          <p className="text-sm text-slate-400">Points awarded for completing silver objectives</p>
        </div>
        <div className="flex items-center gap-4">
          {editingRules ? (
            <input
              type="number"
              value={scoringRules.silverObjective}
              onChange={e =>
                setScoringRules((prev: ScoringRules) => ({
                  ...prev,
                  silverObjective: parseInt(e.target.value) || 0,
                }))
              }
              className="w-20 px-3 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
            />
          ) : (
            <div className="text-2xl font-bold text-slate-300">
              {scoringRules.silverObjective}
            </div>
          )}
          <span className="text-slate-400">points</span>
        </div>
      </div>

      {/* Placement Bonuses */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Placement Bonuses</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(scoringRules.placementBonus).map(([place, points]) => (
            <div key={place} className="bg-slate-800/80 rounded-lg p-4 border border-slate-600/50">
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">
                  {place === '1' ? '🥇 1st Place' : 
                   place === '2' ? '🥈 2nd Place' : 
                   place === '3' ? '🥉 3rd Place' : 
                   `${place}th Place`}
                </div>
                {editingRules ? (
                  <input
                    type="number"
                    value={points}
                    onChange={e =>
                      setScoringRules((prev: ScoringRules) => ({
                        ...prev,
                        placementBonus: {
                          ...prev.placementBonus,
                          [place]: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center"
                  />
                ) : (
                  <div className="text-xl font-bold text-amber-400">{points}</div>
                )}
                <div className="text-xs text-slate-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Controls */}
      <div className="flex justify-end gap-4 pt-4 border-t border-slate-600">
        {editingRules ? (
          <>
            <Button
              onClick={() => {
                onSave();
                setEditingRules(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <FaSave className="w-4 h-4 mr-2" />
              Save Rules
            </Button>
            <Button
              onClick={() => setEditingRules(false)}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <FaTimes className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setEditingRules(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Edit Rules
          </Button>
        )}
      </div>
    </div>
  );
}