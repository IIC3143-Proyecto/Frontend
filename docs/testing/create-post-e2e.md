# E2E Testing - Create Post

This document details the E2E test suite for the multi-step post creation modal.

---

## Test Architecture

### Files
```
e2e/
├── create-post.spec.ts         # Create Post modal tests
├── helpers/
│   ├── auth.ts                 # Auth helpers: gotoAuthenticated, mockSyncUser
│   └── create-post.ts          # page.route() mocks + UI interaction helpers
└── fixtures/
    └── avatar.webp             # Test image used for photo uploads
```

---

## Commands

```bash
# Run all tests (headless)
npm run e2e -- e2e/create-post.spec.ts

# Interactive UI mode — step through tests, inspect locators, time-travel
npm run e2e:ui

# Run only tests whose title matches a pattern
npm run e2e -- -g "publish successfully"
npm run e2e -- -g "401"

# Run with the browser visible
npm run e2e -- --headed e2e/create-post.spec.ts

# Debug mode — pauses at each step, opens Playwright Inspector
npm run e2e -- --debug e2e/create-post.spec.ts

# Open the last HTML report (after a run has completed)
npx playwright show-report
```

---

## Configuration (`playwright.config.ts`)

| Setting | Value |
|---|---|
| `testDir` | `./e2e` |
| `baseURL` | `http://localhost:3000` |
| Browser | Chromium only |
| `fullyParallel` | `false` — tests run sequentially |
| `serviceWorkers` | `'block'` — MSW does not run in tests; all mocking uses `page.route()` |
| `storageState` | `e2e/.auth/user.json` — loaded from `auth.setup.ts` |
| `webServer` | Auto-starts `NEXT_PUBLIC_ENABLE_MSW=true npm run dev`; reuses an existing server if port 3000 is already in use |

> **Important:** Because `serviceWorkers: 'block'` prevents MSW from intercepting requests, all network mocking in these tests uses Playwright's `page.route()` via `e2e/helpers/create-post.ts`. Always call `mockCreatePostHandlers(page)` before `gotoAuthenticated` in `beforeEach` to avoid missing the initial `/tags` fetch.

---

## Prerequisites

```
NEXT_PUBLIC_ENABLE_MSW=true   # .env.local
AUTH0_TEST_EMAIL=...
AUTH0_TEST_PASSWORD=...
```

---

## Fixtures

| File | Purpose |
|---|---|
| `e2e/fixtures/avatar.webp` | Pre-converted WebP image used as a stand-in for clothing photos |

---

## Test Helpers (`e2e/helpers/create-post.ts`)

### Route mocks

| Helper | Description |
|---|---|
| `mockCreatePostHandlers(page)` | Registers success-path routes for `GET /tags` (200), `POST /upload` (201), and `POST /post` (201). Call before navigating in `beforeEach`. |
| `mockUploadError(page, status)` | Overrides `POST /upload` to return 401 or 500. |
| `mockUploadNetwork(page)` | Aborts the upload request (network failure). |
| `mockUploadSlow(page)` | Delays the upload response by 2 s then returns success. |
| `mockPostError(page, status)` | Overrides `POST /post` to return 401 or 500. |
| `mockPostNetwork(page)` | Aborts the post request (network failure). |

### UI helpers

| Helper | Description |
|---|---|
| `openModal(page)` | Clicks "Nueva Publicación" and asserts the dialog is visible. |
| `clickNext(page)` | Clicks "Siguiente". |
| `clickBack(page)` | Clicks "Atrás". |
| `clickPublish(page)` | Clicks "Publicar". |
| `fillStep1(page, opts)` | Fills title, price, and optionally description on the first step. |
| `uploadPhotos(page, count)` | Uploads `count` photos (default 3) via the sequential-unlock file input. |
| `selectRequiredTags(page)` | Selects one Talla (M), one Condición (Nuevo), and one Tipo de prenda (Camiseta). |
| `selectMultipleTags(page)` | Selects multiple Talla (M, L), one Condición, and multiple Tipo de prenda (Camiseta, Pantalón). |

---

## Test Coverage (`e2e/create-post.spec.ts`)

`beforeEach` registers mock handlers via `mockCreatePostHandlers`, navigates to `/test` as a `FULL` user, and opens the modal before each test.

### Desktop tests (1280px viewport)

| # | Name | Mock override | Key assertion |
|---|---|---|---|
| 1 | Publish with minimum required data | — | Toast `"Publicación creada"` visible; dialog closes |
| 2 | Validation: empty title | — | Error `"Título requerido"` visible |
| 3 | Validation: empty price | — | Error `"El precio debe ser mayor a 0"` visible |
| 4 | Validation: fewer than 3 photos | — | Error `"Debes subir al menos 3 fotos"` visible |
| 5 | Validation: required tags | — | Error messages for Talla, Condición, Tipo de prenda visible |
| 6 | Multiple sizes and garment types | — | Multiple selections do not trigger validation errors |
| 7 | Upload 401 → session-expired | `mockUploadError(401)` | Page redirects to `/session-expired` |
| 8 | Upload 500 → error toast | `mockUploadError(500)` | Toast `"Error al subir fotos"` visible |
| 9 | Upload network failure | `mockUploadNetwork()` | Toast `"Error de red"` visible |
| 10 | Upload slow → loading state | `mockUploadSlow()` | Button shows `"Subiendo…"` during upload |
| 11 | POST /post 401 → session-expired | `mockPostError(401)` | Page redirects to `/session-expired` |
| 12 | POST /post 500 → error toast | `mockPostError(500)` | Toast `"Error"` visible |
| 13 | POST /post network failure | `mockPostNetwork()` | Toast `"Error de red"` visible |
| 14 | Cancel resets form | — | Dialog closes; reopened form is empty |
| 15 | Back navigation | — | Step decrements correctly |

### Mobile tests (390px viewport)

| # | Name | Mock override | Key assertion |
|---|---|---|---|
| 16 | Publish across all 5 steps | — | Toast `"Publicación creada"` visible; dialog closes |
| ... | *(additional mobile coverage)* | | |

---

## Writing New Tests

1. **Call `mockCreatePostHandlers(page)` before `gotoAuthenticated`** in `beforeEach`. The `/tags` fetch fires immediately on mount — registering the route after navigation misses it.
2. **Use `gotoAuthenticated(page, '/test', 'FULL')`** instead of navigating directly. This mocks `sync-user` and waits for the auth wrapper to resolve.
3. **Override with error mocks in the test body.** `page.route()` uses LIFO order — the last registered handler takes precedence.
4. **Call `openModal(page)` in `beforeEach`**, not at the start of each test, to keep tests focused on the step they're verifying.
5. **Use `waitForToast`** from `e2e/helpers` for Sonner notifications.
6. **Avoid fixed `sleep`** — use `await expect(...).toBeVisible({ timeout })` instead.

---

## Debugging

### Run a single test
```bash
npx playwright test e2e/create-post.spec.ts -g "publish successfully"
```

### Debug mode
```bash
npx playwright test --debug e2e/create-post.spec.ts
```

### View traces
```bash
# Traces are saved on first retry (playwright.config.ts: trace: 'on-first-retry')
npm run e2e:report
```

---

## References

- [Playwright Documentation](https://playwright.dev)
- [MSW Documentation](../msw.md)
- [Onboarding E2E](./onboarding-e2e.md)
