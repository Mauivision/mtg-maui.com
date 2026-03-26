# 📁 MTG Maui League - Project Structure

**Direction & controls:** See [DIRECTION_AND_CONTROLS.md](DIRECTION_AND_CONTROLS.md) for pages, offline vs online, and what you can edit.

## 🎯 **Layout**

- **Single home** (`/`): long-scroll with Hero, Leaderboard (`RealtimeLeaderboard` table + Commander bar chart + Draft bar chart + `LeagueStatus`), Character Charts, News Feed. Editorial blurbs in `src/lib/home-page.ts`.
- **Wizards** (`/wizards`): edit panel. Old routes redirect (e.g. `/leaderboard` → `/#leaderboard`, `/admin` → `/wizards`).

---

## Directory structure

```
mtg-maui-league/
├── src/app/           # Next.js App Router (pages + src/app/api/*)
├── src/components/    # React UI (ui/, admin/, leaderboard/, …)
├── src/lib/           # prisma, auth, API helpers, logger, site-images
├── src/contexts/ src/hooks/ src/types/ src/styles/
├── prisma/            # schema, migrations, seed*.ts
├── public/            # static assets; images/README.md for asset layout
├── docs/              # guides (index: docs/README.md)
├── scripts/           # DB check, CSV export, one-off maintenance
├── mcp-image-generator/  # optional local tool (excluded from app tsconfig)
├── .github/workflows/ # CI
├── package.json vercel.json next.config.* tailwind.config.* tsconfig.json
└── README.md AGENTS.md
```

**Deploy:** Vercel from GitHub; see [DEPLOY_VERCEL_CHECKLIST.md](DEPLOY_VERCEL_CHECKLIST.md). **Optional:** `public/leaderboard-standalone.html` for static hosting without Node.

---

## Conventions & key modules

### **`src/lib`**
- **`prisma`** – Shared Prisma client (use `prisma` from `@/lib/prisma`, not `new PrismaClient()`).
- **`api-error`** – `handleApiError(error)`, `ApiError`, `apiSuccess()`. Use in API routes for consistent error responses.
- **`logger`** – `logger.info()`, `logger.warn()`, `logger.error()`, `logger.performance()`. Use instead of `console.*` in API routes (100% migrated).
- **`api-middleware`** – `withLogging()`, `measureTime()`. Optional wrappers for request/response logging.
- **`auth-helpers`** – `requireAdmin()`, session helpers for API routes.
- **`static-league-data`** – When `USE_STATIC_LEAGUE_DATA=true` or no DB URL: reads `src/data/league-data.json` for leaderboard, character sheets, waves.
- **`leaderboard-db-aggregate`** – Postgres leaderboard totals (Commander + Draft); same VP rules as static JSON path.
- **`chartjs-bar-register`** – One-time Chart.js registration for bar charts (`SimpleLeaderboardChart`, `DraftPointsChart`).

### **`src/types`**
- **`leaderboard`** – `TraditionalLeaderboardEntry`, `ScoringRules`, `PlayerGameHistory`, `RealtimeLeaderboardEntry`, etc.
- **`league`** – League, membership, and related types.

### **Leaderboard**
- **Home** (`/`): **Leaderboard** section uses `RealtimeLeaderboard`, `SimpleLeaderboardChart` (`metric="commander"`), `DraftPointsChart`, and `LeagueStatus`. **Character Charts** use `/api/leagues/[id]/character-sheets`. **News Feed** uses `/api/news` and `/api/events`.
- **APIs:** `GET /api/leaderboard/realtime`, `GET /api/leagues/[leagueId]/leaderboard`, `GET /api/leagues/status`, `GET /api/leagues/[leagueId]/character-sheets`, `GET /api/news`, `GET /api/events`.
- **Populate:** `POST /api/admin/populate` (from Wizards) – seeds league, 16 players, sample games.

### **Admin dashboard**
- **`GET /api/admin/dashboard`** – Stats (users, games, leagues, events, db size, uptime). Db size: N/A for Postgres; was SQLite file size when using `dev.db`.
- **`GET /api/admin/dashboard/activity`** – Recent users, games, leagues, events. Uses `logger` for errors.

### **Page content & layout** (see [DIRECTION_AND_CONTROLS](DIRECTION_AND_CONTROLS.md))
- **`PageContent`** (Prisma) – Per-path editable content: `path`, `title`, `description`, `config` (JSON). Seeded for `/`, `/leaderboard`, `/bulletin`, `/rules`, etc.
- **`GET /api/pages`** – Public API: returns all page content for the frontend. **`GET/PUT /api/admin/pages`** – Admin CRUD for page content.
- **`PageContentContext`** – Fetches `/api/pages`, exposes `getPage(path)`, `getConfig(path)`, `refresh()`. Used by layout (header/footer), home, leaderboard, bulletin.
- **Layout:** `Providers` → `LeagueProvider` → `PageContentProvider` → `children`. **Header** nav labels and **footer** blurb/quick links come from page config (`navLabel`, `footerBlurb`).
- **Wizards Control (Chaos League Tracker) → Page Content tab** – List pages, edit `title`, `description`, and `config` (JSON). `/admin` redirects to `/wizards`. Config can include `navLabel`, `heroSubtitle`, `heroHeadline`, `heroTagline`, `footerBlurb`, `exploreTitle`, `exploreSubtitle`, `features` (home), etc. Saving updates DB and calls `refresh()` so the app reflects changes immediately.
- **Pages using page content:** Home (hero, features, explore), Leaderboard (title, description), Bulletin (title, description), Header (nav labels), Footer (blurb, quick-link labels).

### **Editable data**
- **Where:** **Wizards** (`/wizards`). Home shows Leaderboard, Character Charts, News Feed from the same data.
- **What:** Leagues, players, games, events, news, drafts, scoring rules, page content. See **[EDITABLE_DATA_GUIDE.md](EDITABLE_DATA_GUIDE.md)**.

### **Components**
- **`LeagueStatus`** – `/api/leagues/status`; used in home Leaderboard section.
- **`RealtimeLeaderboard`** – `/api/leaderboard/realtime`; used in home Leaderboard section.
- **`SimpleLeaderboardChart`** / **`DraftPointsChart`** – Bar charts; poll `/api/leaderboard/realtime` and `/api/drafts/standings`.
- **`EditableLeaderboardTable`** – Used in Wizards (leaderboard tab); save via `/api/admin/leaderboard/update`.

### **After clone / rebuild**
1. `npm install` · `npx prisma generate` · `npm run build`.
2. Set `DATABASE_URL` (Postgres). See [VERCEL_POSTGRES_SETUP.md](VERCEL_POSTGRES_SETUP.md).
3. `npx prisma migrate dev` · `npx prisma db seed` (optional).
4. `npm run dev` → open `/`, then **Edit** → Wizards. Use **Create League Tournament Records** if no league.

### **Database**
- **PostgreSQL** via `DATABASE_URL`. See [Vercel Postgres Setup](VERCEL_POSTGRES_SETUP.md). Admin dashboard `dbSize` shows N/A for Postgres.

### **Run**
- `npm run dev` → dev server on port 3003. If `EADDRINUSE`, stop the process using 3003 or run `npm run dev:alt` (port 3004).
- `npm run build` && `npm start` → production run.