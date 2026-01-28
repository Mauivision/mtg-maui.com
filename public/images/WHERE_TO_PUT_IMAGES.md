# Where to Put Images

**All editable/placeable images go under `public/images/`.**

Next.js serves `public/` at the root, so use paths like `/images/events/my-photo.jpg` in code or in Admin (e.g. Page Content config, event `imageUrl`).

## Folders

| Folder | Use for |
|--------|--------|
| **`public/images/`** | General site images (backgrounds, banners). e.g. `medieval-background.jpg`, `mtg-background.jpg` |
| **`public/images/events/`** | Event/tournament photos. Reference in event `imageUrl` or bulletin |
| **`public/images/icons/`** | Logos, favicons, small graphics |
| **`public/images/heroes/`** | Hero section backgrounds and banners |
| **`public/images/players/`** | Player avatars / profile photos |
| **`public/images/cards/`** | Magic card artwork, illustrations |
| **`public/images/backgrounds/`** | Page backgrounds and textures |
| **`public/images/gallery/`** | Community photos, news thumbnails |
| **`public/images/thumbnails/`** | Small preview images |

## Usage

- **Central config:** Edit `src/lib/site-images.ts` to map hero, backgrounds (per page), event placeholders, gallery, and OG image. The app uses these paths everywhere.
- **In components:** `src="/images/events/chaos-draft.jpg"` or `style={{ backgroundImage: 'url(/images/medieval-background.jpg)' }}`. Prefer `siteImages` from `@/lib/site-images` when relevant.
- **In config (Admin → Page Content):** store paths in JSON config, e.g. `"heroImage": "/images/heroes/arena.jpg"`
- **Event images:** Prisma `Event.imageUrl` can point to `/images/events/...`

## Current organized assets

- **Root:** `medieval-background.jpg`, `mtg-background.jpg` (hero, auth, etc.)
- **`backgrounds/`:** `commander-bg.jpg`, `analytics-bg.jpg`, `leaderboard-bg.jpg`, `coming-soon-bg.jpg`, `bracket-bg.jpg`
- **`events/`:** `event-placeholder-1.jpg` … `event-placeholder-3.jpg` (fallbacks when event has no `imageUrl`)
- **`gallery/`:** `gallery-1.jpg` … `gallery-5.jpg` (homepage “League Moments” strip)

All paths are wired in `src/lib/site-images.ts`.

## Tips

- Use lowercase, hyphens: `chaos-draft-2024.jpg`
- Prefer JPG for photos, PNG for logos/transparency
- See `README.md` and `MEDIEVAL_IMAGES_README.md` in this folder for sizes and guidelines.
