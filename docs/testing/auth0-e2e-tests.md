# E2E Testing - Auth0 Integration

This document details the E2E test suite that validates Auth0 authentication and route protection.

---

## Test Architecture

### Files
```
e2e/
├── auth.setup.ts              # Setup fixture - Auth0 authentication
├── auth.spec.ts               # Auth flow tests
├── routes.spec.ts             # Route protection tests  
├── sync-user-errors.spec.ts       # Sync-user error handling
├── debug-auth0.spec.ts        # Debug utilities
├── .auth/
│   └── user.json              # Persisted auth state (generated)
└── helpers/
    └── auth.ts                # Shared test utilities
```

### Test Results (Current)
```
Total: 23 passed
Runtime: ~60 seconds
```

### Coverage
- ✓ Public routes accessible without auth
- ✓ Private routes redirect to login
- ✓ Auth0 login flow
- ✓ Onboarding redirects
- ✓ Sync-user error scenarios (401, 403, 500, 503)

---

## Test Fixtures & Setup

### `auth.setup.ts` - Authentication Setup

This special setup test runs BEFORE all other tests.

**What it does:**
```typescript
setup('authenticate with Auth0', async ({ page }) => {
  // 1. Requires AUTH0_TEST_EMAIL and AUTH0_TEST_PASSWORD in .env.local
  // 2. Navigates to /login
  // 3. Fills Auth0 login form
  // 4. Waits for redirect back to localhost:3000
  // 5. Waits for MSW and VTRNA sync
  // 6. Saves session to e2e/.auth/user.json
});
```

**Configuration:**
```typescript
projects: [
  { name: 'setup', testMatch: '**/auth.setup.ts' },
  {
    name: 'chromium',
    dependencies: ['setup'],  // Runs setup FIRST
    use: {
      storageState: 'e2e/.auth/user.json',  // Reuse auth
    },
  },
]
```

**Requirement:**
```env
# .env.local
AUTH0_TEST_EMAIL=your-test-user@example.com
AUTH0_TEST_PASSWORD=your-test-password
```

If not set, setup is skipped and all tests run unauthenticated.

---

## Test Helpers

### `helpers/auth.ts`

Reusable utilities for test scenarios:

#### `mockSyncUser(page, scenario)`
Mocks `/auth/sync-user` response with a specific user scenario.

```typescript
await mockSyncUser(page, 'FULL');  // Authenticated + onboarding done
await mockSyncUser(page, 'ONBOARDING_PENDING');  // Authenticated + pending
```

**Scenarios:**
- `FULL` - Completed onboarding
- `ONBOARDING_PENDING` - Pending onboarding
- `NO_PHOTO` - Missing profile photo
- `NEW` - Brand new user

#### `mockSyncUserError(page, status)`
Mocks `/auth/sync-user` error responses.

```typescript
await mockSyncUserError(page, 401);  // Unauthorized
await mockSyncUserError(page, 500);  // Server error
```

#### `waitForMSW(page)`
Waits until page is no longer showing "Cargando" (MSW loading).

```typescript
await page.goto('/');
await waitForMSW(page);  // Wait for MSW initialization
```

#### `waitForAuthSync(page)`
Waits until page is no longer showing "Sincronizando con VTRNA".

```typescript
await waitForAuthSync(page);  // Wait for /auth/sync-user
```

#### `gotoAuthenticated(page, path, scenario)`
Helper to navigate to a path as an authenticated user.

```typescript
await gotoAuthenticated(page, '/profile', 'FULL');
// Equivalent to:
// 1. Mock sync-user with 'FULL' scenario
// 2. Navigate to /profile
// 3. Wait for MSW
// 4. Wait for auth sync
```

---

## Test Suites

### 1. Public Routes (`routes.spec.ts`)

**What:** Validate public routes are accessible without authentication.

```typescript
test.describe('Rutas públicas — sin sesión', () => {
  test.use(NO_AUTH);  // No auth context

  test('GET / accesible y no muestra spinner de auth', async ({ page }) => {
    await page.goto('/');
    await waitForMSW(page);
    await expect(page).toHaveURL('/');
    // Public homepage should show, no auth spinner
  });

  // /about-us, /faq also accessible
});
```

**Routes tested:**
- `/` - Home
- `/about-us` - About page
- `/faq` - FAQ page

**Context:** `NO_AUTH = { storageState: { cookies: [], origins: [] } }`

---

