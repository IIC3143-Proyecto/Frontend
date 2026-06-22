# E2E Tests

E2E tests verify authentication flows against the real Auth0 tenant. They use real browser sessions and do not mock any network requests. MSW is blocked (`serviceWorkers: 'block'`) for this project.

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

During setup, `page.route()` intercepts `/auth/sync-user` and returns a mock `FULL` user with `onboardingCompleted: true` — this prevents the onboarding redirect during setup. The real Auth0 `appSession` cookie is still obtained and saved.

---

## Test Files

| File | What it covers |
|------|----------------|
| `auth.spec.ts` | Login redirects to Auth0, signup with `screen_hint=signup`, authenticated user accesses `/profile`, logout clears session and redirects to `/`, post-logout private routes redirect with `returnTo` |
| `routes.spec.ts` | Public routes (`/`, `/about-us`, `/faq`) accessible without auth; private routes (`/notifications`, `/profile`, `/offers`, `/posts`, `/onboarding`) redirect to `/login?returnTo=...` |
| `auth-integration.spec.ts` | Real backend connectivity — self-skips when `NEXT_PUBLIC_API_URL` is not set. Verifies `/health`, `sync-user` reaches the backend, response has expected fields (`id`, `email`, `onboardingCompleted`, `providerAuth0`), `onboardingCompleted` is derived from `bio` |
| `onboarding-e2e.spec.ts` | `test.fixme` — new user sees onboarding form; completing onboarding redirects to `/profile` |
| `create-post-e2e.spec.ts` | `test.fixme` — authenticated user opens create-post modal and completes all steps |

---

## Helpers

### `tests/e2e/helpers/auth.ts`

```ts
waitForMSW(page)
// Wait for MSWProvider's loading screen to disappear.
// Not typically needed in e2e tests since MSW is blocked,
// but used for consistency with integration tests.

gotoAuthenticated(page, path, scenario?)
// Navigate with a pre-set MSW scenario (via page.addInitScript).
// Used in routes.spec.ts for client-side redirect assertions.
```

---

## Technical Notes

- ⚠️ `onboarding-e2e.spec.ts` and `create-post-e2e.spec.ts` are entirely `test.fixme` — pending a dedicated test account with a completed onboarding profile
- `auth-integration.spec.ts` tests self-skip if `NEXT_PUBLIC_API_URL` is not configured; they are not included in `test:e2e` by default since they require both Auth0 credentials and a running backend
- The `tests/e2e/.auth/` directory is git-ignored — `user.json` is generated at runtime

---

## References

- [Auth0 Setup](../auth0.md)
- [Integration Tests](integration-tests.md) — for feature-level testing without real Auth0
