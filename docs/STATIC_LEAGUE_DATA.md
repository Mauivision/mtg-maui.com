# Static League Data — No Database Required

When `DATABASE_URL` is not set (or `USE_STATIC_LEAGUE_DATA=true`), the app uses **raw JSON data** instead of the database. No Postgres needed.

## Quick start (no database)

1. In `.env`: either omit `DATABASE_URL`, or add `USE_STATIC_LEAGUE_DATA=true`
2. If you see "URL must start with postgresql://" — remove or fix `DATABASE_URL`, then the app will use static data
3. Run `npm run dev`
3. Open http://localhost:3003 — leaderboard, character sheets, and pod results load instantly

## Editing the data

Edit **`src/data/league-data.json`** to update players, games, and scores.

### Structure

```json
{
  "league": { "id": "...", "name": "...", ... },
  "players": [
    { "id": "april", "name": "April", "commander": "Loica Cole" }
  ],
  "games": [
    {
      "date": "2026-01-05",
      "round": 1,
      "pod": "A",
      "results": [
        { "playerId": "april", "place": 1, "points": 9 },
        { "playerId": "ronnie", "place": 2, "points": 1 }
      ]
    }
  ]
}
```

### Adding a new game

1. Add a new object to the `games` array
2. Use existing `playerId` values (must match `players[].id`)
3. Set `place` (1–4) and `points` per player
4. Save — refresh the page to see changes

### Adding a new player

1. Add `{ "id": "newkey", "name": "Full Name", "commander": "Deck" }` to `players`
2. Use that `id` as `playerId` in game results

## Switching back to database

Set `DATABASE_URL` in `.env` and remove `USE_STATIC_LEAGUE_DATA` (or set it to `false`). The app will use Postgres again.
