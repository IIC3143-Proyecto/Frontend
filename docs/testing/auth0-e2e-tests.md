# E2E Testing - Auth0 Integration

Validates Auth0 authentication and route protection. 35 tests across 4 spec files.

---

## Test Architecture

Three layers: a **setup fixture** that authenticates once with real Auth0 credentials and persists the session; **spec files** that test auth flow, route protection, onboarding, and sync-user errors; and **helpers** that provide `gotoAuthenticated()` and `page.route()` mocks for each scenario.

> `serviceWorkers: 'block'` in `playwright.config.ts` prevents Auth0's service worker from interfering. All mocks use `page.route()` instead of MSW.

### Coverage

- ✓ Public routes accessible without auth
- ✓ Private routes redirect to `/login?returnTo=`
- ✓ Auth0 login and logout flow
- ✓ Onboarding redirects based on `onboardingCompleted`
- ✓ Onboarding form validation, avatar upload, profile update
- ✓ Sync-user error handling (401 → `/session-expired`, 403/500/503 → error screen)

---

## Auth Setup Fixture (`auth.setup.ts`)

Runs once before all tests. Authenticates against the real Auth0 tenant and saves the session to `e2e/.auth/user.json`. All spec files reuse this session via `storageState`.

```typescript
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: '**/auth.setup.ts' },
  {
    name: 'chromium',
    dependencies: ['setup'],           // setup runs first
    use: { storageState: 'e2e/.auth/user.json' },  // session reused
  },
]
```

**Required env vars** (in `.env.test`):
```
AUTH0_TEST_EMAIL=your-test-user@example.com
AUTH0_TEST_PASSWORD=your-test-password
```

Without these, `auth.setup.ts` is skipped and the remaining 27 tests still run (using `mockSyncUser` without a real Auth0 session).

---

## Helpers

### `helpers/auth.ts`

| Helper | Description |
|--------|-------------|
| `gotoAuthenticated(page, path, scenario)` | Mocks sync-user, navigates, waits for MSW and auth sync |
| `mockSyncUser(page, scenario)` | Intercepts `GET /auth/sync-user` with a user scenario |
| `mockSyncUserError(page, status)` | Intercepts `GET /auth/sync-user` with an error status |
| `waitForMSW(page)` | Waits until the page stops showing "Cargando" |
| `waitForAuthSync(page)` | Waits until the page stops showing "Sincronizando con VTRNA" |

**User scenarios for `mockSyncUser`:**

| Scenario | `onboardingCompleted` | Use case |
|----------|----------------------|----------|
| `FULL` | `true` | Authenticated, can access `/profile` |
| `ONBOARDING_PENDING` | `false` | Must complete onboarding |
| `NO_PHOTO` | `false` | Missing profile photo |
| `NEW` | `false` | Brand new user |

### `helpers/form-errors.ts`

| Helper | Description |
|--------|-------------|
| `mockDefaultHandlers(page)` | Default success handlers for avatar upload and PATCH /user |
| `mockAvatarError(page, status)` | Errors on `POST /profile/avatar` (401, 422, 500) |
| `mockAvatarNetwork(page)` | Simulates network failure on avatar upload |
| `mockAvatarSlow(page)` | Delayed avatar response (tests loading states) |
| `mockAvatarSuccess(page)` | Resets avatar mock to success |
| `mockPatchError(page, status)` | Errors on `PATCH /user` (409 conflict, 500) |

---

## Test Suites

| File | What it tests |
|------|--------------|
| `auth.spec.ts` | Login, logout, accessing private routes after logout |
| `routes.spec.ts` | Public routes accessible; private routes → `/login?returnTo=`; onboarding redirects |
| `sync-user-errors.spec.ts` | 401 → `/session-expired`; 403/500/503 → error screen; retry button |
| `onboarding.spec.ts` | Form validation, avatar upload errors, username conflict, form state persistence |

---

## Troubleshooting

### Auth0 login timeout in `auth.spec.ts`
Check `.env.test`: `AUTH0_TEST_EMAIL`, `AUTH0_TEST_PASSWORD`, and `AUTH0_DOMAIN` must match your tenant.

### 27 tests pass, 8 fail (all in `auth.spec.ts`)
Missing credentials → setup fixture skipped → no real session. Either add credentials or run only the non-auth tests: `npm run e2e -- routes.spec.ts sync-user-errors.spec.ts onboarding.spec.ts`

---

## References

- [Auth0 Integration](../auth0.md)
- [Testing Guide](./README.md)
- [Playwright API](https://playwright.dev/docs/api/class-page)
