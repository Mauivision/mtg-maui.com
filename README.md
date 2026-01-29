# MTG Maui League

**Magic: The Gathering tournament league — one clean long-scroll site + Wizards edit panel.**

- **Home** (`/`): Hero, **Leaderboard** (points bar chart + compact rankings table), Character Charts, News Feed.
- **Edit** (`/wizards`): Create leagues, manage players, games, events, news. Edits show on home.

---

## GitHub & Vercel

- **GitHub:** Default branch `main`. CI runs on push/PR to `main` (type-check, lint, build). Repo represents this build.
- **Vercel:** Connect this repo; push to `main` triggers deploy. Build: `npx prisma migrate deploy && npm run build`. Node 18. Requires `DATABASE_URL` (Postgres) and optional `SKIP_ADMIN_AUTH=true`.

---

## Quick start

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed    # optional
npm run dev
```

Open **http://localhost:3004**. Use **Edit** in the header to open Wizards.

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
| [docs/DATABASE_RESET_AND_POPULATE.md](docs/DATABASE_RESET_AND_POPULATE.md) | Reset DB, 16 players, leaderboard (top down) |
| [docs/FUTURE_FEATURES.md](docs/FUTURE_FEATURES.md) | Login, Join League (restore later) |

---

## Scripts

```bash
npm run dev          # Dev server (port 3004)
npm run dev:alt      # Dev on 3003 if 3004 in use
npm run db:reset     # Reset DB (migrate reset --force), then use /wizards → Create League Tournament Records
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint
npm run verify       # Type-check + lint + build
npm run deploy       # npx vercel --prod
```

---

## Tech

- **Next.js 15** · **React 18** · **Prisma** (PostgreSQL) · **Tailwind** · **Chart.js** (leaderboard chart)

---

**Other root `.md` files** (e.g. `COMPLETE_IMPROVEMENTS_SUMMARY`, `MTG_MAUI_LEAGUE_MASTER_DOCUMENTATION`) are legacy; see [docs/ARCHIVE.md](docs/ARCHIVE.md).

© MTG Maui League
