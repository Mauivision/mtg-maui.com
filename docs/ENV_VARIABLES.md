# Environment Variables

Copy these into a `.env` file in the project root and fill in values.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string. Omit or use static mode to use `src/data/league-data.json`. |
| `USE_STATIC_LEAGUE_DATA` | Set to `true` to use static JSON instead of DB. |
| `SKIP_ADMIN_AUTH` | `true` = admin APIs allow access without login. |
| `NEXT_PUBLIC_WIZARDS_LOGIN` | `true` = show Wizards login gate at `/wizards`. |
| `ADMIN_SIMPLE_USERNAME` | Simple-admin username (default `Admin`). |
| `ADMIN_SIMPLE_PASSWORD` | Simple-admin password (default `12345`). |
| `ADMIN_SIMPLE_SECRET` | HMAC secret for admin cookie (default dev secret). |
| `ADMIN_USER_IDS` | Optional comma-separated user IDs for RBAC. |
| `NEXTAUTH_URL` | Base URL (e.g. `http://localhost:3003`). |
| `NEXTAUTH_SECRET` | NextAuth secret for sessions. |
| `RESEND_API_KEY` | Optional; for password-reset emails. |
| `RESEND_FROM_EMAIL` | From address for Resend (e.g. `noreply@mtg-maui.com`). |

See `docs/FUTURE_FEATURES.md` for auth and Join League behavior.
