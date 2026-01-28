# Database & Prisma

## What Prisma Does

**Prisma** is the app’s **ORM** (object–relational mapping). It:

- Connects to the database (SQLite locally, typically PostgreSQL in production).
- Uses `prisma/schema.prisma` to define **models** (League, LeagueGame, ScoringRule, User, etc.).
- Generates a **Prisma Client** used in API routes (`src/app/api/...`) to read/write data.
- Handles migrations and seeding.

You never touch SQL directly; you use `prisma.league.findMany()`, `prisma.scoringRule.create()`, etc.

---

## Where Data Is Stored

- **Database file (local):** `prisma/dev.db` (SQLite). It’s gitignored.
- **Schema:** `prisma/schema.prisma` defines all tables and relations.

### Score auto-selection / scoring rules

- **Table:** `ScoringRule` (see `prisma/schema.prisma`).
- **Fields:** `leagueId`, `gameType` (e.g. `commander`, `draft`), `name`, `points`, `description`, `active`.
- **API:** `GET/POST/PUT/DELETE /api/admin/scoring-rules?leagueId=...`  
  Used by **Wizards → Scoring Rules** and the **Leaderboard** (rules display + recalculation).
- **Seed:** Default rules are created by `prisma/seed.ts` and `prisma/seed-default-league.ts` (e.g. Gold Objective, Silver Objective, placement bonuses).

### Leagues, games, leaderboard

- **League:** `League` model. Leaderboard and Wizards use the “current” league from `LeagueContext`.
- **Games:** `LeagueGame` + `LeagueGameDeck`. Scores and placements drive the leaderboard.
- **Leaderboard:**  
  - **Live:** `GET /api/leaderboard/realtime` (polls `LeagueGameDeck`).  
  - **Detailed:** `GET /api/leagues/[leagueId]/leaderboard`.  
  You need at least one **League** (and ideally games + scoring rules) for the leaderboard to show real data.

---

## “Unable to open the database file” (Error code 14)

This usually means:

1. The DB file **doesn’t exist** yet (migrations haven’t been run), or  
2. The process **can’t create or read** `prisma/dev.db` (wrong CWD, permissions, or path).

### Fix

Always run commands and the app (`npm run dev`, `next start`) from the **project root**. Then:

```bash
npx prisma migrate dev
npx prisma db seed
```

- `migrate dev` creates `prisma/dev.db` (if missing) and applies migrations.  
- `db seed` runs `prisma/seed.ts`, which creates a default **League**, **ScoringRules**, users, page content, etc.

Then restart your app (`npm run dev`). The error should go away.

### Production (e.g. Vercel)

SQLite and a local `dev.db` file are **not** suitable for serverless/production. Use **PostgreSQL** (or another hosted DB), set `DATABASE_URL` in the environment, point the Prisma datasource to it, and run `npx prisma migrate deploy` (and optionally seed) in your deploy pipeline.

---

## How to “Make” the Leaderboard

1. **Ensure DB exists and is seeded:**  
   `npx prisma migrate dev` then `npx prisma db seed`.

2. **Ensure a League exists:**  
   Seed creates “MTG Maui League”. You can also create one via `POST /api/leagues` or **Wizards → Create League Tournament Records** (see below).

3. **Optional – add sample data:**  
   `POST /api/admin/populate` creates 16 players and sample games for the default league. Use **Create League Tournament Records** or call the API (e.g. from Wizards or a one-off script).

4. **Use the app:**  
   Open **Leaderboard**. The app uses the current league from the header/context and fetches live + traditional leaderboard data from the APIs above.

---

## Editing data (players, games, points, commanders, etc.)

For **where** and **how** to add or edit players, games, points, commanders, events, and tournaments in the app, see **[docs/EDITABLE_DATA_GUIDE.md](EDITABLE_DATA_GUIDE.md)**.

---

## “Create League Tournament Records” Button

This action sets up everything needed for the leaderboard:

- Creates the **default league** (if missing).
- Adds **16 sample players** and **sample games**.
- Creates **scoring rules** and related data.

It calls `POST /api/admin/populate`. The button appears:

- On the **Leaderboard** page when league status fails (e.g. no league or DB error).
- In **Wizards** when **No League Available** is shown.

After it runs, refresh leagues (and status) so the new league and records appear on the Leaderboard.
