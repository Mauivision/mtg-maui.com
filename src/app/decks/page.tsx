import { CommanderPoolBuilder } from '@/components/deck-builder/CommanderPoolBuilder';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commander Deck Builder | MTG Maui League',
  description:
    'Build Commander decks from cards you already own. Paste your collection and generate a 100-card list for Moxfield — no account required.',
};

export default function DecksPage() {
  return <CommanderPoolBuilder />;
}
