# E2E Tests

E2E tests verify authentication flows and route protection against the real Auth0 tenant. They use real browser sessions and do not mock any network requests. MSW is blocked (`serviceWorkers: 'block'`) for this project.

---

## Running

```bash
npm run test:e2e
```

Requires in `.env.local`:
```env
AUTH0_TEST_EMAIL=user@example.com
AUTH0_TEST_PASSWORD=yourpassword
```

Without credentials, the auth setup skips and all E2E tests are skipped. Integration tests are not affected.

---

## Auth Setup (`tests/e2e/auth.setup.ts`)

Runs once before all E2E tests. Authenticates against the real Auth0 tenant and saves the session to `tests/e2e/.auth/user.json`. All spec files in the `e2e` project reuse this session via `storageState`.

During setup, `page.addInitScript` intercepts the MSW init scenario to return a mock `FULL` user — this prevents the onboarding redirect during setup. The real Auth0 `appSession` cookie is still obtained and saved.

---

## Test Files

| File | Tests | What it covers |
|------|-------|----------------|
| `auth.spec.ts` | 4 | `/login` → Auth0, `/signup` with `screen_hint=signup`, `/logout` clears session and redirects to `/`, post-logout private route redirects with `returnTo` |
| `routes.spec.ts` | 10 | Public routes (`/`, `/about-us`, `/faq`) accessible without auth; private routes (`/feed`, `/notifications`, `/posts`, `/profile`, `/publications`, `/shopping-history`, `/onboarding`) redirect to `/login?returnTo=...` |

The redirect of a completed user away from `/onboarding` (proxy redirect) is covered by the live backend test, which has the full session state.

---

## Helpers

### `tests/e2e/helpers/auth.ts`

```ts
waitForMSW(page)
// Wait for MSWProvider's loading screen ("Cargando") to disappear.

gotoAuthenticated(page, path, scenario?)
// Navigate with a pre-set MSW scenario via page.addInitScript.
// Used in routes.spec.ts for client-side redirect assertions.
```

---

## Technical Notes

- `tests/e2e/.auth/` is git-ignored — `user.json` is generated at runtime
- Route tests use `test.use({ storageState: { cookies: [], origins: [] } })` for unauthenticated requests
- The proxy redirect (`/onboarding` → `/feed` for completed users) depends on `status` being set in the Auth0 session cookie, which only happens after a real sync-user BFF call — not testable in the MSW-based suite

---

## References

- [Integration Tests](integration-tests.md) — for feature-level testing without real Auth0
- [Live Backend Tests](live-backend-tests.md) — for full lifecycle including proxy redirects
