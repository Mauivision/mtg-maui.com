# How to Update New Games and Draft Games

This guide walks you through getting **Commander pods**, **draft scores**, and **player status** (e.g. Tim new, Aaron H dropped) to show on the live site.

---

## Why doesn't the Vercel (live) page show the new scores?

The **live site uses a different database** than your laptop.

| Where you run things | Database used | Who sees the data |
|----------------------|----------------|--------------------|
| Seeds or dev server on your machine (with local `.env`) | Your **local** Postgres (or dev DB) | Only you, at localhost |
| The **Vercel** deployment (mtg-maui.com) | The **production** Postgres (`DATABASE_URL` in Vercel) | Everyone on the live site |

So:

- **Current scores** you see on the live site are in the **production** database.
- **New scores** you added by running seeds locally are in your **local** database.
- The live page only reads from **production**, so it will keep showing current scores and **won’t** show the new ones until those are added to the **production** database.

To have **both current and new scores** on the live site:

1. **Do not** replace or reset the production database.
2. **Add** the new games/scores **into** the production database (run the seeds or use Import on the **live** site with production `DATABASE_URL`). Then the live page will show current + new scores together.

**Quick fix (run once from your machine):**

1. In **Vercel** → your project (**mtg-maui-com**) → **Settings** → **Environment Variables**, copy the **Production** value of `DATABASE_URL`.
2. Open a terminal in the project folder and set that URL in the same shell (see [Run commands against production](#run-commands-against-production) for exact commands).
3. Run: `npm run prisma:seed:commander-pods-feb` (adds the 4 Commander pods to production).
4. Run: `npm run prisma:seed:tim-aaron` (adds Tim, marks Aaron H dropped).
5. For **draft** scores: use the **live site** → Wizards → Draft score table → **Import standings (name + score)** so the data goes straight into the production DB.

After that, refresh the live site; you should see current scores plus the new pods and draft data.

---

## Prerequisites

- **Production database:** Your live site (Vercel) must have `DATABASE_URL` set in **Project → Settings → Environment Variables** to your **production** Postgres (e.g. Vercel Postgres).
- **Migrations:** Run `prisma migrate deploy` against production when you change the schema (see [Run commands against production](#run-commands-against-production)). The Vercel build does not run migrations so the build always succeeds even without `DATABASE_URL`. If you ever need to run migrations manually against production, see [Run commands against production](#run-commands-against-production) below.

---

## 1. Commander games (pods)

To add the **4 Commander pods** (Pod 1–4, Feb 16 & Feb 22) or any future pods:

### Option A: Run the seed script against production (recommended once)

From your **local machine**, with the **production** `DATABASE_URL` in the environment:

1. Copy the production `DATABASE_URL` from Vercel:
   - **Vercel** → your project → **Settings** → **Environment Variables** → copy `DATABASE_URL` (Production).

2. In a terminal (PowerShell or Command Prompt), from the project root:

   **Windows (PowerShell):**
   ```powershell
   $env:DATABASE_URL = "postgresql://..."   # paste your production URL
   npx ts-node --project tsconfig.seed.json prisma/seed-commander-pods-feb-2026.ts
   ```

   **Windows (Cmd) or Mac/Linux:**
   ```bash
   set DATABASE_URL=postgresql://...   # Windows Cmd
   # OR
   export DATABASE_URL="postgresql://..."   # Mac/Linux
   npx ts-node --project tsconfig.seed.json prisma/seed-commander-pods-feb-2026.ts
   ```

   Or use the npm script:
   ```bash
   # After setting DATABASE_URL in the same shell:
   npm run prisma:seed:commander-pods-feb
   ```

3. After it runs, the **Scores** page (`/score`) on the live site will show the four pods.

### Option B: Add games via Wizards (no seed)

- Log in to **Wizards** on the live site → **Games** tab.
- Click **Add Game**, choose **Commander**, pick date and 4 players, enter placements and points, save.
- Repeat for each pod.

---

## 2. Draft games (first draft scores)

To load the **first draft** standings (Kendra 1, April 2, James 4, etc.) on the **live** site:

### Option A: Use the Import standings button (easiest)

1. On the **live site**, go to **Wizards** (admin).
2. Open the **Drafts** section and click the draft’s **score table** link (or go to `/draft/score-table?draftId=<your-draft-id>`).
3. Ensure that draft has **16 participants** and **pairings generated** (button “Generate pairings (4 rounds)” if needed).
4. Click **“Import standings (name + score)”**.
5. The modal is pre-filled with the 16 lines. Click **“Import standings”**.
6. The table and standings will update; refresh if needed.

### Option B: Run the first-draft seed against production

If you prefer to run the seed script that uses the same name+score list:

1. Set `DATABASE_URL` to your **production** URL (same as in section 1).
2. Run:
   ```bash
   npx ts-node --project tsconfig.seed.json prisma/seed-first-draft-scores.ts
   ```
   This expects the **first** draft (by creation date) to exist with 16 participants and pairings already generated. If that’s not true, create the draft and generate pairings in Wizards first, then run the seed.

---

## 3. Player status: Tim (new), Aaron H (dropped), and first draft (Tim played for Dan)

- **Aaron H** has **dropped** from the league. His points are not transferred to anyone.
- **Tim** has taken Aaron H’s place in the league. Tim does **not** share points with Aaron H; Tim earns points from all games and drafts from here on.
- **First draft:** Tim played for **Dan** so Dan could use the draft cards. Dan gets the cards; Tim’s first-draft points are **listed** on the leaderboard as “First draft (played for Dan): X pts — not in total” and are **not** added to Tim’s total. Tim’s total = Commander + Draft from **later** drafts only. Run the first-draft seed or Import standings as usual; the leaderboard logic excludes Tim’s first-draft points from his total automatically.

To show **Tim as a new player** and **Aaron H as dropped** on the live site:

### Option A: Run the seed script against production

1. Set `DATABASE_URL` to your **production** URL.
2. Run:
   ```bash
   npm run prisma:seed:tim-aaron
   ```
   or:
   ```bash
   npx ts-node --project tsconfig.seed.json prisma/seed-tim-new-aaron-h-dropped.ts
   ```
   This adds Tim to the league (if missing) and marks Aaron H as dropped.

### Option B: Use Wizards

- **Tim:** Wizards → **Players** → **Add** a player (name Tim, email, etc.). He’ll show with the **New** badge for 60 days.
- **Aaron H:** Wizards → **Players** → find Aaron H → **Edit** and set status to **Dropped** (or use the toggle if you add one). The table shows **Dropped** for inactive members.

---

## 4. News (e.g. Draft March 1st 2026)

To add the **Draft this Sunday — March 1st, 2026** news item:

1. Set `DATABASE_URL` to your **production** URL (or local).
2. Run: `npm run prisma:seed:news-march-draft`

Or in **Wizards** → **News** → add a post with title “Draft this Sunday — March 1st, 2026” and category **Announcements**.

---

## 5. Run commands against production

Whenever a doc says “run against production,” use your **production** `DATABASE_URL` in the same terminal session, then run the command.

**One-time setup (migrations):**
```bash
# Set DATABASE_URL to production, then:
npx prisma migrate deploy
```

**Seeds (use only when you want to push seed data to production):**
```bash
# Commander pods (Pod 1–4 Feb 2026)
npm run prisma:seed:commander-pods-feb

# Tim new + Aaron H dropped
npm run prisma:seed:tim-aaron

# First draft scores (draft must exist with 16 players + pairings)
npx ts-node --project tsconfig.seed.json prisma/seed-first-draft-scores.ts

# News: Draft Sunday March 1st 2026
npm run prisma:seed:news-march-draft
```

Never point `DATABASE_URL` at production by mistake when running `prisma migrate reset` or `db:reset`; those wipe the database.

---

## 6. Quick checklist

| Goal                         | Where to do it                    | Action |
|-----------------------------|------------------------------------|--------|
| Commander pods on live site | Local terminal + prod `DATABASE_URL` or Wizards | Run `prisma:seed:commander-pods-feb` **or** add each pod in Wizards → Games |
| First draft scores on live | Live site                          | Draft score table → **Import standings (name + score)** → Import |
| Tim new, Aaron H dropped   | Local terminal + prod `DATABASE_URL` or Wizards | Run `prisma:seed:tim-aaron` **or** add Tim and mark Aaron H dropped in Wizards → Players |
| News: Draft March 1st 2026 | Local terminal + prod `DATABASE_URL` or Wizards | Run `npm run prisma:seed:news-march-draft` **or** add in Wizards → News |
| Schema up to date on prod  | Automatic on deploy                | Vercel build runs `prisma migrate deploy` |

---

## 7. Troubleshooting

- **Scores page empty:** Commander games only show if they have **LeagueGameDeck** records (created by the seed or by adding games via Wizards with players who have decks). Run the Commander pods seed or add games in Wizards.
- **Draft import fails:** “Could not match…” means a name in the list doesn’t match a participant. Check spelling (e.g. Kaipo vs Kalpo) and that the draft has exactly 16 participants.
- **Build fails on Vercel:** Check **Deployments** → latest → **Build Logs**. Ensure `DATABASE_URL` is set for Production and that migrations apply (no pending migration conflicts).
