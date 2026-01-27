'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MTGCard } from '@/types/mtg';
import { logger } from '@/lib/logger';
import {
  FaSearch,
  FaPlus,
  FaMinus,
  FaTrash,
  FaCheck,
  FaTimes,
  FaDownload,
  FaUpload,
} from 'react-icons/fa';
import { DeckImportExport } from './DeckImportExport';
import toast from 'react-hot-toast';

interface DeckBuilderProps {
  leagueId: string;
  membershipId?: string;
  onSave?: (deck: {
    name: string;
    commander: string;
    colorIdentity: string[];
    cards: MTGCard[];
  }) => void;
  onCancel?: () => void;
  initialDeck?: {
    name?: string;
    commander?: string;
    cards?: MTGCard[];
  };
}

interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  image_uris?: {
    normal?: string;
    small?: string;
  };
  set: string;
  set_name: string;
  collector_number: string;
  rarity: string;
  colors?: string[];
  color_identity?: string[];
}

const COLOR_MAP: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

export const DeckBuilder: React.FC<DeckBuilderProps> = ({
  leagueId,
  membershipId,
  onSave,
  onCancel,
  initialDeck,
}) => {
  const [deckName, setDeckName] = useState(initialDeck?.name || '');
  const [commander, setCommander] = useState<MTGCard | null>(
    initialDeck?.commander
      ? ({ ...initialDeck.cards?.find(c => c.name === initialDeck.commander) } as MTGCard)
      : null
  );
  const [commanderSearch, setCommanderSearch] = useState('');
  const [commanderResults, setCommanderResults] = useState<ScryfallCard[]>([]);
  const [searchingCommander, setSearchingCommander] = useState(false);

  const [cardSearch, setCardSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
  const [searching, setSearching] = useState(false);

  const [deckCards, setDeckCards] = useState<MTGCard[]>(initialDeck?.cards || []);
  const [showImport, setShowImport] = useState(false);

  // Debounced card search
  useEffect(() => {
    if (cardSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchCards(cardSearch);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cardSearch]);

  // Debounced commander search
  useEffect(() => {
    if (commanderSearch.length < 2) {
      setCommanderResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchCommander(commanderSearch);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [commanderSearch]);

  const searchCards = async (query: string) => {
    if (!query || query.length < 2) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=cards&order=name`
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data?.slice(0, 10) || []);
      } else if (response.status === 404) {
        setSearchResults([]);
      } else {
        toast.error('Failed to search cards');
      }
    } catch (error) {
      logger.error('Card search error', error);
      toast.error('Failed to search cards');
    } finally {
      setSearching(false);
    }
  };

  const searchCommander = async (query: string) => {
    if (!query || query.length < 2) return;

    setSearchingCommander(true);
    try {
      // Search for legendary creatures
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}+is:commander&unique=cards&order=name`
      );

      if (response.ok) {
        const data = await response.json();
        setCommanderResults(data.data?.slice(0, 10) || []);
      } else if (response.status === 404) {
        setCommanderResults([]);
      } else {
        toast.error('Failed to search commanders');
      }
    } catch (error) {
      logger.error('Commander search error', error);
      toast.error('Failed to search commanders');
    } finally {
      setSearchingCommander(false);
    }
  };

  const scryfallToMTGCard = (scryfall: ScryfallCard): MTGCard => ({
    id: scryfall.id,
    name: scryfall.name,
    manaCost: scryfall.mana_cost || '',
    cmc: scryfall.cmc,
    type: scryfall.type_line,
    text: scryfall.oracle_text || '',
    power: scryfall.power,
    toughness: scryfall.toughness,
    loyalty: scryfall.loyalty ? parseInt(scryfall.loyalty) : null,
    imageUrl: scryfall.image_uris?.normal || scryfall.image_uris?.small || '',
    setCode: scryfall.set.toUpperCase(),
    rarity: scryfall.rarity,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const addCard = (card: ScryfallCard) => {
    const mtgCard = scryfallToMTGCard(card);
    setDeckCards([...deckCards, mtgCard]);
    setCardSearch('');
    setSearchResults([]);
  };

  const removeCard = (index: number) => {
    setDeckCards(deckCards.filter((_, i) => i !== index));
  };

  const setCommanderCard = (card: ScryfallCard) => {
    const mtgCard = scryfallToMTGCard(card);
    setCommander(mtgCard);
    setCommanderSearch('');
    setCommanderResults([]);
  };

  const getCardCount = () => deckCards.length;
  const getUniqueCards = () => new Set(deckCards.map(c => c.name)).size;
  const getCardCounts = () => {
    const counts: Record<string, number> = {};
    deckCards.forEach(card => {
      counts[card.name] = (counts[card.name] || 0) + 1;
    });
    return counts;
  };

  const getCommanderColors = (): string[] => {
    if (!commander) return [];
    // Extract colors from mana cost or use color identity
    const colors: string[] = [];
    const manaCost = commander.manaCost || '';
    if (manaCost.includes('W')) colors.push('W');
    if (manaCost.includes('U')) colors.push('U');
    if (manaCost.includes('B')) colors.push('B');
    if (manaCost.includes('R')) colors.push('R');
    if (manaCost.includes('G')) colors.push('G');
    return colors;
  };

  const validateDeck = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!deckName.trim()) {
      errors.push('Deck name is required');
    }

    if (!commander) {
      errors.push('Commander is required');
    }

    if (getCardCount() !== 100) {
      errors.push(`Deck must contain exactly 100 cards (currently ${getCardCount()})`);
    }

    // Check for basic lands (they don't count toward the 100)
    const nonLandCards = deckCards.filter(c => !c.type?.toLowerCase().includes('basic land'));
    if (nonLandCards.length > 100) {
      errors.push(`Deck has too many non-land cards (${nonLandCards.length})`);
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSave = async () => {
    const validation = validateDeck();
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    if (onSave) {
      onSave({
        name: deckName,
        commander: commander!.name,
        colorIdentity: getCommanderColors(),
        cards: deckCards,
      });
    } else {
      // Save to API
      try {
        const response = await fetch('/api/leagues/decks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leagueId,
            membershipId,
            name: deckName,
            commander: commander!.name,
            colorIdentity: getCommanderColors(),
            cards: deckCards.map(c => ({ cardId: c.id, quantity: 1 })),
          }),
        });

        if (response.ok) {
          toast.success('Deck saved successfully!');
          if (onCancel) onCancel();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to save deck');
        }
      } catch (error) {
        logger.error('Save deck error', error);
        toast.error('Failed to save deck');
      }
    }
  };

  const handleImport = (cards: MTGCard[]) => {
    setDeckCards(cards);
    setShowImport(false);
    toast.success(`Imported ${cards.length} cards`);
  };

  return (
    <div className="space-y-6">
      {/* Deck Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Deck Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deck Name</label>
            <Input
              value={deckName}
              onChange={e => setDeckName(e.target.value)}
              placeholder="My Awesome Deck"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Commander Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Commander</label>
            <div className="relative">
              <Input
                value={commanderSearch}
                onChange={e => setCommanderSearch(e.target.value)}
                placeholder="Search for a commander..."
                className="bg-slate-700 border-slate-600 text-white pr-10"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>

            {commander && (
              <div className="mt-2 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {commander.imageUrl && (
                    <Image
                      src={commander.imageUrl}
                      alt={commander.name}
                      width={48}
                      height={64}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-white">{commander.name}</div>
                    <div className="text-sm text-gray-400">
                      {commander.manaCost} • {commander.type}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommander(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FaTimes />
                </Button>
              </div>
            )}

            {commanderSearch && commanderResults.length > 0 && (
              <div className="mt-2 border border-slate-600 rounded-lg bg-slate-900 max-h-60 overflow-y-auto">
                {commanderResults.map(card => (
                  <div
                    key={card.id}
                    onClick={() => setCommanderCard(card)}
                    className="p-3 hover:bg-slate-800 cursor-pointer flex items-center gap-3 border-b border-slate-700 last:border-b-0"
                  >
                    {card.image_uris?.small && (
                      <Image
                        src={card.image_uris.small}
                        alt={card.name}
                        width={40}
                        height={56}
                        className="w-10 h-14 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-white">{card.name}</div>
                      <div className="text-sm text-gray-400">
                        {card.mana_cost} • {card.type_line}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchingCommander && (
              <div className="mt-2 flex justify-center py-4">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card Search */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Add Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              value={cardSearch}
              onChange={e => setCardSearch(e.target.value)}
              placeholder="Search for cards..."
              className="bg-slate-700 border-slate-600 text-white pr-10"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>

          {searchResults.length > 0 && (
            <div className="border border-slate-600 rounded-lg bg-slate-900 max-h-60 overflow-y-auto">
              {searchResults.map(card => (
                <div
                  key={card.id}
                  onClick={() => addCard(card)}
                  className="p-3 hover:bg-slate-800 cursor-pointer flex items-center gap-3 border-b border-slate-700 last:border-b-0"
                >
                  {card.image_uris?.small && (
                    <Image
                      src={card.image_uris.small}
                      alt={card.name}
                      width={40}
                      height={56}
                      className="w-10 h-14 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-white">{card.name}</div>
                    <div className="text-sm text-gray-400">
                      {card.mana_cost} • {card.type_line}
                    </div>
                  </div>
                  <FaPlus className="text-amber-400" />
                </div>
              ))}
            </div>
          )}

          {searching && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImport(!showImport)}
              className="border-amber-600 text-amber-400"
            >
              <FaUpload className="mr-2" />
              Import Decklist
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      {showImport && <DeckImportExport deck={deckCards} onImport={handleImport} />}

      {/* Deck List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Deck ({getCardCount()}/100)</CardTitle>
            <div className="flex gap-2">
              <Badge className={getCardCount() === 100 ? 'bg-green-600' : 'bg-amber-600'}>
                {getCardCount()}/100
              </Badge>
              <Badge variant="outline">{getUniqueCards()} unique</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {deckCards.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No cards in deck. Search and add cards to build your deck.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(getCardCounts()).map(([name, count]) => {
                const card = deckCards.find(c => c.name === name);
                const indices = deckCards
                  .map((c, i) => (c.name === name ? i : -1))
                  .filter(i => i !== -1);
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {card?.imageUrl && (
                        <Image
                          src={card.imageUrl}
                          alt={name}
                          width={40}
                          height={56}
                          className="w-10 h-14 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-white">{name}</div>
                        <div className="text-sm text-gray-400">
                          {card?.manaCost} • {card?.type}
                        </div>
                      </div>
                      <Badge className="bg-amber-600">{count}x</Badge>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (getCardCount() < 100) {
                            const newCards = [...deckCards];
                            newCards.push(card!);
                            setDeckCards(newCards);
                          } else {
                            toast.error('Deck is full (100 cards maximum)');
                          }
                        }}
                        disabled={getCardCount() >= 100}
                        title="Add one more"
                      >
                        <FaPlus />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (count > 1) {
                            const newCards = [...deckCards];
                            const firstIndex = deckCards.findIndex(c => c.name === name);
                            if (firstIndex !== -1) {
                              newCards.splice(firstIndex, 1);
                              setDeckCards(newCards);
                            }
                          }
                        }}
                        title="Remove one"
                      >
                        <FaMinus />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeckCards(deckCards.filter(c => c.name !== name));
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Remove all"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
          <FaCheck className="mr-2" />
          Save Deck
        </Button>
      </div>
    </div>
  );
};
