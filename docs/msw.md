# MSW (Mock Service Worker)

The `src/lib/msw/` directory contains the backend simulation layer used during development and integration testing.

---

## Purpose

MSW intercepts HTTP requests at the service worker level so the frontend can run without a real backend. It is used to:

- Simulate user data in different states (onboarding complete, no photo, etc.)
- Reproduce API error conditions (401, 422, 500, network failure, slow response)
- Drive integration tests deterministically without hitting a real server

---

## Setup

MSW is enabled via an environment variable. Set it in `.env.local`:

```
NEXT_PUBLIC_ENABLE_MSW=true
ENABLE_TEST_ENDPOINTS=true   # required for contract tests (dev only)
```

`MSWProvider` (in the app layout) starts the service worker and blocks rendering until it is active. When MSW is disabled, `MSWProvider` resolves immediately without registering any worker.

---

## File Structure

```
src/lib/msw/
├── msw-provider.tsx        React provider — starts worker, applies pre-navigation scenarios
├── mocks/
│   ├── browser.ts          Worker setup + window.__xxx helpers
│   ├── scenario.ts         Scenario state and accessor functions
│   ├── data/
│   │   ├── mock-users.ts       User payloads by MockUserScenario
│   │   ├── mock-tags.ts        TAGS_MOCK constant (shared with tests)
│   │   ├── posts.ts            mockPost() factory + MOCK_SELLER_POSTS
│   │   ├── tags.ts             tags response fixture
│   │   └── metro-stations.json Metro station fixtures
│   └── handlers/
│       ├── index.ts        Re-exports combined handlers array
│       ├── sync-user.ts    GET /auth/sync-user
│       ├── users.ts        PATCH /api/user/:id_user
│       ├── avatar.ts       POST /api/image/user/:id_user, DELETE /api/image/user/:id_user
│       ├── tags.ts         GET /api/tag
│       ├── metros.ts       GET /metro/stations (local BFF, permanent)
│       └── posts.ts        GET /api/post/*, POST /api/post, PATCH /api/post,
│                           DELETE /api/post/:id, POST /api/image/post/:id,
│                           DELETE /api/image/post/:id
```

---

## Handlers

### `handlers/sync-user.ts`
Handles `GET /auth/sync-user`. Checks `OnboardingErrorScenario` first — returns the corresponding error if a `SYNC_USER_*` scenario is set. Otherwise returns the mock user for the active `MockUserScenario`.

### `handlers/users.ts`
Handles `GET /api/user/:id_user` and `PATCH /api/user/:id_user`.

`GET` resolves which user to return via `resolveProfileUser(id, currentUser)` (in `data/mock-users.ts`): the active scenario user when the id matches the authenticated user, a third-party user from `MOCK_OTHER_USERS` when the id is known, or `404` when the id is unknown. This backs the reusable profile view `/profile/[id]`, which renders edit controls only when viewing your own profile and a "usuario no encontrado" state on 404.

`PATCH` reads `OnboardingErrorScenario` for `PATCH_*` errors.

### `handlers/avatar.ts`
Handles `POST /api/image/user/:id_user` (returns `{ message }` on success, matching the real backend) and `DELETE /api/image/user/:id_user`. Reads `OnboardingErrorScenario` for `AVATAR_*` errors.

### `handlers/tags.ts`
Handles `GET /api/tag`. Returns `TAGS_MOCK` from `data/mock-tags.ts`.

### `handlers/metros.ts`
Handles `GET /metro/stations`. Returns a flat list from the local JSON fixture. This is a permanent local BFF — it will never move to the real backend.

### `handlers/posts.ts`
Handles all post and image endpoints. Specific paths (`/saved/`, `/user/`, `/search`) must appear before the catch-all `GET /api/post/:id_post`. Reads `OnboardingErrorScenario` for `UPLOAD_*`, `CREATE_*`, and `PATCH_TAGS_*` errors. Pending backend endpoints (`#22`, `#47`, `#48`) return 404 as stubs.

---

## Scenarios

### User Scenarios (`MockUserScenario`)

Controls what `GET /auth/sync-user` returns.

| Value | `username` | `photoUrl` | `onboardingCompleted` |
|---|---|---|---|
| `FULL` | `Flo_Full` | set | `true` |
| `NO_PHOTO` | `Flo_Sin_Foto` | `null` | `true` |
| `ONBOARDING_PENDING` | `Flo_Pendiente` | set | `false` |
| `NEW` | `Flo_Nuevo` | `null` | `false` |

Default: `FULL`.

### Third-party users (`MOCK_OTHER_USERS`)

Returned by `GET /api/user/:id` when the requested id is **not** the authenticated user — used to test the read-only third-party profile at `/profile/[id]`. Indexed by id in `data/mock-users.ts`.

| id | `username` | Shape |
|---|---|---|
| `auth0\|other_456` | `Vale_Vecina` | full: photo, bio, zona, contacto |
| `auth0\|other_789` | `Tomi_Tercero` | minimal: no bio, contacto, or zona (empty states) |

Any other id returns `404`, which the profile page renders as a "usuario no encontrado" state.

