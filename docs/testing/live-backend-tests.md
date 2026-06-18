# Live Backend Tests

Live backend tests verify the full user lifecycle against a real running backend and database. MSW is disabled (`NEXT_PUBLIC_ENABLE_MSW=false`) so all API calls reach the actual backend.

---

## Running

```bash
npm run test:live
```

Runs in headed mode (`--headed`) so you can watch the browser. Uses `playwright.config.live.ts`.

---

## Prerequisites

### 1. Backend running with a clean DB

```bash
# From the infra repo
yarn infra:reset   # wipes the DB
yarn infra:up      # starts the API with migrations and seeds

# Or manually with Docker
docker compose -f infra/docker/docker-compose.dev.yml exec db \
  psql -U IsabellaKPM -d iic3143_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker compose -f infra/docker/docker-compose.dev.yml exec api yarn db:setup
```

### 2. Environment variables (`.env.local`)

```env
# Existing Auth0 user — reused across runs
AUTH0_TEST_EMAIL=test2@gmail.com
AUTH0_TEST_PASSWORD=Test2@password

# New Auth0 user for the sign-up test — must be deleted from Auth0 between runs
AUTH0_TEST_SIGNUP_EMAIL=test3@gmail.com
AUTH0_TEST_SIGNUP_PASSWORD=Test3@password
```

---

## Tests

### `Live backend: flujo completo de usuario desde DB vacía`

End-to-end lifecycle of an existing Auth0 user starting from an empty database.

- **Step 1 — New user sync:** navigates to `/profile`; the BFF creates the user record in DB and redirects to `/onboarding` (status = "En proceso de registro")
- **Step 2 — Server-side redirect (no onboarding):** navigates to `/notifications`; the proxy returns a 3xx redirect to `/onboarding` before the page renders (no client-side flicker)
- **Step 3 — Complete onboarding:** fills the multi-step form (avatar upload, username, bio, contact info, metro stations) and submits; user status becomes "Activo"
- **Step 4 — Active user accesses /feed:** navigates to `/feed`; no redirect loop, no connection error dialog
- **Step 5 — Server-side redirect (onboarding done):** navigates to `/onboarding`; the proxy returns a 3xx redirect to `/feed` before the page renders (no client-side flicker)
- **Step 6 — Logout + re-login:** logs out (clears Auth0 session cookie, localStorage, sessionStorage), logs back in, navigates to `/feed`; verifies the app stays on `/feed` without redirecting to `/onboarding` — confirms `status: 'Activo'` was persisted in the DB and the BFF returns it correctly on a fresh session

### `Sign-up: nuevo usuario en Auth0 → redirige a /onboarding`

Full sign-up flow for a brand-new user who does not exist in Auth0 yet. **Skipped automatically** if `AUTH0_TEST_SIGNUP_EMAIL` / `AUTH0_TEST_SIGNUP_PASSWORD` are not set.

- Navigates to `/signup`; the auth0 SDK redirects to the Auth0 sign-up form
- Fills email (`[name="email"]`) and password (`[name="password"]`) on the Auth0 Universal Login sign-up screen, then submits with `[name="action"]` (the sign-up form uses `name="email"`, unlike the login form which uses `name="username"`)
- After Auth0 callback, the BFF calls `POST /api/auth/sync-user` (no `dbUserId` in session yet) and creates the user record with status "En proceso de registro"
- App redirects to `/onboarding` — verifies no "Error al conectar con el servidor" dialog is shown

---

## Sign-up test lifecycle

This test creates a real Auth0 user on every run. You must clean it up manually:

1. Run `npm run test:live`
2. Open [Auth0 Dashboard → User Management → Users](https://manage.auth0.com/)
3. Search for `AUTH0_TEST_SIGNUP_EMAIL` and delete the user
4. Repeat from step 1 on the next run
