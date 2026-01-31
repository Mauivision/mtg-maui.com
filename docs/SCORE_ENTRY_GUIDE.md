# Score Entry Guide — Manual Updates with Cursor

This guide explains how to add game results manually (with Cursor's help) instead of using the web data-entry interface.

## Quick Reference

### Run game seed scripts

```bash
# All 16 players + Pods A–D in one go (recommended for fresh setup)
npm run prisma:seed:maui

# Or add pods individually:
# Pod A only (Jan 5)
npm run prisma:seed:game

# Pod B only (Jan 10)
npm run prisma:seed:game:b

# Pod C only (Jan 25)
npm run prisma:seed:game:c

# Pod D only (Jan 30)
npm run prisma:seed:game:d

# All Pods A–D (full cumulative leaderboard)
npm run prisma:seed:games
```

### Add a new game

1. Create a new file: `prisma/seed-game-YYYY-MM-DD.ts` (copy from `seed-game-2026-01-05.ts`)
2. Update the `PLAYERS` array with names, decks, points, and placement
3. Update the game date and notes
4. Run the script

## Score Sheet Format (for Cursor)

When you have a new game, paste the score sheet summary in this format and ask Cursor to add it:

```
League: Maui Commander League
Date: M/D/YY (e.g., 1/5/26)
Pod: A

Placements:
- 1st: [Name] — [VP] VP
- 2nd: [Name] — [VP] VP
- 3rd: [Name] — [VP] VP
- 4th: [Name] — [VP] VP

Optional: Golden/Silver objectives, eliminations, notes.
```

Cursor will create the seed script and run it.

## Data Model

- **LeagueGame** — One record per game. `placements` JSON drives the leaderboard.
- **placements** format: `[{ playerId, place, points }, ...]`
- The leaderboard API aggregates `points` and counts `place === 1` as wins.

## Existing Seed Scripts

| File | Command | Game |
|------|---------|------|
| `prisma/seed-game-2026-01-05.ts` | `npm run prisma:seed:game` | Pod A, Jan 5, 2026 |
| `prisma/seed-game-2026-01-10.ts` | `npm run prisma:seed:game:b` | Pod B, Jan 10, 2026 |
| `prisma/seed-game-2026-01-25.ts` | `npm run prisma:seed:game:c` | Pod C, Jan 25, 2026 |
| `prisma/seed-game-2026-01-30.ts` | `npm run prisma:seed:game:d` | Pod D, Jan 30, 2026 |

## Prerequisites

- `.env` with `DATABASE_URL` pointing to your Postgres database (create from `.env.example` if needed)
- Run `npx prisma generate` if schema changed
- If using a fresh DB, run `npm run prisma:migrate:deploy` first

## Tips

- Players are created by email: `{name}@maui-commander.local` (lowercase)
- Scripts are idempotent: running twice won’t duplicate (checks for existing game on same date)
- Use `Maui Commander League` or `MTG Maui League` — both work; script prefers Maui Commander first
