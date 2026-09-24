import type { PoolEntry } from './types';

const QUANTITY_PREFIX = /^(\d+)\s*[xX]?\s+(.+)$/;

/** Strip set codes / collector numbers often appended in deck lists. */
function cleanCardName(raw: string): string {
  let name = raw.trim();
  if (!name) return '';

  // Remove trailing (SET) 123 or [SET] patterns
  name = name.replace(/\s*[\[(][^\])]+[\])]\s*$/, '').trim();
  // Remove trailing *F* foil markers
  name = name.replace(/\s*\*[^*]*\*?\s*$/, '').trim();
  return name;
}

function parseLine(line: string): PoolEntry | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return null;

  // Moxfield / Archidekt lines first — names may contain commas
  const qtyMatch = trimmed.match(QUANTITY_PREFIX);
  if (qtyMatch) {
    const qty = parseInt(qtyMatch[1], 10);
    const name = cleanCardName(qtyMatch[2]);
    if (qty > 0 && name) return { quantity: qty, name };
  }

  // CSV: quantity,name or name,quantity (typical export uploads)
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
    if (parts.length >= 2) {
      const aNum = parseInt(parts[0], 10);
      const bNum = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(aNum) && aNum > 0 && Number.isNaN(bNum)) {
        return { quantity: aNum, name: cleanCardName(parts.slice(1).join(',')) };
      }
      if (!Number.isNaN(bNum) && bNum > 0) {
        return { quantity: bNum, name: cleanCardName(parts.slice(0, -1).join(',')) };
      }
    }
  }

  const name = cleanCardName(trimmed);
  return name ? { quantity: 1, name } : null;
}

export function parsePoolText(text: string): PoolEntry[] {
  const map = new Map<string, PoolEntry>();

  for (const line of text.split(/\r?\n/)) {
    const entry = parseLine(line);
    if (!entry?.name) continue;
    const key = entry.name.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.quantity += entry.quantity;
    } else {
      map.set(key, { name: entry.name, quantity: entry.quantity });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function totalPoolCount(entries: PoolEntry[]): number {
  return entries.reduce((sum, e) => sum + e.quantity, 0);
}

export function uniquePoolCount(entries: PoolEntry[]): number {
  return entries.length;
}
