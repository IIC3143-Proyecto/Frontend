# E2E Testing - Onboarding Form

This document details the E2E test suite for the onboarding profile completion flow.

---

## Test Architecture

### Files
```
e2e/
├── onboarding.spec.ts          # Onboarding form tests
├── helpers.ts                  # Shared test utilities
└── fixtures/
    └── avatar.webp             # Test image for avatar upload
```

### Test Results (Current)
```
Tests: Multiple scenarios covering happy path and error cases
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
| `webServer` | Auto-starts `npm run dev`; reuses an existing server if already running |
| `reporter` | HTML — report written to `playwright-report/` |
| `trace` | `on-first-retry` |
| CI (`retries`) | 1 retry on failure |
| CI (`forbidOnly`) | `true` — `test.only` causes the run to fail |

---

## Prerequisites

MSW must be enabled. Ensure `.env.local` contains:

```
NEXT_PUBLIC_ENABLE_MSW=true
```

The tests control mock scenarios through `window.__setErrorScenario` / `window.__resetErrorScenario`, which are only available when MSW is active. See [`docs/msw.md`](../msw.md) for the full scenario reference.

---

## Fixtures

| File | Purpose |
|---|---|
| `e2e/fixtures/avatar.webp` | Pre-converted WebP image used for avatar upload tests |

---

## Test Helpers (`e2e/helpers.ts`)

| Helper | Description |
|---|---|
| `waitForMSW(page)` | Polls until `window.__resetErrorScenario` is available — confirms MSW has initialised |
| `setScenario(page, scenario)` | Calls `window.__setErrorScenario(scenario)` to inject an error condition |
| `uploadAvatar(page)` | Sets the file input to `fixtures/avatar.webp` and waits for the WebP conversion to finish |
| `submitForm(page)` | Clicks the `"Guardar perfil"` button |
| `waitForToast(page, text)` | Asserts a `[data-sonner-toast]` element containing `text` becomes visible |

---

## Test Coverage (`e2e/onboarding.spec.ts`)

All tests navigate to `/onboarding` and reset the error scenario in `beforeEach`.

### Test Scenarios

| # | Name | Scenario | Key Assertion |
|---|---|---|---|
| 1 | Happy path | `NONE` | Toast `"Perfil actualizado!"` visible |
| 2 | Short username | — (client) | `"Username debe tener al menos 3 caracteres"` visible after blur |
| 3 | Avatar required | — (client) | `"Avatar es requerido"` visible after submit without file |
| 4 | API 401 | `AVATAR_401` | Page redirects to `/session-expired` |
| 5 | API 422 | `AVATAR_422` | `"File must be a WebP image"` on avatar field, heading still visible |
| 6 | API 409 | `PATCH_409` | `"Username already taken"` on username field, no toast |
| 7 | API 500 | `AVATAR_500` | Toast `"Internal server error"`, submit button re-enabled |
| 8 | Network error | `AVATAR_NETWORK` | Toast `"Error de red"` visible |
| 9 | Slow response | `AVATAR_SLOW` | Button shows `"Guardando..."`, then toast `"Perfil actualizado!"` |
| 10 | Retry after error | `AVATAR_500` → `NONE` | Fails first, succeeds on second submit |
| 11 | Field persistence | — | Username and bio retain typed values |
| 12 | Avatar preview | — | `<img>` inside the avatar role element becomes visible after selection |

---

## Writing New Tests

1. **Always call `waitForMSW(page)` in `beforeEach`** before interacting with the page — MSW starts asynchronously and the window helpers may not exist yet.
2. **Reset the scenario** with `page.evaluate(() => window.__resetErrorScenario())` at the start of each test (the shared `beforeEach` already does this).
3. **Use `waitForToast`** for Sonner notifications — select by `[data-sonner-toast]` and filter with `hasText` rather than matching the exact toast structure, which can change between Sonner versions.
4. **Avoid fixed `sleep`** — use `await expect(...).toBeVisible()` with a timeout instead.
5. **Add fixtures** for any binary assets (images, PDFs) to `e2e/fixtures/` and reference them with `path.join(__dirname, 'fixtures/filename')`.

---

## Debugging

### Run Single Test
```bash
npx playwright test e2e/onboarding.spec.ts -g "Happy path"
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
