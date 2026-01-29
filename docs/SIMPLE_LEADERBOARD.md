# Simple: Make a Leaderboard for 16 Players’ Scores

Three steps. No SQL unless your DB is broken.

---

## 1. Fresh database (if needed)

**If the app already runs and you just want 16 players + leaderboard:** skip to step 2.

**If the DB is broken or empty:**

- **Local:** In the project folder run: `npm run db:reset`
- **Remote (Vercel/Neon):** Run in SQL: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` then in the project: `npx prisma migrate deploy` and `npx prisma db seed`

---

## 2. Create 16 players and their game scores

1. Start the app: `npm run dev`
2. Open **http://localhost:3004/wizards**
3. Click **“Create League Tournament Records”**

That creates:

- 1 league  
- 16 players (DragonMaster, SpellSlinger, CardShark, etc.)  
- Sample games with **place** and **points** for each player  

---

## 3. See the leaderboard (top player at top)

1. Open **http://localhost:3004** (home)
2. Scroll to **Leaderboard**

The list is **sorted by total points**, highest first. Top player at top, then down.

---

## Summary

| Step | Do this |
|------|--------|
| 1 | (Optional) Reset DB: `npm run db:reset` or run the SQL + migrate above |
| 2 | `/wizards` → **Create League Tournament Records** |
| 3 | Home → **Leaderboard** (16 players, scores, top down) |

One button gives you the 16-player leaderboard with scores.
