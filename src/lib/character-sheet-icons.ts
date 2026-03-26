const ASSET_BASE =
  'C:/Users/hawai/.cursor/projects/c-Users-hawai-cursor-Agency-agents-products-mtg-maui-com/assets';

const ICON_FILES = {
  arcanist: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w9-80ff277a-8208-4168-82e0-b87f79a4048d.png',
  witch: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w2-12cd7c93-b332-4daf-8615-6d3a3ebe9e82.png',
  darkKnight: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w4-dcbc1f94-5b4f-40b2-915a-a3fdee0fb332.png',
  shadowRogue: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w16-da1c8fd1-77ce-4a76-ba8e-6285f0b006ac.png',
  crimsonWarden: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w18-53ba4467-87d1-484d-9de2-62183852df8a.png',
  moonPriest: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w20-2f8726f1-20aa-442d-8fe7-e46332bfc2f0.png',
  templar: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w17-bec5bdff-72c1-4418-b983-f13ddf352387.png',
  duskCaptain: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w15-a9f37e33-df45-4a68-bd23-fac37221d5aa.png',
  rogueAssassin: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w6-d6e2be24-dfe0-4118-a19e-f7595eba4a39.png',
  battleMage: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w7-673f1a36-7786-4fce-8496-5aa54ca355cf.png',
  oathblade: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w3-c0255abc-10c3-4a8e-b04a-6fc06adafa3d.png',
  gothicKnight: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w1-14fd3d99-d510-4587-9d6f-139f9cdb8101.png',
  nightblade: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w5-824d6fdc-9581-4410-a28f-4a20004b3fac.png',
  runesage: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w23-f47280f8-9265-4dba-9d5e-2fc7a77fa337.png',
  silverWarrior: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w22-43aaa7fb-f7ab-43e8-82bb-89b6f0096d45.png',
  infernalMask: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w13-137d8184-6336-499c-8252-f37b1596b80f.png',
  arcaneMarshal: 'c__Users_hawai_AppData_Roaming_Cursor_User_workspaceStorage_4f08d7b842952eee43e267d3d1d3f089_images_w21-96c287f7-bdac-43de-9247-9ba718e8467c.png',
} as const;

export type CharacterIconId = keyof typeof ICON_FILES;

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
  if (!(iconId in ICON_FILES)) return null;
  return `${ASSET_BASE}/${ICON_FILES[iconId as CharacterIconId]}`;
}

export function resolveCharacterIconForPlayer(playerName: string): {
  iconId: CharacterIconId;
  url: string;
} {
  const key = normalizePlayerName(playerName);
  const iconId = PLAYER_ICON_BY_NAME[key] ?? DEFAULT_ICON;
  return { iconId, url: `/api/character-icons/${iconId}` };
}
