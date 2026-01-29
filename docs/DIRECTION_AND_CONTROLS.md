# MTG Maui League — Direction, Pages & Controls

**Source of truth** for the project’s structure, pages, and how offline vs online run.

---

## 1. New direction

- **Single long-scroll home** (`/`) with four sections: **Hero**, **Leaderboard**, **Character Charts**, **News Feed**.
- **One other page:** **Wizards** (`/wizards`) for editing. Linked as **Edit** in the header.
- **No separate** Leaderboard, Rules, Bulletin, Analytics, Commander, Coming Soon, or Auth pages. Old URLs **redirect** (see below).

---

## 2. Pages and controls

| What | Where | Purpose |
|------|--------|---------|
| **Home** | `/` | Long-scroll: Hero → Leaderboard → Character Charts → News Feed. |
| **Edit** | `/wizards` | Wizards Control: create league, manage players, games, events, news, scoring, etc. |
| **Nav** | Header | Home · Leaderboard · Character Charts · News Feed (anchors) + **Edit** → `/wizards`. |
| **Footer** | Site-wide | Same links + Edit. |

**Redirects** (configured in `next.config.js`):

- `/leaderboard` → `/#leaderboard`
- `/character-sheets` → `/#character-charts`
- `/bulletin` → `/#news-feed`
- `/admin` → `/wizards`
- `/analytics`, `/commander`, `/rules`, `/coming-soon`, `/auth/signin`, `/auth/signup`, `/players/*`, `/tournaments/*` → `/`

---

## 3. Offline vs online

**Same codebase.** Only environment and hosting differ.

| | **Offline (local)** | **Online (Vercel)** |
|--|---------------------|---------------------|
| **Run** | `npm run dev` (e.g. `localhost:3004`) | Deploy from Git → Vercel |
| **Database** | PostgreSQL via `DATABASE_URL` in `.env` | Vercel Postgres, `DATABASE_URL` in project env |
| **Edits** | Wizards → DB; home sections update on refresh/poll | Same |
| **Auth** | `SKIP_ADMIN_AUTH=true` → no login; Wizards open | Same for no-login mode |

**Local setup:** [VERCEL_POSTGRES_SETUP.md](VERCEL_POSTGRES_SETUP.md) (use Postgres locally) + [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md).

**Vercel deploy:** [DEPLOY_VERCEL_CHECKLIST.md](DEPLOY_VERCEL_CHECKLIST.md).

---

## 4. Controls (what you can edit)

- **Wizards** (`/wizards`): leagues, players, games, events, news, drafts, pairings, scoring rules, page content.
- **Home** shows that data: Leaderboard, Character Charts, News Feed. Edits in Wizards persist; home refreshes or polls.

Login is **off** by default (`SKIP_ADMIN_AUTH=true`). To restore it, see [FUTURE_FEATURES.md](FUTURE_FEATURES.md).

---

## 5. Quick reference

- **Direction & controls:** this file.
- **Deploy (Vercel):** [DEPLOY_VERCEL_CHECKLIST.md](DEPLOY_VERCEL_CHECKLIST.md).
- **Database & Prisma:** [DATABASE_AND_PRISMA.md](DATABASE_AND_PRISMA.md) · [VERCEL_POSTGRES_SETUP.md](VERCEL_POSTGRES_SETUP.md).
- **Editable data:** [EDITABLE_DATA_GUIDE.md](EDITABLE_DATA_GUIDE.md).
- **Future (login, join league):** [FUTURE_FEATURES.md](FUTURE_FEATURES.md).
- **Project layout:** [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).
