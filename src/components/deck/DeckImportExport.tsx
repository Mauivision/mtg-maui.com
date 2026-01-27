'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { MTGCard } from '@/types/mtg';
import toast from 'react-hot-toast';

interface DeckImportExportProps {
  deck?: MTGCard[];
  onDeckImport?: (cards: MTGCard[]) => void;
  // alias so callers can use a shorter name
  onImport?: (cards: MTGCard[]) => void;
  onExportDeck?: () => void;
}

export const DeckImportExport: React.FC<DeckImportExportProps> = ({
  deck = [],
  onDeckImport,
  onImport,
  onExportDeck,
}) => {
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'decklist' | 'mtga' | 'mtgo'>('decklist');
  const [error, setError] = useState<string | null>(null);

  const exportToDecklist = () => {
    const mainboard = deck.filter(card => !card.type?.toLowerCase().includes('basic land'));
    const lands = deck.filter(card => card.type?.toLowerCase().includes('basic land'));

    let decklist = '';

    // Mainboard
    if (mainboard.length > 0) {
      decklist += 'Main Deck\n';
      const groupedCards = mainboard.reduce(
        (acc, card) => {
          const key = `${card.name} (${card.setCode.toUpperCase()}) ${card.number || ''}`;
          if (!acc[key]) {
            acc[key] = { card, quantity: 0 };
          }
          acc[key].quantity += 1;
          return acc;
        },
        {} as Record<string, { card: MTGCard; quantity: number }>
      );

      Object.values(groupedCards).forEach(({ card, quantity }) => {
        decklist += `${quantity} ${card.name}\n`;
      });
    }

    // Sideboard (if any)
    // Add sideboard logic here if needed

    // Lands
    if (lands.length > 0) {
      if (mainboard.length > 0) decklist += '\n';
      decklist += 'Basic Lands\n';
      const groupedLands = lands.reduce(
        (acc, card) => {
          const key = `${card.name} (${card.setCode.toUpperCase()}) ${card.number || ''}`;
          if (!acc[key]) {
            acc[key] = { card, quantity: 0 };
          }
          acc[key].quantity += 1;
          return acc;
        },
        {} as Record<string, { card: MTGCard; quantity: number }>
      );

      Object.values(groupedLands).forEach(({ card, quantity }) => {
        decklist += `${quantity} ${card.name}\n`;
      });
    }

    navigator.clipboard.writeText(decklist);
    alert('Decklist copied to clipboard!');
  };

  const parseDecklist = async (text: string): Promise<MTGCard[]> => {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'));
    const cards: MTGCard[] = [];

    for (const line of lines) {
      // Parse "4 Lightning Bolt" format
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const quantity = parseInt(match[1]);
        const cardName = match[2].trim();

        try {
          // Search Scryfall API for the card
          const response = await fetch(
            `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`
          );

          if (response.ok) {
            const scryfallCard = await response.json();
            const mtgCard: MTGCard = {
              id: scryfallCard.id,
              name: scryfallCard.name,
              manaCost: scryfallCard.mana_cost || '',
              cmc: scryfallCard.cmc,
              type: scryfallCard.type_line,
              text: scryfallCard.oracle_text || '',
              power: scryfallCard.power,
              toughness: scryfallCard.toughness,
              loyalty: scryfallCard.loyalty,
              imageUrl: scryfallCard.image_uris?.normal || scryfallCard.image_uris?.small || '',
              setCode: scryfallCard.set.toUpperCase(),
              rarity: scryfallCard.rarity,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            for (let i = 0; i < quantity; i++) {
              cards.push(mtgCard);
            }
          } else {
            // Fallback to mock card if not found
            const mockCard: MTGCard = {
              id: `mock-${cardName.toLowerCase().replace(/\s+/g, '-')}`,
              name: cardName,
              manaCost: '',
              cmc: 0,
              type: 'Unknown',
              text: '',
              power: undefined,
              toughness: undefined,
              loyalty: undefined,
              imageUrl: `https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}&unique=cards&order=name`,
              setCode: 'UNK',
              rarity: 'common',
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            for (let i = 0; i < quantity; i++) {
              cards.push(mockCard);
            }
          }
        } catch (error) {
          console.error(`Error fetching card ${cardName}:`, error);
          // Fallback mock card
          const mockCard: MTGCard = {
            id: `mock-${cardName.toLowerCase().replace(/\s+/g, '-')}`,
            name: cardName,
            manaCost: '',
            cmc: 0,
            type: 'Unknown',
            text: '',
            power: undefined,
            toughness: undefined,
            loyalty: undefined,
            imageUrl: '',
            setCode: 'UNK',
            rarity: 'common',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          for (let i = 0; i < quantity; i++) {
            cards.push(mockCard);
          }
        }
      }
    }

    return cards;
  };

  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    try {
      setError(null);
      setImporting(true);
      const importedCards = await parseDecklist(importText);

      if (importedCards.length === 0) {
        setError('No valid cards found in the decklist');
        return;
      }

      (onDeckImport ?? onImport)?.(importedCards);
      setImportText('');
      toast.success(`Successfully imported ${importedCards.length} cards!`);
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to parse decklist');
      toast.error('Failed to import decklist');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📋 Deck Import/Export</CardTitle>
          <CardDescription>
            Import decks from text format or export your current deck
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Import Format</label>
              <div className="flex gap-2">
                {(['decklist', 'mtga', 'mtgo'] as const).map(format => (
                  <Button
                    key={format}
                    variant={importFormat === format ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setImportFormat(format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deck Stats</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="font-medium">Cards</div>
                  <div className="text-lg">{deck.length}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="font-medium">Unique</div>
                  <div className="text-lg">{new Set(deck.map(c => c.name)).size}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Import Decklist</label>
            <Textarea
              placeholder="Paste your decklist here...

Example:
4 Lightning Bolt
4 Opt
24 Island

Or use MTGA/MTGO format..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={!importText.trim() || importing}>
              {importing ? 'Importing...' : 'Import Deck'}
            </Button>
            <Button variant="outline" onClick={exportToDecklist}>
              Export to Clipboard
            </Button>
            <Button variant="outline" onClick={onExportDeck}>
              Export as File
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🎴 Supported Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="outline">Decklist Format</Badge>
              <div className="text-sm text-muted-foreground">
                <div>4 Lightning Bolt</div>
                <div>4 Opt</div>
                <div>24 Island</div>
              </div>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">MTGA Format</Badge>
              <div className="text-sm text-muted-foreground">
                <div>4 Lightning Bolt (M19)</div>
                <div>4 Opt (XLN)</div>
                <div>24 Island (M19)</div>
              </div>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">MTGO Format</Badge>
              <div className="text-sm text-muted-foreground">
                <div>4 [M19:152] Lightning Bolt</div>
                <div>4 [XLN:65] Opt</div>
                <div>24 [M19:265] Island</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
