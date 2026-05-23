# E2E Testing - Onboarding Form

This document details the E2E test suite for the onboarding profile completion flow.

---

## Test Architecture

### Files
```
e2e/
├── onboarding.spec.ts          # Onboarding form tests
├── helpers.ts                  # Shared test utilities (uploadAvatar, fillUsername, etc.)
├── helpers/
│   ├── auth.ts                 # Auth helpers: gotoAuthenticated, mockSyncUser, waiters
│   └── form-errors.ts          # page.route() mocks for avatar and PATCH /user
└── fixtures/
    └── avatar.webp             # Test image for avatar upload
```

### Test Results (Current)
```
Tests: 12 tests covering happy path and error cases
Runtime: ~20-30 seconds
```

---

## Commands

```bash
# Run all tests (headless)
npm run e2e

# Interactive UI mode — step through tests, inspect locators, time-travel
npm run e2e:ui

# Run only tests whose title matches a pattern
npm run e2e -- -g "happy path"
npm run e2e -- -g "401"

# Run a specific file
npm run e2e -- e2e/onboarding.spec.ts

# Run with the browser visible
npm run e2e -- --headed

# Debug mode — pauses at each step, opens Playwright Inspector
npm run e2e -- --debug

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
| `serviceWorkers` | `'block'` — prevents Auth0 SW from interfering; MSW does not run in tests |
| `storageState` | `e2e/.auth/user.json` — loaded from `auth.setup.ts` |
| `webServer` | Auto-starts `NEXT_PUBLIC_ENABLE_MSW=true npm run dev`; reuses an existing server if already running |
| `reporter` | HTML — report written to `playwright-report/` |
| `trace` | `on-first-retry` |
| CI (`retries`) | 2 retries on failure |
| CI (`forbidOnly`) | `true` — `test.only` causes the run to fail |

---

## Prerequisites

MSW must be enabled. Ensure `.env.local` contains:

```
NEXT_PUBLIC_ENABLE_MSW=true
```

> **Note:** `playwright.config.ts` sets `serviceWorkers: 'block'`, which prevents the MSW Service Worker from intercepting requests during tests. All mocking in `onboarding.spec.ts` uses Playwright's `page.route()` instead of `window.__setErrorScenario`. The MSW window helpers are still available in the browser DevTools for manual development.

---

## Fixtures

| File | Purpose |
|---|---|
| `e2e/fixtures/avatar.webp` | Pre-converted WebP image used for avatar upload tests |

---

## Test Helpers

### `e2e/helpers.ts` — Form interaction utilities

| Helper | Description |
|---|---|
| `uploadAvatar(page)` | Sets the file input to `fixtures/avatar.webp` and waits for the blob preview |
| `fillUsername(page, value)` | Fills the username placeholder input |
| `fillBio(page, value)` | Fills the bio textarea |
| `submitForm(page)` | Clicks the `"Guardar perfil"` button |
| `waitForToast(page, text, timeout?)` | Asserts a `[data-sonner-toast]` element containing `text` becomes visible |
| `expectError(page, message)` | Asserts a validation or server error message is visible on the page |

### `e2e/helpers/auth.ts` — Auth utilities

| Helper | Description |
|---|---|
| `gotoAuthenticated(page, path, scenario?)` | Mocks `sync-user`, navigates, and waits for MSW + auth sync to complete |
| `mockSyncUser(page, scenario)` | Registers a `page.route()` for `GET /auth/sync-user` returning the given scenario |
| `mockSyncUserError(page, status)` | Registers a `page.route()` that returns an error on `sync-user` |
| `waitForMSW(page)` | Waits until the MSW loading spinner disappears |
| `waitForAuthSync(page)` | Waits until the "Sincronizando con VTRNA" spinner disappears |

### `e2e/helpers/form-errors.ts` — Mock error conditions via `page.route()`

| Helper | Description |
|---|---|
| `mockDefaultHandlers(page)` | Registers success-path routes for `POST /profile/avatar` (201) and `PATCH /user` (200). Call in `beforeEach` before any error overrides. |
| `mockAvatarSuccess(page)` | Re-registers the avatar success handler on top of the stack. Use after an error mock to restore success behavior. |
| `mockAvatarError(page, status)` | Fulfills `POST /profile/avatar` with 401, 422, or 500 |
| `mockAvatarNetwork(page)` | Aborts the avatar request (network failure) |
| `mockAvatarSlow(page)` | Delays avatar response by 2 s then returns success |
| `mockPatchError(page, status)` | Fulfills `PATCH /user` with 409 or 500 |

---

## Test Coverage (`e2e/onboarding.spec.ts`)

`beforeEach` registers default success handlers via `mockDefaultHandlers`, navigates to `/onboarding` as a `NEW` user (onboarding incomplete), and asserts the heading is visible before each test.

### Test Scenarios

| # | Name | Mock | Key Assertion |
|---|---|---|---|
| 1 | Happy path | default (success) | Toast `"Perfil actualizado!"` visible |
| 2 | Empty form validation | — (client) | `"Avatar es requerido"` and `"Username es requerido"` visible after submit |
| 3 | Avatar required | — (client) | `"Avatar es requerido"` visible; no username error |
| 4 | API 401 | `mockAvatarError(401)` | Page redirects to `/session-expired` |
| 5 | API 422 | `mockAvatarError(422)` | `"File must be a WebP image"` visible |
| 6 | API 409 | `mockPatchError(409)` | `"Username already taken"` on username field |
| 7 | API 500 | `mockAvatarError(500)` | Toast `"Internal server error"` |
| 8 | Network error | `mockAvatarNetwork()` | Toast `"Error de red"` visible |
| 9 | Slow response | `mockAvatarSlow()` | Button shows `"Guardando..."`, then toast `"Perfil actualizado!"` |
| 10 | Retry after error | `mockAvatarError(500)` → `mockAvatarSuccess()` | Fails first, succeeds on second submit |
| 11 | Field persistence | `mockAvatarError(500)` | Username and bio retain typed values after error |
| 12 | Avatar preview | — | `<img alt="Vista previa del avatar">` has a `blob:` src after file selection |

---

## Writing New Tests

1. **Call `mockDefaultHandlers(page)` before `gotoAuthenticated`** in `beforeEach` — registers success-path `page.route()` handlers so the form can submit successfully by default.
2. **Use `gotoAuthenticated(page, '/onboarding', 'NEW')`** instead of navigating directly — mocks `sync-user` and waits for `AuthWrapper` to clear before asserting page content.
3. **Override with error mocks in the test body**: call `mockAvatarError`, `mockPatchError`, etc. after `beforeEach`. Because `page.route()` uses LIFO order, the last registered handler takes precedence over the default.
4. **Use `mockAvatarSuccess(page)` to restore success behavior** within a test after an error mock — do not call `page.unroute()`, which would also remove the default handler from `beforeEach`.
5. **Use `waitForToast`** for Sonner notifications — select by `[data-sonner-toast]` and filter with `hasText`.
6. **Avoid fixed `sleep`** — use `await expect(...).toBeVisible()` with a timeout instead.
7. **Add fixtures** for any binary assets to `e2e/fixtures/` and reference them with `path.join(__dirname, 'fixtures/filename')`.


---

## Debugging

### Run Single Test
```bash
npx playwright test e2e/onboarding.spec.ts -g "happy path"
```

### Debug Mode
```bash
npx playwright test --debug
# Browser opens, can inspect, step through code
```

### View Traces
```bash
# Traces saved on failure (playwright.config.ts: trace: 'on-first-retry')
npm run e2e:report
# Click failed test → see trace with network/DOM/console
```

---

## References

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [MSW Documentation](../msw.md)
