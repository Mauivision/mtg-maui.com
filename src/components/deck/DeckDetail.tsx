'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Deck, MTGCard } from '@/types/mtg';

interface DeckDetailProps {
  deck?: Deck;
  cards?: MTGCard[];
  onEditDeck?: (deck: Deck) => void;
  onDeleteDeck?: (deckId: string) => void;
  onDelete?: (deckId: string) => void; // Alternative name used by DeckManager
  onExportDeck?: (deck: Deck) => void;
  // Optional callbacks used by parent components like DeckManager
  onUpdate?: () => void;
  onBack?: () => void;
  currentUserId?: string;
}

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFormatColor = (format: string) => {
  switch (format.toLowerCase()) {
    case 'standard':
      return 'bg-blue-100 text-blue-800';
    case 'modern':
      return 'bg-green-100 text-green-800';
    case 'commander':
      return 'bg-purple-100 text-purple-800';
    case 'legacy':
      return 'bg-orange-100 text-orange-800';
    case 'vintage':
      return 'bg-red-100 text-red-800';
    case 'pioneer':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const CardRow: React.FC<{ card: MTGCard; quantity: number; isCommander?: boolean }> = ({
  card,
  quantity,
  isCommander = false,
}) => {
  return (
    <div className="flex items-center justify-between p-2 border-b last:border-b-0">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium w-8">{quantity}x</span>
        <div>
          <div className="font-medium flex items-center gap-2">
            {card.name}
            {isCommander && (
              <Badge variant="outline" className="text-xs">
                Commander
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {card.type} • {card.setName} ({card.setCode.toUpperCase()})
          </div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {card.manaCost && <span className="mr-2">{card.manaCost}</span>}
        <span>{card.rarity}</span>
      </div>
    </div>
  );
};

export const DeckDetail: React.FC<DeckDetailProps> = ({
  deck,
  cards = [],
  onEditDeck,
  onDeleteDeck,
  onDelete,
  onExportDeck,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Early return if no deck provided (e.g. create-deck modal)
  if (!deck) {
    return <div className="p-6 text-center text-muted-foreground">No deck selected</div>;
  }

  const isOwner = deck.userId === currentUserId;

  // Group cards by type for better organization
  const deckCards = deck.cards || [];
  const mainCards = deckCards.filter(
    deckCard => !deckCard.card.type.toLowerCase().includes('basic land')
  );
  const basicLands = deckCards.filter(deckCard =>
    deckCard.card.type.toLowerCase().includes('basic land')
  );

  const totalCards = deckCards.reduce((sum, deckCard) => sum + deckCard.quantity, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{deck.name}</CardTitle>
              <CardDescription className="mt-2">
                Format: {deck.format} • {totalCards} cards
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getFormatColor(deck.format)}>{deck.format}</Badge>
              {isOwner && (
                <div className="flex space-x-1">
                  {onEditDeck && (
                    <Button variant="outline" size="sm" onClick={() => onEditDeck(deck)}>
                      Edit
                    </Button>
                  )}
                  {onExportDeck && (
                    <Button variant="outline" size="sm" onClick={() => onExportDeck(deck)}>
                      Export
                    </Button>
                  )}
                  {(onDeleteDeck || onDelete) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => (onDeleteDeck || onDelete)?.(deck?.id || '')}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
              <p className="text-lg">{formatDate(deck.createdAt)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
              <p className="text-lg">{formatDate(deck.updatedAt)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Owner</h4>
              <p className="text-lg">{deck.user?.name || 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mainboard">Mainboard ({mainCards.length})</TabsTrigger>
          <TabsTrigger value="lands">Lands ({basicLands.length})</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deck Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalCards}</div>
                  <div className="text-sm text-muted-foreground">Total Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mainCards.length}</div>
                  <div className="text-sm text-muted-foreground">Creatures & Spells</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{basicLands.length}</div>
                  <div className="text-sm text-muted-foreground">Basic Lands</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      deckCards.filter(
                        dc => dc.card.rarity === 'Rare' || dc.card.rarity === 'Mythic'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Rare/Mythic</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mainboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mainboard</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {mainCards.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {mainCards.map(deckCard => (
                    <CardRow
                      key={deckCard.card.id}
                      card={deckCard.card}
                      quantity={deckCard.quantity}
                      isCommander={false} // Commander logic can be added later
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">No cards in mainboard</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Lands</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {basicLands.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {basicLands.map(deckCard => (
                    <CardRow
                      key={deckCard.card.id}
                      card={deckCard.card}
                      quantity={deckCard.quantity}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">No basic lands in deck</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deck Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Card Types</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Creatures:</span>
                      <span>
                        {
                          deckCards.filter(dc => dc.card.type.toLowerCase().includes('creature'))
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Instants:</span>
                      <span>
                        {
                          deckCards.filter(dc => dc.card.type.toLowerCase().includes('instant'))
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sorceries:</span>
                      <span>
                        {
                          deckCards.filter(dc => dc.card.type.toLowerCase().includes('sorcery'))
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enchantments:</span>
                      <span>
                        {
                          deckCards.filter(dc => dc.card.type.toLowerCase().includes('enchantment'))
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Artifacts:</span>
                      <span>
                        {
                          deckCards.filter(dc => dc.card.type.toLowerCase().includes('artifact'))
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lands:</span>
                      <span>
                        {deckCards.filter(dc => dc.card.type.toLowerCase().includes('land')).length}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Rarity Distribution</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Common:</span>
                      <span>{deckCards.filter(dc => dc.card.rarity === 'Common').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uncommon:</span>
                      <span>{deckCards.filter(dc => dc.card.rarity === 'Uncommon').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rare:</span>
                      <span>{deckCards.filter(dc => dc.card.rarity === 'Rare').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mythic:</span>
                      <span>{deckCards.filter(dc => dc.card.rarity === 'Mythic').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
