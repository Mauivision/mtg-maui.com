# Connect this project to Supabase Postgres

[Supabase](https://supabase.com/) hosts a normal **PostgreSQL** database. This app uses **Prisma** and only needs a standard Postgres URL in **`DATABASE_URL`** — same as Vercel Postgres or local Postgres.

---

## 1. Get the connection string

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. **Project Settings** (gear) → **Database**.
3. Under **Connection string**, choose **URI**.
4. Copy the string (replace `[YOUR-PASSWORD]` with your database password if the UI shows a placeholder).

Use the connection mode Supabase recommends for **Prisma/server apps** (often **direct** on port `5432`, or **pooler** with their Prisma notes — see Supabase docs for “Prisma” if connections fail).

---

## 2. Local development

1. In the repo root, create **`.env.local`** (gitignored):

   ```env
   DATABASE_URL="postgresql://..."
   USE_STATIC_LEAGUE_DATA=
   SKIP_ADMIN_AUTH=true
   ```

2. Apply the schema to **your** Supabase database:

   ```bash
   npx prisma migrate deploy
   ```

3. Optional — load sample league data:

   ```bash
   npm run prisma:seed:maui
   ```

   Or use **Wizards** → create league / populate after `npm run dev`.

4. Start the app:

   ```bash
   npm run dev
   ```

5. Edit scores: **Wizards** (`/wizards`) → **Games** / **Leaderboard** tabs (with `SKIP_ADMIN_AUTH=true`, admin APIs are open — tighten auth for production).

---

## 3. Production (e.g. Vercel) + GitHub

Your repo ([Mauivision/mtg-maui.com](https://github.com/Mauivision/mtg-maui.com)) deploys from GitHub; the **database URL is not in Git**.

1. **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add **`DATABASE_URL`** = your Supabase URI (Production, and Preview if you want).
3. Do **not** set `USE_STATIC_LEAGUE_DATA=true` in production if you want the live site to use Supabase.
4. Redeploy (push to `main` or **Redeploy** in Vercel).

The build runs **`prisma migrate deploy`** then **`npm run build`** so the Supabase schema stays in sync on each deploy (requires `DATABASE_URL` to be present at build time).

---

## 4. CSV / exports

Exports and seeds that use `DATABASE_URL` will read/write **whatever database** that URL points to. Point it at Supabase when you want imports/seeds to affect the cloud DB. See `docs/EXPORT_SCORES_TO_SUPABASE.md` and `docs/UPDATE_GAMES_AND_DRAFTS.md`.

---

## 5. Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| Site still shows old/static data | `USE_STATIC_LEAGUE_DATA=true` or `DATABASE_URL` missing in that environment |
| Migration errors | Wrong password, wrong host/port, or need pooler params per Supabase |
| Wizards save fails | `DATABASE_URL` not set on serverless env, or RLS blocking (this app uses Prisma with service role via URL — use the **database** connection string, not the anon REST key) |
| Table Editor edits don’t match site | Editing a custom import table; app reads `"LeagueGame"`, `"LeagueGameDeck"`, etc. |

---

## Security

- Never commit **`.env.local`**, **`.env`**, or real **`DATABASE_URL`** to GitHub.
- Rotate the DB password in Supabase if it was ever committed or shared.
