'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalculator,
  FaTrophy,
  FaCog,
  FaSave,
  FaRedo as FaRefresh,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ScoringRule {
  id: string;
  leagueId: string;
  gameType: string;
  name: string;
  points: number;
  description?: string;
  active: boolean;
}

interface ScoringRulesManagerProps {
  leagueId: string;
}

export const ScoringRulesManager: React.FC<ScoringRulesManagerProps> = ({ leagueId }) => {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ScoringRule | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<'commander' | 'draft' | 'standard'>(
    'commander'
  );

  // Form states
  const [ruleForm, setRuleForm] = useState({
    gameType: 'commander' as 'commander' | 'draft' | 'standard',
    name: '',
    points: 0,
    description: '',
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/scoring-rules?leagueId=${leagueId}`);
      if (response.ok) {
        const data = await response.json();
        setRules(data.scoringRules || []);
      } else {
        toast.error('Failed to fetch scoring rules');
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to fetch scoring rules');
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const filteredRules = rules.filter(rule => rule.gameType === selectedGameType);

  const calculatePoints = async (ruleName: string, goldObjs = 0, silverObjs = 0, placement = 1) => {
    try {
      const response = await fetch('/api/admin/scoring-rules/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId,
          gameType: selectedGameType,
          placement,
          goldObjectives: goldObjs,
          silverObjectives: silverObjs,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.totalPoints;
      }
    } catch (error) {
      console.error('Error calculating points:', error);
    }
    return 0;
  };

  const addRule = async () => {
    if (!ruleForm.name.trim() || ruleForm.points < 0) {
      toast.error('Name and valid points are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/scoring-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId,
          gameType: ruleForm.gameType,
          name: ruleForm.name.trim(),
          points: ruleForm.points,
          description: ruleForm.description.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Scoring rule added successfully');
        setShowAddModal(false);
        setRuleForm({ gameType: 'commander', name: '', points: 0, description: '' });
        fetchRules();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add rule');
      }
    } catch (error) {
      toast.error('Failed to add scoring rule');
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<ScoringRule>) => {
    try {
      const response = await fetch('/api/admin/scoring-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, ...updates }),
      });

      if (response.ok) {
        toast.success('Rule updated successfully');
        setEditingRule(null);
        fetchRules();
      } else {
        toast.error('Failed to update rule');
      }
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (
      !confirm('Are you sure you want to delete this scoring rule? This may affect existing games.')
    )
      return;

    try {
      const response = await fetch(`/api/admin/scoring-rules?id=${ruleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Rule deleted successfully');
        fetchRules();
      } else {
        toast.error('Failed to delete rule');
      }
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const gameTypeLabels = {
    commander: 'Commander',
    draft: 'Draft',
    standard: 'Standard',
  };

  const gameTypeColors = {
    commander: 'bg-purple-600',
    draft: 'bg-blue-600',
    standard: 'bg-green-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" className="text-amber-500" />
        <span className="ml-3 text-white">Loading scoring rules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Scoring Rules Management</h2>
          <p className="text-gray-400">
            Configure how points are awarded for different game types and achievements
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-amber-600 hover:bg-amber-700">
          <FaPlus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Game Type Selector */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex gap-2">
            {(['commander', 'draft', 'standard'] as const).map(type => (
              <Button
                key={type}
                variant={selectedGameType === type ? 'default' : 'outline'}
                onClick={() => setSelectedGameType(type)}
                className={
                  selectedGameType === type ? 'bg-amber-600' : 'border-amber-400 text-amber-400'
                }
              >
                {gameTypeLabels[type]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <FaTrophy className="w-5 h-5 text-amber-500" />
              {gameTypeLabels[selectedGameType]} Rules ({filteredRules.length})
            </CardTitle>
            <Button variant="outline" onClick={fetchRules} className="border-slate-600">
              <FaRefresh className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRules.length === 0 ? (
            <div className="text-center py-8">
              <FaCalculator className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
                No scoring rules configured for {gameTypeLabels[selectedGameType]}
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add First Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRules.map(rule => (
                <div
                  key={rule.id}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium">{rule.name}</h3>
                        <Badge className={`${gameTypeColors[selectedGameType]} text-white`}>
                          {rule.points} pts
                        </Badge>
                        {rule.active ? (
                          <Badge className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge className="bg-red-600">Inactive</Badge>
                        )}
                      </div>
                      {rule.description && (
                        <p className="text-gray-400 text-sm">{rule.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <FaEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Point Calculator */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FaCalculator className="w-5 h-5 text-green-500" />
            Point Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm mb-4">
            Test how points are calculated with current rules for {gameTypeLabels[selectedGameType]}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-amber-400 mb-2">1st</div>
              <p className="text-gray-300 text-sm">1st Place</p>
              <p className="text-white font-bold">Would earn points</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 mb-2">2nd</div>
              <p className="text-gray-300 text-sm">2nd Place</p>
              <p className="text-white font-bold">Would earn points</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-2">Gold</div>
              <p className="text-gray-300 text-sm">Gold Objective</p>
              <p className="text-white font-bold">+5 points each</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Rule Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Scoring Rule">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Game Type</label>
            <select
              value={ruleForm.gameType}
              onChange={e => setRuleForm({ ...ruleForm, gameType: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="commander">Commander</option>
              <option value="draft">Draft</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Rule Name</label>
            <Input
              value={ruleForm.name}
              onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
              placeholder="e.g., Gold Objective, Placement 1st"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Points</label>
            <Input
              type="number"
              value={ruleForm.points}
              onChange={e => setRuleForm({ ...ruleForm, points: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={ruleForm.description}
              onChange={e => setRuleForm({ ...ruleForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              rows={3}
              placeholder="Describe when this rule applies..."
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={addRule} className="bg-amber-600 hover:bg-amber-700">
              <FaSave className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Rule Modal */}
      {editingRule && (
        <Modal
          isOpen={!!editingRule}
          onClose={() => setEditingRule(null)}
          title="Edit Scoring Rule"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Rule Name</label>
              <Input
                value={editingRule.name}
                onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Points</label>
              <Input
                type="number"
                value={editingRule.points}
                onChange={e =>
                  setEditingRule({ ...editingRule, points: parseInt(e.target.value) || 0 })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={editingRule.description || ''}
                onChange={e => setEditingRule({ ...editingRule, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={editingRule.active}
                onChange={e => setEditingRule({ ...editingRule, active: e.target.checked })}
                className="w-4 h-4 text-amber-600 bg-slate-700 border-slate-600 rounded"
              />
              <label htmlFor="active" className="text-sm text-gray-300">
                Rule is active
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => updateRule(editingRule.id, editingRule)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <FaSave className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingRule(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
