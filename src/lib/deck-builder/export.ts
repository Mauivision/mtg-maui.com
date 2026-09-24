import type { GeneratedDeck } from './types';

/** Moxfield bulk-edit style: commander first, then one card per line. */
export function exportDeckAsText(deck: GeneratedDeck): string {
  const lines: string[] = [`1 ${deck.commander}`];

  for (const card of deck.cards) {
    for (let i = 0; i < card.quantity; i++) {
      lines.push(`1 ${card.name}`);
    }
  }

  return lines.join('\n');
}

export async function copyDeckToClipboard(deck: GeneratedDeck): Promise<boolean> {
  const text = exportDeckAsText(deck);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadDeckAsText(deck: GeneratedDeck): void {
  const text = exportDeckAsText(deck);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${deck.commander.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-commander.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
