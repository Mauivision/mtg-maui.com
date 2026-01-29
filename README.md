# MTG Maui League

**Magic: The Gathering tournament league — one long-scroll site + Wizards edit panel.**

- **Home** (`/`): Hero, Leaderboard, Character Charts, News Feed.
- **Edit** (`/wizards`): Create leagues, manage players, games, events, news. Edits show on home.

---

## Quick start

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed    # optional
npm run dev
```

Open **http://localhost:3003**. Use **Edit** in the header to open Wizards.

---

## Database

- **PostgreSQL** via `DATABASE_URL`. See [docs/VERCEL_POSTGRES_SETUP.md](docs/VERCEL_POSTGRES_SETUP.md).
- Local: Postgres in `.env`. Vercel: Vercel Postgres + `DATABASE_URL`.

---

## Deploy (Vercel)

1. **Storage** → Create **Postgres** → link to project.
2. **Env:** `DATABASE_URL` (auto), `SKIP_ADMIN_AUTH` = `true` (no-login mode).
3. Push to `main` → Vercel builds and deploys.

Full checklist: [docs/DEPLOY_VERCEL_CHECKLIST.md](docs/DEPLOY_VERCEL_CHECKLIST.md).

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
| [docs/FUTURE_FEATURES.md](docs/FUTURE_FEATURES.md) | Login, Join League (restore later) |

---

## Scripts

```bash
npm run dev          # Dev server (port 3003)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint
npm run verify       # Type-check + lint + build
npm run deploy       # npx vercel --prod
```

---

## Tech

- **Next.js 15** · **React 18** · **Prisma** (PostgreSQL) · **Tailwind**

---

**Other root `.md` files** (e.g. `COMPLETE_IMPROVEMENTS_SUMMARY`, `MTG_MAUI_LEAGUE_MASTER_DOCUMENTATION`) are legacy; see [docs/ARCHIVE.md](docs/ARCHIVE.md).

© MTG Maui League
