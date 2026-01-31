# MTG Maui League

**Magic: The Gathering tournament league — one clean long-scroll site + Wizards edit panel.**

- **Home** (`/`): Hero, **Leaderboard** (chart + table + player stats + Wave 1 pod results), Character Charts, News Feed.
- **Edit** (`/wizards`): Create leagues, manage players, games, events, news. Edits show on home.

---

## GitHub & Vercel

- **Single project:** One repo (this), one Vercel project. No separate or duplicate projects.
- **GitHub:** Default branch `main`. CI runs on push/PR to `main` (type-check, lint, build). Repo represents this build.
- **Vercel:** Connect this repo; push to `main` triggers deploy. Build: `npx prisma migrate deploy && npm run build`. Node 24. Requires `DATABASE_URL` (Postgres) and optional `SKIP_ADMIN_AUTH=true`.

---

## Quick start

**Option A — No database (static data):**

```bash
npm install
# Omit DATABASE_URL or set USE_STATIC_LEAGUE_DATA=true in .env
npm run dev
```

Uses `src/data/league-data.json` for players and scores. Edit that file to update data. See [docs/STATIC_LEAGUE_DATA.md](docs/STATIC_LEAGUE_DATA.md).

**Option B — With database:**

```bash
npm install
# Set DATABASE_URL in .env (Postgres)
npm run setup:maui    # Creates Maui Commander League, 16 players, 4 pods
npm run dev
```

Open **http://localhost:3003**. Leaderboard and character charts show the data. Use **Edit** in the header for Wizards.

<details>
<summary>Alternative: manual steps</summary>

```bash
npx prisma generate
npx prisma migrate dev
npm run prisma:seed:maui   # or npx prisma db seed for default seed
npm run dev
```
</details>

---

## Database

- **PostgreSQL** via `DATABASE_URL`. See [docs/VERCEL_POSTGRES_SETUP.md](docs/VERCEL_POSTGRES_SETUP.md).
- Local: Postgres in `.env`. Vercel: Vercel Postgres + `DATABASE_URL`.
- **Reset DB and install 16 players + leaderboard:** [docs/DATABASE_RESET_AND_POPULATE.md](docs/DATABASE_RESET_AND_POPULATE.md).
- **Simple leaderboard (16 players, scores, top down):** [docs/SIMPLE_LEADERBOARD.md](docs/SIMPLE_LEADERBOARD.md).

---

## Deploy (Vercel)

1. **Storage** → Create **Postgres** → link to project.
2. **Env:** `DATABASE_URL` (auto from Postgres), `SKIP_ADMIN_AUTH` = `true` (no-login mode).
3. Push to `main` → Vercel runs `vercel.json` build and deploys.

Full checklist: [docs/DEPLOY_VERCEL_CHECKLIST.md](docs/DEPLOY_VERCEL_CHECKLIST.md). One project only; push to `main` overrides production.

---

## Docs

**Start:** [docs/DIRECTION_AND_CONTROLS.md](docs/DIRECTION_AND_CONTROLS.md) — pages, controls, offline vs online.

| Doc | Purpose |
|-----|---------|
| [docs/DIRECTION_AND_CONTROLS.md](docs/DIRECTION_AND_CONTROLS.md) | **Pages, controls, offline vs online** |
| [docs/DEPLOY_VERCEL_CHECKLIST.md](docs/DEPLOY_VERCEL_CHECKLIST.md) | Vercel deploy + verify |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Project layout |
| [docs/DATABASE_AND_PRISMA.md](docs/DATABASE_AND_PRISMA.md) | DB, Prisma, migrations |
| [docs/EDITABLE_DATA_GUIDE.md](docs/EDITABLE_DATA_GUIDE.md) | What you can edit and how |
| [docs/SCORE_ENTRY_GUIDE.md](docs/SCORE_ENTRY_GUIDE.md) | Add game results via seed scripts (Cursor-friendly) |
| [docs/DATABASE_RESET_AND_POPULATE.md](docs/DATABASE_RESET_AND_POPULATE.md) | Reset DB, 16 players, leaderboard (top down) |
| [docs/FUTURE_FEATURES.md](docs/FUTURE_FEATURES.md) | Login, Join League (restore later) |

---

## Scripts

```bash
npm run dev          # Dev server (port 3003)
npm run dev:alt      # Dev on 3004 if 3003 in use
npm run db:reset     # Reset DB (migrate reset --force), then use /wizards → Create League Tournament Records
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint
npm run lint:fix     # Lint and auto-fix
npm run type-check   # TypeScript check
npm run verify       # Type-check + lint + build
npm run doctor       # Lint fix + verify (code check & fix)
npm run deploy       # npx vercel --prod
npm run setup:maui          # One-command: generate, migrate, seed Maui Commander (16 players, 4 pods)
npm run prisma:seed:maui    # Seed only (after migrate). See docs/SCORE_ENTRY_GUIDE.md.
```

---

## Tech

- **Next.js 15** · **React 18** · **Prisma** (PostgreSQL) · **Tailwind** · **Chart.js** (leaderboard chart)
- **Accessibility:** Skip links, focus styles, `aria-*` on loaders and regions, `prefers-reduced-motion` support.

---

**Other root `.md` files** (e.g. `COMPLETE_IMPROVEMENTS_SUMMARY`, `MTG_MAUI_LEAGUE_MASTER_DOCUMENTATION`) are legacy; see [docs/ARCHIVE.md](docs/ARCHIVE.md).

© MTG Maui League
