'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { League, LeagueDeck } from '@/types/league';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
// CommanderDeckBuilder removed - using simple placeholder
import { Deck } from '@/types/mtg';
import { toast } from 'react-hot-toast';
import { DeckBuilder } from '@/components/deck/DeckBuilder';
import { useLeagueDecks } from '@/hooks/useLeagueDecks';
import { convertDeckToLeagueDeck, validateLeagueDeck, getDeckStats } from '@/lib/league-deck-utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DeckRegistryProps {
  league: League;
  onDeckSaved: () => void;
}

export default function DeckRegistry({ league, onDeckSaved }: DeckRegistryProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [membershipId, setMembershipId] = useState<string | null>(null);
  const { leagueDecks, userDecks, loading, registerDeck, refetch } = useLeagueDecks(league.id);

  // Get current user's membership
  React.useEffect(() => {
    const fetchMembership = async () => {
      try {
        const response = await fetch(`/api/leagues/${league.id}/memberships`);
        if (response.ok) {
          const data = await response.json();
          const membership = data.memberships?.[0];
          if (membership) {
            setMembershipId(membership.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch membership:', error);
      }
    };

    fetchMembership();
  }, [league.id]);

  // Filter Commander decks from user decks
  const commanderDecks = userDecks.filter(
    d => d.format === 'commander'
  );

  const handleRegisterExistingDeck = async (deck: Deck) => {
    // Validate deck
    const cardPool = league.allowedCardPools?.[0]?.parsedCardIds;
    const validation = validateLeagueDeck(deck, cardPool);

    if (!validation.valid) {
      toast.error(`Deck validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    // Get membership (simplified - should use actual session)
    const membershipResponse = await fetch(`/api/leagues/${league.id}/memberships`);
    let membership = null;
    if (membershipResponse.ok) {
      const memberships = await membershipResponse.json();
      membership = memberships.memberships?.[0];
    }

    const success = await registerDeck(deck, league.id, membership?.id);
    if (success) {
      onDeckSaved();
    }
  };

  const handleSaveNewDeck = async (deck: Deck) => {
    const cardPool = league.allowedCardPools?.[0]?.parsedCardIds;
    const validation = validateLeagueDeck(deck, cardPool);

    if (!validation.valid) {
      toast.error(`Deck validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    const success = await registerDeck(deck, league.id);
    if (success) {
      setShowBuilder(false);
      onDeckSaved();
    }
  };

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setShowBuilder(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Register League Deck</h2>
            <p className="text-gray-600 mt-1">
              Use an existing deck or build a new one for league play
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedDeck(null);
              setShowBuilder(true);
            }}
          >
            Create New Deck
          </Button>
        </div>
        {league.allowedCardPools && league.allowedCardPools.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Card Pool Restrictions:</strong>{' '}
              {league.allowedCardPools.map(p => p.name).join(', ')}
            </p>
          </div>
        )}
      </Card>

      {/* Existing League Decks */}
      {leagueDecks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Registered League Decks</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leagueDecks.map(leagueDeck => {
              const stats = JSON.parse(leagueDeck.colorIdentity || '[]');
              return (
                <motion.div
                  key={leagueDeck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{leagueDeck.name}</h4>
                      <Badge className="bg-green-100 text-green-800">Registered</Badge>
                    </div>
                    {leagueDeck.commander && (
                      <p className="text-sm text-gray-600 mb-2">
                        Commander: {leagueDeck.commander}
                      </p>
                    )}
                    {stats.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {stats.map((color: string) => (
                          <span
                            key={color}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              color === 'W'
                                ? 'bg-white text-black border border-gray-300'
                                : color === 'U'
                                  ? 'bg-blue-600 text-white'
                                  : color === 'B'
                                    ? 'bg-black text-white'
                                    : color === 'R'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-green-600 text-white'
                            }`}
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Registered {new Date(leagueDeck.createdAt).toLocaleDateString()}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* User's Existing Decks */}
      {commanderDecks.length > 0 && !showBuilder && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Commander Decks</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select a deck from your collection to register for this league
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commanderDecks.map(deck => {
              const stats = getDeckStats(deck);
              const isRegistered = leagueDecks.some(ld => ld.name === deck.name);
              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    className={`p-4 hover:shadow-lg transition-shadow ${isRegistered ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{deck.name}</h4>
                      {isRegistered && (
                        <Badge className="bg-green-100 text-green-800">Registered</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Commander: {stats.commander}</p>
                    <div className="flex gap-1 mb-3">
                      {stats.colorIdentity.map((color: string) => (
                        <span
                          key={color}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            color === 'W'
                              ? 'bg-white text-black border border-gray-300'
                              : color === 'U'
                                ? 'bg-blue-600 text-white'
                                : color === 'B'
                                  ? 'bg-black text-white'
                                  : color === 'R'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-green-600 text-white'
                          }`}
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 text-xs text-gray-500 mb-3">
                      <span>{stats.totalCards} cards</span>
                      <span>•</span>
                      <span>{stats.creatureCount} creatures</span>
                      <span>•</span>
                      <span>{stats.landCount} lands</span>
                    </div>
                    <div className="flex gap-2">
                      {!isRegistered && (
                        <Button
                          size="sm"
                          onClick={() => handleRegisterExistingDeck(deck)}
                          className="flex-1"
                        >
                          Register for League
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditDeck(deck)}
                        className="flex-1"
                      >
                        {isRegistered ? 'View' : 'Edit'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deck Builder */}
      {showBuilder && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedDeck ? `Edit: ${selectedDeck.name}` : 'Build New League Deck'}
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setShowBuilder(false);
                setSelectedDeck(null);
              }}
            >
              Cancel
            </Button>
          </div>
          <DeckBuilder
            leagueId={league.id}
            membershipId={membershipId || undefined}
            onSave={async deckData => {
              try {
                const response = await fetch('/api/leagues/decks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    leagueId: league.id,
                    membershipId: membershipId,
                    name: deckData.name,
                    commander: deckData.commander,
                    colorIdentity: JSON.stringify(deckData.colorIdentity),
                    cards: JSON.stringify(
                      deckData.cards.map(c => ({ cardId: c.id, name: c.name, quantity: 1 }))
                    ),
                  }),
                });

                if (response.ok) {
                  toast.success('Deck saved successfully!');
                  setShowBuilder(false);
                  refetch();
                } else {
                  const error = await response.json();
                  toast.error(error.error || 'Failed to save deck');
                }
              } catch (error) {
                console.error('Save deck error:', error);
                toast.error('Failed to save deck');
              }
            }}
            onCancel={() => setShowBuilder(false)}
          />
        </motion.div>
      )}

      {/* Empty State */}
      {!showBuilder && commanderDecks.length === 0 && leagueDecks.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">
            You don&apos;t have any Commander decks yet. Create one to get started!
          </p>
          <Button onClick={() => setShowBuilder(true)}>Create Your First Deck</Button>
        </Card>
      )}
    </div>
  );
}
