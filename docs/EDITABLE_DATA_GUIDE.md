# Editable Data Guide – Tournaments, Games, Players, Points, Commanders

This guide explains **where** and **how** to add or edit league data (players, games, points, commanders, events, etc.) within the project.

**Pages:** Home (`/`) shows Leaderboard, Character Charts, News Feed. All editing is in **Wizards** (`/wizards`). See [DIRECTION_AND_CONTROLS](DIRECTION_AND_CONTROLS.md).

---

## Where to Edit Data

| Data | Where to edit | API |
|------|----------------|-----|
| **Players** (name, email, commander) | Wizards Control → **Players** tab | `GET/POST/PUT/DELETE /api/admin/players` |
| **Games** (date, players, placements, points) | Wizards Control → **Games** tab | `GET/POST/PUT/DELETE /api/admin/games` |
| **Points / leaderboard** | Wizards → **Leaderboard** tab (Edit Scores) | `POST /api/admin/leaderboard/update` |
| **Scoring rules** (gold, silver, placement) | Wizards Control → **Scoring Rules** tab | `GET/POST/PUT/DELETE /api/admin/scoring-rules` |
| **Events** (calendar / bulletin) | Wizards Control → **Events** tab | `GET/POST/PUT/DELETE /api/admin/events` |
| **News** | Wizards Control → **News** tab | `GET/POST/PUT/DELETE /api/admin/news` |
| **Draft events** | Wizards Control → **Drafts** tab | `GET/POST/PUT/DELETE /api/admin/drafts` |
| **Commander pairings** | Wizards Control → **Commander Pairings** tab | `GET/POST /api/admin/pairings` |
| **Page content** (titles, hero, nav) | Wizards Control → **Page Content** tab | `GET/PUT /api/admin/pages` |
| **Seasons** | Wizards Control → **Seasons** tab | Uses Events API |

---

## How to Access the Editable UI

