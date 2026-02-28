# Making This a Working Site with One Current Database

This doc explains how to run the site so **games, drafts, and events** live in **one real database**, and how that works **without Cursor** for day-to-day updates. It also clarifies **local testing** (e.g. Cursor agent on localhost) vs the **live site**.

---

## 1. One “current” database for games, drafts & events

You have **one** database that should be the source of truth for the live site:

- **Games** (Commander pods, etc.) → `LeagueGame` (and related tables)
- **Drafts** (events, participants, match results) → `DraftEvent`, `DraftMatch`, `DraftParticipant`
- **Events** (tournaments, meetups) → `Event`
- **News** (reel on homepage) → `News`
- **Players / league** → `User`, `League`, `LeagueMembership`, etc.

That database is the **production** Postgres that Vercel uses (the one whose URL is in **Vercel → Settings → Environment Variables** as `DATABASE_URL`). The **live site** (mtg-maui.com) reads and writes only to that DB. So:

- **“Current database”** = the Postgres instance connected to your Vercel project.
- **To “create the database of all our games, drafts & events”** you either:
  - **Option A:** Use the **live site** (Wizards) to add events, news, games, draft scores, and players. Everything you create there is stored in that one production DB.
  - **Option B:** Run **seed scripts** once (with `DATABASE_URL` set to that same production URL) to bulk-load historical data, then use the site for new data.

No second “copy” of the app is needed: one codebase, one production DB, one live site.

---

## 2. Using the site without Cursor always updating

**Yes.** Once the app is deployed and `DATABASE_URL` points at your production Postgres:

- You (or anyone with access to Wizards) can **create and edit** events, news, games, draft scores, and players **through the site** — no Cursor, no code edits, no redeploys.
- **Cursor is only for changing the application code** (new features, bug fixes, UI changes). Day-to-day content changes are done in the browser.

So:

- **Add Event** → creates an `Event` and (with the latest code) a **News** post.
- **Add Game** (Wizards → Games) → creates a `LeagueGame` and updates leaderboard data.
- **Draft score table** → Import standings or edit match results → updates `DraftMatch` and draft standings.
- **News** → add/edit in Wizards → News.

All of that hits the **same current database** (production). No Cursor required for those updates.

---

## 3. Local testing (Cursor agent, localhost) vs live site

| Where you run | Database used | Purpose |
|---------------|----------------|--------|
| **Localhost** (e.g. `npm run dev` on your machine) | Whatever is in your **local** `.env` as `DATABASE_URL` (often a local Postgres, or none / static mode) | Test code and flows (e.g. “create an event and news post”) without touching production. |
| **Live site** (mtg-maui.com on Vercel) | **Production** Postgres (`DATABASE_URL` in Vercel) | Real data. This is the “working page” and the “current database” for your league. |

So:

- **“Tests with the Cursor agent in a virtual localhost”** (e.g. run the site locally, create an event and a news post) use the **local** database (or static data if you have no `DATABASE_URL`). That’s good for checking that the app works; it does **not** by itself update the live site or the production DB.
- To have the **same** event and news on the **live** site, you either:
  - Create them again in **Wizards** on the live site (recommended), or
  - Point your local `DATABASE_URL` at the **production** URL and run the app locally once to create them (not recommended for routine use; easy to mix up envs).

So: **local = test;** **production = real.** The “working page” and “current database” are the live site and its Postgres.

---

## 4. Step-by-step: get to a working page with one current database

1. **Database**
   - Use one Postgres (e.g. **Vercel Postgres** or Supabase).
   - In **Vercel → Project → Settings → Environment Variables**, set **`DATABASE_URL`** (Production) to that Postgres URL.

2. **Schema**
   - In the project root (with `DATABASE_URL` pointing at that DB):
     ```bash
     npx prisma migrate deploy
     ```
   - So the “current” database has the same schema as the code (Event, News, LeagueGame, DraftEvent, etc.).

3. **Deploy**
   - Push to `main` (or your production branch). Vercel builds and deploys. The live site now uses that same `DATABASE_URL` (the one current database).

4. **Initial data (optional)**
   - **Option A:** Use only the **live site**: Wizards → add events, news, games, players, draft score table, etc. All of it goes into the production DB.
   - **Option B:** One-time seeds against production (see [UPDATE_GAMES_AND_DRAFTS.md](./UPDATE_GAMES_AND_DRAFTS.md)): copy production `DATABASE_URL` into your terminal, then run the seed commands. After that, use the site for new data.

5. **Ongoing updates**
   - Add/edit **events** → Wizards → Events → Add Event (also creates a news post with current code).
   - Add/edit **news** → Wizards → News.
   - Add **games** → Wizards → Games.
   - **Draft scores** → Wizards → Draft score table → Import or edit matches.
   - No Cursor, no code changes, no redeploys for this.

---

## 5. Summary

- **Working page** = the live site (e.g. mtg-maui.com) connected to **one** Postgres DB.
- **“Current database” of games, drafts & events** = that same production DB; you build it by using the site (and optionally one-time seeds).
- **Without Cursor** = you can do all content updates (events, news, games, drafts) in the browser; Cursor is only for code.
- **Localhost + Cursor agent** = tests against a local (or static) environment; to see the same data on the live site, create it there or run seeds against production.

If you tell me whether you’re using Vercel Postgres or another provider, I can adapt these steps (e.g. where to copy `DATABASE_URL` from) for your exact setup.
