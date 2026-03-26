# Export scores to CSV (Supabase import)

Scores can come from **Postgres** (production / local DB) or from **static JSON** (`src/data/league-data.json`).

- If `DATABASE_URL` is a `postgres://` or `postgresql://` URL, the exporter uses **Postgres** by default.
- If `DATABASE_URL` is unset or not Postgres, it uses **static JSON**.
- To export JSON even when `DATABASE_URL` is set: `EXPORT_SCORES_SOURCE=static npm run export:scores`

## Postgres source

- Commander game points: `LeagueGameDeck.points` (one row per player per commander game). CSV `score_type`: `commander_game_points`.
- Draft match results: `DraftMatch.gamesWon1/gamesWon2` (exported as **3 points per match win**). CSV `score_type`: `draft_match_points`.

## Static JSON source

- Commander: one row per entry in each game’s `results` array. Same `score_type`: `commander_game_points` (IDs are prefixed with `static:`).
- Draft: rows from `draftStandings.standings` (name + points totals). CSV `score_type`: `draft_standing_points` (not per-match; use Postgres export if you need match-level draft rows).

## 1) Generate the CSV

**Refresh all exports at once** (scores + games import + player summary), from the same source as a single `npm run export:scores` (Postgres if `DATABASE_URL` is set, else static JSON):

```bash
npm run export:all
```

**From Postgres** (Vercel Postgres, local DB, or Supabase Postgres used by Prisma):

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB" npm run export:scores
```

**From static JSON** (no Postgres `DATABASE_URL`, or forced):

```bash
npm run export:scores
```

```bash
EXPORT_SCORES_SOURCE=static npm run export:scores
```

Requires `src/data/league-data.json`.

Output (gitignored):

- `exports/scores.csv`

The first column is **`id`**: same value as **`score_id`**, unique per row. In Supabase CSV import, choose **`id`** as the primary key column (type **text**).

## 1a) Player summary CSV (commander + draft + commander name + total + placement)

One row per player, aligned with the live leaderboard totals:

- **`player_name`**, **`commander_name`**
- **`commander_game_points`** — sum of commander pod VP
- **`draft_game_points`** — draft points counted toward the leaderboard (Postgres: 3 per match win from `DraftMatch`; static: VP from `draftStandings`; Tim’s first-draft exclusion matches the app)
- **`total_scores`** — commander + draft (for static Tim, first-draft VP is excluded from draft/total)
- **`placement`** — rank among **active** players (dropped players listed after with empty placement)
- **`active`** — `true` / `false`

```bash
npm run export:player-summary
DATABASE_URL="postgresql://..." npm run export:player-summary
EXPORT_PLAYER_SUMMARY_SOURCE=static npm run export:player-summary
```

Output: `exports/player-scores-summary.csv`

## 1b) Generate a Supabase "games import" CSV (creates games + scores)

Supabase CSV import works best when you import into a **staging table**, then run SQL to upsert into your real tables.
This repo can generate a CSV shaped for that staging table.

```bash
# Postgres source (recommended; exports real emails/names)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB" npm run export:supabase:games

# Static JSON source (no DB needed)
npm run export:supabase:games

# Force static even if DATABASE_URL is set
EXPORT_GAMES_SOURCE=static npm run export:supabase:games
```

Output (gitignored):

- `exports/supabase-games-import.csv`

The first column is **`id`** (unique per game row). In Supabase CSV import, choose **`id`** as the primary key (type **text**).

## 2) Create a table in Supabase (example)

In the Supabase SQL editor, you can create a simple import table:

```sql
create table if not exists public.scores_import (
  id text primary key,
  score_id text not null unique,
  score_type text not null,
  occurred_at timestamptz null,
  points int not null,
  placement int null,
  league_id text null,
  game_id text null,
  draft_event_id text null,
  draft_match_id text null,
  user_id text null,
  user_name text null,
  user_email text null,
  deck_id text null,
  deck_name text null,
  round int null,
  table_number int null,
  raw_games_won int null
);
```

## 2b) Create a staging table for game imports

This staging table is what `exports/supabase-games-import.csv` targets.

```sql
create table if not exists public.league_game_import (
  id text primary key,
  source text null,
  league_name text null,
  league_id text null,
  game_type text not null,
  date date not null,
  tournament_phase text null,
  round int null,
  table_number int null,
  notes text null,

  player_1_email text null,
  player_1_name text null,
  player_1_place int null,
  player_1_points int null,

  player_2_email text null,
  player_2_name text null,
  player_2_place int null,
  player_2_points int null,

  player_3_email text null,
  player_3_name text null,
  player_3_place int null,
  player_3_points int null,

  player_4_email text null,
  player_4_name text null,
  player_4_place int null,
  player_4_points int null,

  imported_at timestamptz not null default now()
);
```

## 3) Import the CSV in Supabase

- Go to **Table Editor** → `scores_import` → **Import data from CSV**
- Upload `exports/scores.csv`
- Set primary key column to **`id`** (text). Ensure **`id`** and **`score_id`** are imported as **text** (not UUID).

### Import games CSV

- Go to **Table Editor** → `league_game_import` → **Import data from CSV**
- Upload `exports/supabase-games-import.csv`