1. **Wizards Control**  
   - Open **[/wizards](http://localhost:3004/wizards)** (or your app URL + `/wizards`).  
   - If you see “No League Available,” use **Create League Tournament Records** to create the default league, players, and sample games.  
   - Use the tabs to manage **Players**, **Games**, **Events**, **News**, **Drafts**, **Leaderboard**, **Scoring Rules**, **Page Content**, etc.

2. **Leaderboard “Edit Scores”**  
   - Open **Wizards** → **Leaderboard** tab.  
   - Use the editable table to change **total points**, **wins**, etc. per player.  
   - Save sends updates to `POST /api/admin/leaderboard/update`.  
   - **View** rankings on **Home** → scroll to **Leaderboard** (or `/#leaderboard`).

---

## Step-by-Step: Common Tasks

### 1. Add players (name, email, commander)

1. Go to **Wizards** → **Players (1–16)**.  
2. Click **Add Player**.  
3. Fill **Name**, **Email**, and **Commander** (e.g. “The Ur-Dragon”).  
4. Save.  

- **API:** `POST /api/admin/players` with `{ leagueId, name, email, commander? }`.  
- Commander is stored on the player’s **LeagueDeck**. The leaderboard and games use this as the player’s default commander.

### 2. Add a game (players, placements, points)

1. Go to **Wizards** → **Games**.  
2. Click **Add Game**.  
3. Set **Game type** (Commander or Draft), **Date**, **Round**, **Table**, **Tournament phase** (e.g. swiss).  
4. **Select players** (checkboxes).  
5. For each selected player, set **Place** (1–4) and **Points**.  
6. Optional: **Notes**.  
7. Save.  

- **API:** `POST /api/admin/games` with `{ leagueId, gameType, date, tournamentPhase?, round?, tableNumber?, players[], placements[], notes? }`.  
- `placements`: `[{ playerId, placement, points }]`.  
- These games feed the **leaderboard** (live and detailed stats).

### 3. Edit points / wins (leaderboard)

**Option A – Leaderboard page**

1. Go to **Leaderboard** → **Edit Scores** tab.  
2. Edit **Total Points**, **Wins**, etc. in the table.  
3. Click **Save**.  

**Option B – Wizards**

1. Go to **Wizards** → **Leaderboard** tab.  
2. Same editable table; save there.  

- **API:** `POST /api/admin/leaderboard/update` with `{ leagueId, updates: [{ playerId, totalPoints, gamesPlayed, wins, averagePlacement }] }`.  
- The backend creates “adjustment” games when you change points/wins. Negative point changes may require manual game edits.

### 4. Change a player’s commander

1. Go to **Wizards** → **Players**.  
2. Click **Edit** on the player.  
3. Update **Commander** and save.  

- **API:** `PUT /api/admin/players` with `{ id, name?, email?, commander? }`.  
- Commander is stored on **LeagueDeck**; the leaderboard and game lists use it.

### 5. Add events (tournaments / calendar)

1. Go to **Wizards** → **Events**.  
2. Click **Add Event**.  
3. Set **Title**, **Description**, **Date**, **Time**, **Location**, **Max participants**, **Image URL** (optional).  
4. Save.  

- **API:** `POST /api/admin/events` with the same fields.  
- Events show on the **homepage** and **Bulletin** as “upcoming” or “ongoing.”

### 6. Add draft events

1. Go to **Wizards** → **Drafts**.  
2. Click **Add Draft**.  
3. Set **Name**, **Format**, **Date**, **Max participants**.  
4. Save.  

- **API:** `POST /api/admin/drafts`.  
- These are **DraftEvent** records (draft/sealed), separate from **Events**.

### 7. Adjust scoring rules (gold, silver, placement)

1. Go to **Wizards** → **Scoring Rules**.  
2. Pick **Commander** or **Draft**.  
3. Add, edit, or delete rules (e.g. Gold Objective, Silver Objective, Placement 1st–4th).  
4. Use **Recalculate** (or **Leaderboard** → Recalculate) to recompute leaderboard from existing games.  

- **API:**  
  - `GET/POST/PUT/DELETE /api/admin/scoring-rules`  
  - `POST /api/admin/leaderboard/recalculate` (reapply rules to all games).  

---

## Data Flow (high level)

```
Prisma (PostgreSQL)
  ├── League, LeagueMembership, LeagueDeck   → players, commanders
  ├── LeagueGame, LeagueGameDeck             → games, placements, points
  ├── ScoringRule                            → scoring config
  ├── Event, News                            → bulletin / homepage
  └── DraftEvent, PageContent, …

        ↓  API routes (/api/admin/*, /api/leagues/*)

Wizards (/wizards)    Home (/) — Leaderboard, Character Charts, News
  ├── Players, Games, Events, …   ├── Live Rankings, Detailed Stats
  └── Leaderboard, Scoring, …     └── Edit Scores (editable table)
```

- **Players** and **commanders** come from **LeagueMembership** + **LeagueDeck**.  
- **Games** and **points** come from **LeagueGame** + **LeagueGameDeck** (and placement JSON).  
- **Leaderboard** combines those plus **ScoringRule** for display and recalculation.

---

## “Tournaments” vs “Events” vs “Leagues”

- **League**  
  - The main competition (e.g. “MTG Maui League,” Chaos Commander Season 3).  
  - Has members, games, scoring rules.  
  - Leaderboard and Wizards both use the **current league**.

- **Events** (Wizards → Events)  
  - Calendar items (FNM, game night, etc.).  
  - Shown on **Bulletin** and **homepage**.  
  - Not the same as bracket tournaments.

- **Draft events** (Wizards → Drafts)  
  - Draft/sealed **DraftEvent** records.  
  - Separate from **Event**.

- **Games** (Wizards → Games)  
  - Individual **LeagueGame** records (Commander or Draft).  
  - Can have **tournament phase** (e.g. swiss, top8) and **round** for structure.

So: **league** = season/ladder; **events** = calendar; **games** = actual played matches (and optional tournament phase/round).

---

## Commander per game (optional future)

Right now, **commander** is stored per **player** (LeagueDeck). The game form does **not** ask “commander for this game.”

- **Schema:** `LeagueGame.placements` JSON can include `commander` per placement.  
- **APIs:** Games API accepts `placements` with extra fields; you could add `commander` there.  
- **UI:** You’d extend the **Add/Edit Game** modal to optionally let you pick or type a commander per player for that game, and send it in `placements[].commander`.  
- **Display:** Leaderboard / game history would need to use `placement.commander` when present, else fall back to the player’s default commander.

---

## Quick reference – API base URLs

All admin APIs expect `credentials: 'include'` when called from the app (cookies).

| Purpose | Method | Endpoint |
|--------|--------|----------|
| List players | GET | `/api/admin/players?leagueId=...` |
| Add player | POST | `/api/admin/players` |
| Update player | PUT | `/api/admin/players` |
| Delete player | DELETE | `/api/admin/players?id=...` |
| List games | GET | `/api/admin/games?leagueId=...` |
| Add game | POST | `/api/admin/games` |
| Update game | PUT | `/api/admin/games` |
| Delete game | DELETE | `/api/admin/games?id=...` |
| Update leaderboard | POST | `/api/admin/leaderboard/update` |
| Recalculate leaderboard | POST | `/api/admin/leaderboard/recalculate` |
| Scoring rules | GET/POST/PUT/DELETE | `/api/admin/scoring-rules?leagueId=...` |
| Events | GET/POST/PUT/DELETE | `/api/admin/events` |
| Drafts | GET/POST/PUT/DELETE | `/api/admin/drafts` |
| Populate (league + sample data) | POST | `/api/admin/populate` |

---

## Troubleshooting

- **“No League Available”**  
  Use **Create League Tournament Records** (Leaderboard or Wizards) so a default league and sample data exist.

- **Leaderboard empty**  
  Ensure you have **players** in the league and **games** with **placements**. Run **Recalculate** (Wizards → Leaderboard or Scoring Rules) if you changed scoring rules.

- **Can’t access /wizards or admin APIs**  
  Confirm admin/simple-auth is set up and that requests send cookies (`credentials: 'include'`).  
  See **docs/DATABASE_AND_PRISMA.md** for DB setup and **docs/PROJECT_STRUCTURE.md** for app layout.
