# Verify Games and Draft Scores

Use this checklist to confirm all games and draft scores match the info you provided. Run with `DATABASE_URL` set (local or production).

---

## 1. Data sources (already in code)

### First draft scores (Draft VP)

| Player  | Draft VP |
|---------|----------|
| Zach    | 6        |
| Nate    | 5        |
| Aaron H | 5        |
| James   | 4        |
| Tre     | 4        |
| Tim     | 5        |
| Kevin   | 4        |
| Travis  | 3        |
| Aaron V | 3        |
| Scott   | 3        |
| Kaipo   | 3        |
| April   | 2        |
| Ronnie  | 2        |
| Aaron S | 2        |
| Kendra  | 1        |
| Dustin  | 1        |

- **Seed:** `prisma/seed-first-draft-scores.ts` (NAME_AND_SCORES)
- **Draft score-table UI:** default “Import standings” text matches above (16 lines)
- **Static data:** `src/data/league-data.json` → `draftStandings.standings` matches above
- **Note:** Tim played for Dan; his first-draft points are shown but **not** added to his total (see below).

### Commander pods (Feb 2026)

- **Pod 1 (Feb 22):** Ronnie 12, Aaron V 1, Nate 2, Tre 2
- **Pod 2 (Feb 22):** Dan 15, Dustin 6, Kendra 1, Kaipo 0
- **Pod 3 (Feb 16):** James 7, April 2, Aaron S 0, Scott 2
- **Pod 4 (Feb 16):** Kevin 8, Travis 2, Zach 1, Tim 1

- **Seed:** `prisma/seed-commander-pods-feb-2026.ts`
- **Static data:** `src/data/league-data.json` → `games` includes these pods (rounds 5–8).

### Player status

- **Aaron H:** Dropped (no longer in league totals). Seed: `prisma/seed-tim-new-aaron-h-dropped.ts` sets his membership `active: false`. Static: `league-data.json` has `"active": false` for Aaron H.
- **Tim:** Replaced Aaron H’s spot. Tim’s points from **first draft are not in his total** (played for Dan; Dan gets cards). Tim gets points for all games/drafts from here on.
- **Dan:** Gets first-draft cards (Tim played for him). Dan has 0 draft points from that event; no change needed in data.

### News

- **Draft Sunday March 1st 2026.** Seed: `prisma/seed-news-march-draft-2026.ts` → run `npm run prisma:seed:news-march-draft`.

---

## 2. Run updates (when DATABASE_URL is set)

From project root, in a shell where `DATABASE_URL` is set (e.g. copy from Vercel for production):

```powershell
# Commander pods (Feb 16 & 22)
npm run prisma:seed:commander-pods-feb

# Tim added, Aaron H dropped
npm run prisma:seed:tim-aaron

# First draft scores (draft must exist with 16 participants + pairings)
npx ts-node --project tsconfig.seed.json prisma/seed-first-draft-scores.ts

# News: Draft March 1st 2026
npm run prisma:seed:news-march-draft
```

Or on the **live site:** Wizards → Draft score table → **Import standings (name + score)** (pre-filled with the 16 names/VP above), then add news in Wizards → News if you prefer.

---

## 3. Scoring logic (how totals are built)

- **Commander points:** Only from `LeagueGame` where `gameType === 'commander'`. No draft or other game types count here.
- **Draft points:** Only from `DraftEvent` / `DraftMatch` (match wins × 3). All drafts are merged; **first draft only:** Tim’s points are **excluded** from his total and shown as “First draft (played for Dan): X pts — not in total.”
- **Total:** `Commander + Draft` (with Tim’s first-draft draft points excluded for Tim only).

Same behavior in static mode: `src/lib/static-league-data.ts` uses commander from `games`, draft from `draftStandings`, and excludes Tim’s first-draft points from his total.

---

## 4. What to check after running seeds

1. **Leaderboard (e.g. `/score` or main leaderboard):**
   - Commander column = pod points only (e.g. April 2 from Pod 3 if only Feb pods; more if you have earlier pods in DB).
   - Draft column = draft points (from DraftEvent); Tim has 0 from first draft in his total but a line “First draft (played for Dan): 15 pts — not in total” (or whatever 5 wins × 3 is).
   - Total = Commander + Draft (for Tim, draft does not include first draft).

2. **Draft score table** (`/draft/score-table?draftId=...`):
   - After Import standings (or seed), standings show the 16 players with match points derived from the VP list (order: Zach, Nate, Aaron H, …).

3. **Draft points chart** (e.g. `/api/drafts/standings` or chart on site):
   - Shows latest draft standings; points = match points (3 per win) from match results.

4. **Aaron H:** Not in active leaderboard (dropped). **Tim:** In leaderboard; first-draft points listed but not in total.

---

## 5. If something is wrong

- **April commander 15 instead of 14:** Ensure no draft or non-commander game is counted as commander (we only count `gameType === 'commander'`). If you still see 15, check for an extra Commander pod or duplicate game in the DB.
- **Draft totals wrong:** Ensure draft scores were imported (Import standings or first-draft seed) and that only `DraftEvent` is used for draft points (no LeagueGame draft leakage).
- **Tim’s total includes first draft:** Ensure the first draft in the DB is the oldest by `createdAt`; the code excludes only that draft’s points for Tim.
