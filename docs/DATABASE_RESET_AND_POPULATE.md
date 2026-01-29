# Reset Database and Install 16 Players + Leaderboard

Use this when the database is messed up or you want a clean DB with 16 players, game scores, and a leaderboard (top player first).

---

## What you get

- **Database:** Empty schema, then migrations applied.
- **16 players:** DragonMaster, SpellSlinger, CardShark, etc., each with a commander.
- **Sample games:** A few commander games with placements and points.
- **Leaderboard:** Sorted by total points (highest first). Top player at top, then down the list.

---

## Option A – Local (same machine as the app)

Use this when `DATABASE_URL` in `.env` points to a local or dev Postgres you can reset.

### 1. Reset DB and apply migrations

In the project root:

```bash
cd "C:\Users\Aaron\All-Cursor-projects\mtg-maui.com"
npm install
npx prisma migrate reset --force
```

This **drops all data**, reapplies migrations, and runs the seed (admin + sample data). It will ask to confirm unless you use `--force`.

### 2. Add 16 players and games (leaderboard data)

1. Start the app:

   ```bash
   npm run dev
   ```

2. Open **http://localhost:3004/wizards**.
3. Click **“Create League Tournament Records”** (or the button that calls the populate API).

That creates the default league, 16 players with commanders, and sample games with scores. The **home leaderboard** will show them sorted by points (top player at top).

### 3. Fix Vercel uploads (deploys)

- In **Vercel → Project → Settings → Environment Variables**, set **Production** (and **Preview** if you use it):
  - `DATABASE_URL` = your **Postgres** connection string (not a file path).
- If you had a failed migration (P3009), **reset the remote DB** once (Option B below), then redeploy.

---

## Option B – Remote DB (Vercel / Neon)

Use this when the DB is on Vercel or Neon and you can’t run `migrate reset` against it from your machine (or you want to reset only that DB).

### 1. Reset the remote schema (run SQL once)

**Neon:**

1. Go to [console.neon.tech](https://console.neon.tech) and open the project used by `mtg-maui-com`.
2. Open **SQL Editor** and run:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

**Vercel Storage (Postgres):**

1. In Vercel, go to **Storage** → your Postgres DB.
2. If there is a **Query** / **SQL** tab, run the same two lines above. If not, use Neon Console (if it’s Neon under the hood) or any Postgres client with `DATABASE_URL`.

### 2. Apply migrations from your machine

In the project root, with `.env` **DATABASE_URL** set to that same remote DB:

```bash
cd "C:\Users\Aaron\All-Cursor-projects\mtg-maui.com"
npm install
npx prisma migrate deploy
npx prisma db seed
```

### 3. Add 16 players and games

- **Locally:** Run `npm run dev`, open http://localhost:3004/wizards, click **“Create League Tournament Records”**.
- **On Vercel:** Deploy the app (push to `main` or redeploy). Open **https://your-app.vercel.app/wizards** and click **“Create League Tournament Records”**.

The leaderboard will show 16 players with scores, top player at top.

### 4. Fix uploads (Vercel)

- **Settings → Environment Variables:** `DATABASE_URL` must be **Postgres** for Production (and Preview if needed).
- After resetting the DB and running `migrate deploy` once, **Redeploy** the project so the build runs `npx prisma migrate deploy && npm run build` successfully (no P3009).

---

## Quick reference

| Goal                    | Command / action                                              |
|-------------------------|---------------------------------------------------------------|
| Reset local DB          | `npx prisma migrate reset --force`                            |
| Reset remote DB         | Run `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` in SQL |
| Apply migrations        | `npx prisma migrate deploy` (remote) or `migrate dev` (local)  |
| Seed base data          | `npx prisma db seed`                                         |
| Add 16 players + games  | Open /wizards → **Create League Tournament Records**        |
| Leaderboard (top down)  | Home → Leaderboard section (sorted by points, highest first) |

---

## Troubleshooting

- **P3009 (failed migration):** The DB has a failed migration. Reset the schema (Option B step 1), then run `npx prisma migrate deploy` again.
- **Error code 14 / “Unable to open the database file”:** App is using SQLite. Set `DATABASE_URL` to a **Postgres** URL everywhere (Vercel + local `.env`).
- **Empty leaderboard:** Run “Create League Tournament Records” from /wizards once after reset.