### 2. Private Routes Protection (`routes.spec.ts`)

**What:** Validate private routes redirect to login when unauthenticated.

```typescript
test.describe('Rutas privadas — sin sesión (proxy server-side)', () => {
  test.use(NO_AUTH);

  for (const privateRoute of PRIVATE_ROUTES) {
    test(`GET ${privateRoute} redirige a /login con returnTo`, async ({ page }) => {
      const loginReq = page.waitForRequest(
        req => req.url().includes('localhost:3000/login') && 
               req.url().includes('returnTo='),
        { timeout: 10_000 }
      );
      
      await page.goto(privateRoute, { waitUntil: 'commit' });
      
      // Proxy should redirect before page loads
      expect((await loginReq).url()).toContain(
        `returnTo=${encodeURIComponent(privateRoute)}`
      );
    });
  }
});
```

**Private routes tested:**
- `/notifications`
- `/profile`
- `/publications`
- `/shopping-history`
- `/onboarding`

**Validation:**
- Proxy intercepts (server-side)
- Redirects to `/login?returnTo=${original_path}`
- returnTo parameter is URL-encoded

---

### 3. Onboarding Redirects (`routes.spec.ts`)

**What:** Validate client-side redirects based on onboarding status (using `useAuth` hook).

```typescript
test('FULL: /onboarding redirige a /profile (onboardingCompleted=true)', 
  async ({ page }) => {
    await gotoAuthenticated(page, '/onboarding', 'FULL');
    // useAuth detects: onboardingCompleted=true in /onboarding
    // Automatically redirects to /profile
    await expect(page).toHaveURL('/profile');
  }
);

test('ONBOARDING_PENDING: /profile redirige a /onboarding',
  async ({ page }) => {
    await gotoAuthenticated(page, '/profile', 'ONBOARDING_PENDING');
    // useAuth detects: onboardingCompleted=false accessing /profile
    // Automatically redirects to /onboarding
    await expect(page).toHaveURL('/onboarding');
  }
);
```

**Redirects tested:**
- Completed onboarding → `/profile` (from `/onboarding`)
- Pending onboarding → `/onboarding` (from `/profile`)
- Access profile after login → `/profile` (from login)

**Mechanism:** Client-side `useAuth` hook in `src/hooks/use-auth.ts`

---

### 4. Authentication Flow (`auth.spec.ts`)

**What:** Validate full Auth0 login flow.

```typescript
test('usuario FULL accede a /profile sin redirect', async ({ page }) => {
  // Using auth setup fixture
  await gotoAuthenticated(page, '/profile', 'FULL');
  
  // Session valid, profile accessible
  await expect(page).toHaveURL('/profile');
});

test('después del logout, /profile redirige con returnTo', async ({ page }) => {
  await page.goto('/logout', { waitUntil: 'commit' });
  // Auth0 logout clears session
  
  await page.goto('/profile', { waitUntil: 'commit' });
  // Private route, no session → redirect to login
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fprofile/);
});
```

**Tests:**
- Login success → session created
- Logout success → session cleared
- Accessing private route after logout → redirect to login

---

### 5. Sync-User Error Scenarios (`sync-user-errors.spec.ts`)

**What:** Validate error handling for failed `/auth/sync-user` requests.

```typescript
test('sync-user 401 → auto logout + redirect /login', async ({ page }) => {
  await mockSyncUserError(page, 401);
  await page.goto('/profile');
  
  // useAuth detects 401 error
  // Auto logout triggered
  // Redirects to /login
  await expect(page).toHaveURL(/\/login/);
});

test('sync-user 500 → show error, no redirect', async ({ page }) => {
  await mockSyncUserError(page, 500);
  await page.goto('/profile');
  
  // Server error, not auth error
  // No redirect, stays on page
  await expect(page.getByText('Error')).toBeVisible();
});
```

**Error codes tested:**
- `401` → Unauthorized (logout)
- `403` → Forbidden (error message)
- `500` → Server error (error message)
- `503` → Unavailable (retry logic)

---

## Data Mocking

### User Scenarios (`src/lib/msw/mocks/data/mock-users.ts`)

Each scenario represents a different user state:

```typescript
const MOCK_USERS = {
  FULL: {
    id: 'auth0|full-user',
    email: 'full@example.com',
    onboardingCompleted: true,  // Can access /profile
    // ... other fields
  },
  ONBOARDING_PENDING: {
    id: 'auth0|pending-user',
    email: 'pending@example.com',
    onboardingCompleted: false,  // Must go to /onboarding
  },
  // ... other scenarios
};
```

