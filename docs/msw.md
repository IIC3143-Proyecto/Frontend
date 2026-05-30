# MSW (Mock Service Worker)

The `src/lib/msw/` directory contains the backend simulation layer used during development and E2E testing.

---

## Purpose

MSW intercepts HTTP requests at the network level so the frontend can run without a real backend. It is used to:

- Simulate user data in different states (onboarding complete, no photo, etc.)
- Reproduce API error conditions (401, 422, 409, 500, network failure, slow response)
- Drive E2E tests deterministically without hitting a real server

---

## Setup

MSW is enabled via an environment variable. It must be set in `.env.local`:

```
NEXT_PUBLIC_ENABLE_MSW=true
```

When this flag is `true`, `browser.ts` starts the service worker and attaches scenario control functions to `window` for use in the browser DevTools.

---

## File Structure

```
src/lib/msw/
├── mocks/
│   ├── browser.ts          Worker setup + window helpers
│   ├── scenario.ts         Scenario state and accessors
│   ├── data/
│   │   ├── mock-users.ts       Payloads by MockUserScenario
│   │   └── metro-stations.json Metro station fixtures
│   └── handlers/
│       ├── index.ts        Re-exports combined handlers array
│       ├── users.ts        GET /user, PATCH /user
│       ├── avatar.ts       POST /profile/avatar
│       ├── metros.ts       GET /metro/stations
│       └── sync-user.ts    GET /auth/sync-user
```

### `browser.ts`
Initialises the MSW worker and, when MSW is enabled, exposes four functions on `window`:

```ts
window.__setMockUser(scenario: MockUserScenario)
window.__resetMockUser()
window.__setErrorScenario(scenario: OnboardingErrorScenario)
window.__resetErrorScenario()
```

### `scenario.ts`
Holds the two pieces of mutable state that handlers read at request time:

- `MockUserScenario` — which mock user the `GET /user` endpoint returns
- `OnboardingErrorScenario` — which error condition the avatar/user handlers simulate

### `handlers/users.ts`
Handles `GET /user` and `PATCH /user`. The `GET` handler reads `MockUserScenario`; the `PATCH` handler reads `OnboardingErrorScenario`.

### `handlers/avatar.ts`
Handles `POST /profile/avatar`. Reads `OnboardingErrorScenario` and returns `{ photoUrl }` on success.

### `handlers/metros.ts`
Handles `GET /metro/stations`. Returns a flat list of stations loaded from a local JSON fixture.

### `handlers/sync-user.ts`
Handles `GET /auth/sync-user`. Returns the mock user payload for the active `MockUserScenario` from `data/mock-users.ts`.

---

## Usage in E2E Tests

`playwright.config.ts` sets `serviceWorkers: 'block'`, which prevents the MSW Service Worker from intercepting requests during tests. As a result, **MSW handlers do not run in the Playwright test environment**.

Instead, tests use Playwright's `page.route()` to mock network requests directly. See `e2e/helpers/auth.ts` (`mockSyncUser`) and `e2e/helpers/form-errors.ts` (`mockDefaultHandlers`, `mockAvatarError`, etc.).

The MSW Window API and scenario state are still available during manual development in the browser DevTools.

---

## Scenarios

### User Scenarios (`MockUserScenario`)

Controls what `GET /auth/sync-user` returns (used by `useAuth` to sync the Auth0 user with the VTRNA database). Also drives `GET /user` in `handlers/users.ts`.

| Value | `username` | `photoUrl` | `onboardingCompleted` |
|---|---|---|---|
| `FULL` | `Flo_Full` | set | `true` |
| `NO_PHOTO` | `Flo_Sin_Foto` | `null` | `true` |
| `ONBOARDING_PENDING` | `Flo_Pendiente` | set | `false` |
| `NEW` | `Flo_Nuevo` | `null` | `false` |

Default: `FULL`.

### Error Scenarios (`OnboardingErrorScenario`)

Controls injected failures on `POST /profile/avatar` (`AVATAR_*`) and `PATCH /user` (`PATCH_*`).

| Value | Endpoint | Status | Effect |
|---|---|---|---|
| `NONE` | — | — | Normal flow |
| `AVATAR_401` | `POST /profile/avatar` | 401 | Triggers redirect to `/session-expired` |
| `AVATAR_422` | `POST /profile/avatar` | 422 | Shows `"File must be a WebP image"` on avatar field |
| `AVATAR_500` | `POST /profile/avatar` | 500 | Shows `"Error"` toast with server message |
| `AVATAR_TIMEOUT` | `POST /profile/avatar` | — | Delays indefinitely (hangs upload) |
| `AVATAR_NETWORK` | `POST /profile/avatar` | — | Network-level failure → `"Error de red"` toast |
| `AVATAR_SLOW` | `POST /profile/avatar` | 201 | 2 s delay, then success |
| `PATCH_401` | `PATCH /user` | 401 | Triggers redirect to `/session-expired` |
| `PATCH_409` | `PATCH /user` | 409 | Shows `"Username already taken"` on username field |
| `PATCH_500` | `PATCH /user` | 500 | Shows `"Error"` toast with server message |
| `PATCH_TIMEOUT` | `PATCH /user` | — | Delays indefinitely |
| `PATCH_NETWORK` | `PATCH /user` | — | Network-level failure → `"Error de red"` toast |

Default: `NONE`.

---

## Window API

Available in the browser DevTools console or Playwright `page.evaluate()` when MSW is enabled:

```ts
// Switch mock user
window.__setMockUser('NEW')
window.__resetMockUser()         // resets to 'FULL'

// Inject an error scenario
window.__setErrorScenario('AVATAR_500')
window.__resetErrorScenario()    // resets to 'NONE'
```

---

## Request Flow

```
UI → fetch('/user')
       ↓
MSW intercepts request
       ↓
handler reads scenario.ts state
       ↓
returns mock response
```

---

## Rules

- Do not call `worker.start()` outside of `browser.ts`
- Do not use MSW to drive UI logic — it only simulates the network layer
- Scenario state mutations must go through the functions exported from `scenario.ts`
- MSW only runs when `NEXT_PUBLIC_ENABLE_MSW=true` and the code executes in the browser
