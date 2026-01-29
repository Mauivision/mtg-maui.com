# Vercel Postgres Setup

The app uses **PostgreSQL** (not SQLite) so it works on Vercel’s serverless runtime. Use **Vercel Postgres** (powered by Neon) for zero-friction setup.

---

## 1. Provision Vercel Postgres

1. Open your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your **MTG Maui League** project (or the one linked to `mtg-maui.com`).
3. Go to the **Storage** tab.
4. Click **Create Database** → **Postgres**.
5. Create the database (name/location as you prefer). Vercel will:
   - Provision the Postgres instance (Neon).
   - Add **`DATABASE_URL`** (and related env vars) to your project.
   - Make them available at **build** and **runtime**.

No manual `.env` edits in Vercel are needed for `DATABASE_URL`.

---

## 2. Local development

Use the **same** Postgres DB or a separate one (e.g. local Docker, Neon free tier).

1. Copy the **`DATABASE_URL`** from Vercel:
   - Project → **Settings** → **Environment Variables** (or from the Storage → Postgres connect dialog).
2. Create `.env.local` in the project root:
   ```bash
   DATABASE_URL="postgresql://..."
   ```
3. Apply migrations and seed:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

---

## 3. Deploy (Vercel)

- The **build** runs `npx prisma migrate deploy` then `npm run build`.
- Migrations run against the **Vercel Postgres** DB using `DATABASE_URL`.
- After deploy, optionally **seed** the production DB once:
  - Either run `npx prisma db seed` locally with `DATABASE_URL` pointing at the Vercel Postgres instance, or
  - Use **Wizards → Create League Tournament Records** (calls `POST /api/admin/populate`) on the live site.

---

## 4. Verify

- Open the **Leaderboard** and **Wizards** pages on the deployed site.
- You should no longer see **“Unable to open the database file”** or **“No players found”** (once leagues/players/games exist).
- Admin dashboard **DB size** shows **N/A** for Postgres (it only reports size for SQLite).

---

## Alternatives

- **Supabase** (Postgres): Use its connection string as `DATABASE_URL`.
- **PlanetScale** (MySQL): Change Prisma `provider` to `mysql` and adjust schema/migrations.
- **Turso/libSQL**: SQLite-compatible, serverless; requires `libsql` provider and different setup.

For Vercel + Postgres, **Vercel Postgres** is the simplest option.
