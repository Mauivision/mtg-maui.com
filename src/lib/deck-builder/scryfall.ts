import type { PoolCard, PoolEntry } from './types';

interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  color_identity: string[];
  oracle_text?: string;
  mana_cost?: string;
  legalities?: { commander?: string };
  keywords?: string[];
}

interface CollectionResponse {
  data?: ScryfallCard[];
  not_found?: { name: string }[];
}

const BATCH_SIZE = 75;
const SCRYFALL_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'MTGMauiDeckBuilder/1.0 (https://mtg-maui.com/decks)',
};

async function fetchCollection(names: string[]): Promise<CollectionResponse> {
  const res = await fetch('https://api.scryfall.com/cards/collection', {
    method: 'POST',
    headers: SCRYFALL_HEADERS,
    body: JSON.stringify({
      identifiers: names.map((name) => ({ name })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Scryfall lookup failed (${res.status})`);
  }

  return res.json();
}

function toPoolCard(entry: PoolEntry, card?: ScryfallCard): PoolCard {
  if (!card) {
    return {
      name: entry.name,
      quantity: entry.quantity,
      typeLine: '',
      colorIdentity: [],
      oracleText: '',
      manaCost: '',
      legalities: {},
      keywords: [],
      unresolved: true,
    };
  }

  return {
    name: card.name,
    quantity: entry.quantity,
    scryfallId: card.id,
    typeLine: card.type_line || '',
    colorIdentity: card.color_identity || [],
    oracleText: card.oracle_text || '',
    manaCost: card.mana_cost || '',
    legalities: card.legalities || {},
    keywords: card.keywords || [],
  };
}

/** Look up pool entries on Scryfall (client-side, pool names only). */
export async function lookupPoolCards(entries: PoolEntry[]): Promise<PoolCard[]> {
  const results = new Map<string, ScryfallCard>();

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const response = await fetchCollection(batch.map((e) => e.name));
    for (const card of response.data ?? []) {
      results.set(card.name.toLowerCase(), card);
    }
    // Brief pause to respect Scryfall rate limits between batches
    if (i + BATCH_SIZE < entries.length) {
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  return entries.map((entry) => {
    const card = results.get(entry.name.toLowerCase());
    return toPoolCard(entry, card);
  });
}