### MSW Handler (`src/lib/msw/mocks/handlers/sync-user.ts`)

```typescript
http.get('*/auth/sync-user', () => {
  const scenario = getMockUser();  // Current active scenario
  const user = MOCK_USERS[scenario];
  
  if (!user) return new HttpResponse(null, { status: 401 });
  return HttpResponse.json(user);
});
```

### Changing Scenario in Tests

Use `mockSyncUser()` helper to change active scenario:

```typescript
// In test
await mockSyncUser(page, 'ONBOARDING_PENDING');
await page.goto('/profile');
// Will receive ONBOARDING_PENDING user data
```

---

## Common Patterns

### Test with Authentication
```typescript
// Uses setup fixture session automatically
test('authenticated user can access profile', async ({ page }) => {
  await page.goto('/profile');  // Session from auth.setup.ts
  await expect(page).toHaveURL('/profile');
});
```

### Test Without Authentication
```typescript
test('unauthenticated user redirects to login', async ({ page }) => {
  test.use(NO_AUTH);  // Override session
  
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login/);
});
```

### Test Different User States
```typescript
test('pending user sees onboarding', async ({ page }) => {
  await mockSyncUser(page, 'ONBOARDING_PENDING');
  await gotoAuthenticated(page, '/profile');
  
  // User redirected to /onboarding
  await expect(page).toHaveURL('/onboarding');
});
```

---

## Debugging

### Run Single Test
```bash
npx playwright test e2e/routes.spec.ts -g "GET / accesible"
```

### Debug Mode
```bash
npx playwright test --debug
# Browser opens, can inspect, step through code
```

### Interactive UI
```bash
npm run e2e:ui
# Web UI to pick tests, run, see results
```

### View Report
```bash
npm run e2e:report
# Open HTML report of last run
```

### View Traces
```bash
# Traces saved on failure (playwright.config.ts: trace: 'on-first-retry')
npm run e2e:report
# Click failed test → see trace with network/DOM/console
```

---

## Performance

### Timing
- Setup phase: ~15 seconds (Auth0 login)
- Per test: ~2-3 seconds average
- Total: ~60 seconds for 23 tests

### Optimization
- Tests run sequentially (1 worker) for stability
- MSW blocks service workers (faster, deterministic)
- reusable session reduces redundant Auth0 logins

---

## Troubleshooting

### Tests fail with "Auth0 login timeout"
**Cause:** Auth0 domain not responsive, wrong credentials, or Auth0 tenant misconfigured

**Fix:**
```bash
# Check .env.local
AUTH0_TEST_EMAIL=valid-email@example.com
AUTH0_TEST_PASSWORD=valid-password
AUTH0_DOMAIN=dev-xxxxx.auth0.com  # Must match your tenant
```

### Tests fail with "Cannot find element"
**Cause:** Timing issue - element not loaded yet

**Fix:**
```typescript
// Use explicit waits
await page.waitForFunction(() => !document.body.innerText.includes('Cargando'));
await expect(element).toBeVisible({ timeout: 15_000 });
```

### Mock not working
**Cause:** MSW not enabled or handler not registered

**Fix:**
```bash
# Ensure dev server runs with MSW
NEXT_PUBLIC_ENABLE_MSW=true npm run dev

# Check playwright.config.ts has:
command: 'NEXT_PUBLIC_ENABLE_MSW=true npm run dev'
```

---

## Adding New E2E Tests

### Step 1: Create Test File
```typescript
// e2e/new-feature.spec.ts
import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers/auth';

test.describe('New Feature', () => {
  test('user can do X', async ({ page }) => {
    // Test logic
  });
});
```

### Step 2: Use Existing Patterns
```typescript
// With authentication
await gotoAuthenticated(page, '/profile', 'FULL');

// Without authentication
test.use({ storageState: { cookies: [], origins: [] } });

// With specific user state
await mockSyncUser(page, 'ONBOARDING_PENDING');
```

### Step 3: Run Test
```bash
npm run e2e -- new-feature.spec.ts
```

---

## References

- [Auth0 Documentation](../auth0.md)
- [Playwright API](https://playwright.dev/docs/api/class-page)
- [MSW Documentation](../msw.md)
- [Test Configuration](../../playwright.config.ts)
