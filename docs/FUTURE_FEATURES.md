# Future Features (Removed for Now, Restore Later)

These features are **disabled** in the current build but kept in code or APIs for later use.

---

## 1. Login (Wizards / Admin)

**Current state:** Login is **off**. Wizards Control (`/wizards`) is open to all; no Sign In form.

**How it was removed:**
- `NEXT_PUBLIC_WIZARDS_LOGIN` is not set (or `≠ 'true'`). When unset, Wizards skips the login gate.
- **Set `SKIP_ADMIN_AUTH=true`** in Vercel (and locally if you run without login) so admin APIs allow access without the simple-admin cookie.

**To restore:**
1. Set **`NEXT_PUBLIC_WIZARDS_LOGIN=true`** (client).
2. Set **`SKIP_ADMIN_AUTH`** to empty or remove it (server). Admin routes will then require the simple-admin cookie.
3. Log in at `/wizards` with **Admin** / **12345** (or `ADMIN_SIMPLE_USERNAME` / `ADMIN_SIMPLE_PASSWORD`).
4. Re-add **Sign In** in the header: `ModernHeader` used to link to `/auth/signin`; that block is commented as removed.

**Relevant code:**
- `src/app/wizards/page.tsx`: `loginEnabled`, login form, check-admin fetch, Log out button.
- `src/lib/auth-helpers.ts`: `requireAdminOrSimple` and `SKIP_ADMIN_AUTH` check.
- `src/app/api/auth/simple-admin-login`, `check-admin`, `simple-admin-logout`.

---

## 2. Join League

**Current state:** **Join League** buttons/links are **removed** from the main UI.

**What was removed:**
- **Header:** “Sign In” and “Join League” buttons in `ModernHeader`.
- **Coming Soon:** “Join League” CTA (kept “View Leaderboard” only).
- **GoblinAssistant:** “Join a League” quick action in the tournament explainer.

**Still available (for later):**
- **API:** `POST /api/leagues/[leagueId]/join` — join flow backend is intact.
- **Routes:** `/auth/signin`, `/auth/signup` — NextAuth pages still exist.

**To restore:**
1. In `ModernHeader`, restore the “Auth Actions” block with Sign In and Join League (e.g. link Join League to `/leaderboard` or a join flow).
2. On **Coming Soon**, add back a “Join League” button and link it to the join flow or `/leaderboard`.
3. In **GoblinAssistant** `explainTournaments`, add back the “Join a League” action (e.g. to `/auth/signup` or join page).

---

## 3. Environment Variables

| Variable | Purpose |
|----------|---------|
| `SKIP_ADMIN_AUTH` | `true` = admin APIs allow access without login. Omit or `false` to enforce auth. |
| `NEXT_PUBLIC_WIZARDS_LOGIN` | `true` = show Wizards login gate and Log out. Omit or `false` = no login. |
| `ADMIN_SIMPLE_USERNAME` | Simple-admin username (default `Admin`). |
| `ADMIN_SIMPLE_PASSWORD` | Simple-admin password (default `12345`). |

---

## 4. Verifying the Database (Vercel Postgres)

Use the **public** health check (no auth):

```http
GET /api/health
```

**Success:** `{ "ok": true, "database": "connected", "responseTimeMs": ... }`  
**Failure:** `503` and `{ "ok": false, "database": "error", "error": "..." }`

This confirms the app can reach Vercel Postgres (or whatever `DATABASE_URL` points to).