### Error Scenarios (`OnboardingErrorScenario`)

| Value | Endpoint | Status | Effect |
|---|---|---|---|
| `NONE` | — | — | Normal flow |
| `AVATAR_401` | `POST /api/image/user/:id` | 401 | Redirect to `/session-expired` |
| `AVATAR_422` | `POST /api/image/user/:id` | 422 | Shows `"File must be a WebP image"` |
| `AVATAR_500` | `POST /api/image/user/:id` | 500 | Error toast |
| `AVATAR_TIMEOUT` | `POST /api/image/user/:id` | — | Hangs indefinitely |
| `AVATAR_NETWORK` | `POST /api/image/user/:id` | — | Network failure → `"Error de red"` |
| `AVATAR_SLOW` | `POST /api/image/user/:id` | 201 | 2 s delay, then success |
| `PATCH_401` | `PATCH /api/user/:id` | 401 | Redirect to `/session-expired` |
| `PATCH_409` | `PATCH /api/user/:id` | 409 | Shows `"Username already taken"` |
| `PATCH_500` | `PATCH /api/user/:id` | 500 | Error toast |
| `PATCH_TIMEOUT` | `PATCH /api/user/:id` | — | Hangs indefinitely |
| `PATCH_NETWORK` | `PATCH /api/user/:id` | — | Network failure |
| `UPLOAD_401` | `POST /api/image/post/:id` | 401 | Redirect to `/session-expired` |
| `UPLOAD_500` | `POST /api/image/post/:id` | 500 | Error toast |
| `UPLOAD_NETWORK` | `POST /api/image/post/:id` | — | Network failure |
| `UPLOAD_SLOW` | `POST /api/image/post/:id` | 201 | 2 s delay, then success |
| `CREATE_401` | `POST /api/post` | 401 | Redirect to `/session-expired` |
| `CREATE_500` | `POST /api/post` | 500 | Error toast |
| `CREATE_NETWORK` | `POST /api/post` | — | Network failure |
| `PATCH_TAGS_401` | `PATCH /api/post/:id/tags` | 401 | Redirect to `/session-expired` |
| `PATCH_TAGS_500` | `PATCH /api/post/:id/tags` | 500 | Error toast |
| `PATCH_TAGS_NETWORK` | `PATCH /api/post/:id/tags` | — | Network failure |
| `SYNC_USER_401` | `GET /auth/sync-user` | 401 | Redirect to `/session-expired` |
| `SYNC_USER_403` | `GET /auth/sync-user` | 403 | Error UI, stays on page |
| `SYNC_USER_500` | `GET /auth/sync-user` | 500 | Error UI with retry button |
| `SYNC_USER_503` | `GET /auth/sync-user` | 503 | Error UI with retry button |

Default: `NONE`.

---

## Usage in Tests

MSW behavior differs by Playwright project:

| Project | `serviceWorkers` | MSW active | Mocking mechanism |
|---|---|---|---|
| `e2e` | `block` | No | Real Auth0; no mocking |
| `integration` | `allow` | Yes | `page.addInitScript()` + `window.__setErrorScenario()` |
| `contract` | `allow` | No | Direct HTTP against real backend |

### Pre-navigation scenarios (`page.addInitScript`)

When a scenario must be active from the very first request — before the page loads — `gotoAuthenticated` uses `page.addInitScript()` to set a window variable. `MSWProvider` reads and applies it after `worker.start()`.

```ts
// Navigate as a NEW user (onboardingCompleted: false)
await gotoAuthenticated(page, '/onboarding', 'NEW');
```

For sync-user error scenarios:
```ts
await setInitialSyncUserError(page, 503);
await page.goto('/profile');
// → MSW returns 503 → AuthWrapper shows retry button
```

### Post-navigation error injection (`page.evaluate`)

For errors triggered by user actions (upload, submit), set the scenario after navigating but before the action:

```ts
await gotoAuthenticated(page, '/onboarding', 'NEW');
await setAvatarError(page, 500);  // → window.__setErrorScenario('AVATAR_500')
await uploadAvatar(page);
await submitForm(page);
// → MSW returns 500 → error toast shown
```

### Auto-reset

`tests/fixtures.ts` extends Playwright's `page` fixture to call `__resetErrorScenario()` and `__resetMockUser()` after each test automatically.

---

## Window API

Available in browser DevTools or `page.evaluate()` when MSW is enabled:

```ts
window.__setMockUser('NEW')
window.__resetMockUser()            // resets to 'FULL'

window.__setErrorScenario('AVATAR_500')
window.__resetErrorScenario()       // resets to 'NONE'
```

---

## Rules

- Do not call `worker.start()` outside of `browser.ts`
- Do not use MSW to drive UI logic — it only simulates the network layer
- Scenario state mutations must go through the functions exported from `scenario.ts`
- MSW only runs when `NEXT_PUBLIC_ENABLE_MSW=true` and the code executes in the browser
- The `e2e` Playwright project runs with `serviceWorkers: 'block'` — real Auth0 flows are not affected by MSW
