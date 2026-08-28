import { CommanderPoolBuilder } from '@/components/deck-builder/CommanderPoolBuilder';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deck Builder | MTG Maui',
  description:
    'Deck Builder Assistant — paste your collection, generate a Commander deck, and save decks locally. Same flow as the Lovable Chaos Commander deck tool.',
  alternates: { canonical: '/decks' },
};

export default function DecksPage() {
  return <CommanderPoolBuilder />;
}
