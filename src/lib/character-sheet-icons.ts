export const CHARACTER_ICON_IDS = [
  'arcanist',
  'witch',
  'darkKnight',
  'shadowRogue',
  'crimsonWarden',
  'moonPriest',
  'templar',
  'duskCaptain',
  'rogueAssassin',
  'battleMage',
  'oathblade',
  'gothicKnight',
  'nightblade',
  'runesage',
  'silverWarrior',
  'infernalMask',
  'arcaneMarshal',
] as const;

export type CharacterIconId = (typeof CHARACTER_ICON_IDS)[number];

const PLAYER_ICON_BY_NAME: Record<string, CharacterIconId> = {
  zach: 'arcanist',
  nate: 'witch',
  aarons: 'darkKnight',
  aaronv: 'shadowRogue',
  aaronh: 'crimsonWarden',
  james: 'moonPriest',
  tre: 'templar',
  tim: 'duskCaptain',
  kevin: 'rogueAssassin',
  travis: 'battleMage',
  scott: 'oathblade',
  kaipo: 'gothicKnight',
  april: 'nightblade',
  ronnie: 'runesage',
  kendra: 'silverWarrior',
  dustin: 'infernalMask',
  dan: 'arcaneMarshal',
};

const DEFAULT_ICON: CharacterIconId = 'arcanist';

function normalizePlayerName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getCharacterIconPath(iconId: string): string | null {
  if (!CHARACTER_ICON_IDS.includes(iconId as CharacterIconId)) return null;
  // Served from the deployed bundle under /public so it works on Vercel/Supabase.
  return `public/images/character-icons/${iconId}.png`;
}

export function resolveCharacterIconForPlayer(playerName: string): {
  iconId: CharacterIconId;
  url: string;
} {
  const key = normalizePlayerName(playerName);
  const iconId = PLAYER_ICON_BY_NAME[key] ?? DEFAULT_ICON;
  return { iconId, url: `/images/character-icons/${iconId}.png` };
}
