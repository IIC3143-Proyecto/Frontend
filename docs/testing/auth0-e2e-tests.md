# E2E Testing - Auth0 Integration

This document details the E2E test suite that validates Auth0 authentication and route protection.

---

## Test Architecture

### Files
```
e2e/
├── auth.setup.ts                  # Setup fixture - Auth0 authentication
├── auth.spec.ts                   # Auth flow tests
├── routes.spec.ts                 # Route protection tests  
├── onboarding.spec.ts             # Onboarding form tests with Auth0
├── sync-user-errors.spec.ts       # Sync-user error handling
├── .auth/
│   └── user.json                  # Persisted auth state (generated)
└── helpers/
    ├── auth.ts                    # Auth utilities & mocking
    └── form-errors.ts             # Onboarding form error scenarios
```

### Test Results (Current)
```
Total: 35 passed
Runtime: ~75 seconds
Coverage: auth flow + route protection + onboarding form + error handling
```

### Coverage
- ✓ Public routes accessible without auth
- ✓ Private routes redirect to login
- ✓ Auth0 login flow
- ✓ Onboarding form validation and submission
- ✓ Avatar upload with error scenarios (401, 422, 500)
- ✓ Username conflict detection (409)
- ✓ Form persistence after errors
- ✓ Loading states and network errors
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

### `helpers/form-errors.ts`

Utilities for mocking onboarding form request scenarios:

#### `mockDefaultHandlers(page)`
Sets up default success handlers for avatar upload and profile update.

```typescript
await mockDefaultHandlers(page);  // Setup default mocks
```

#### `mockAvatarSuccess(page)`
Re-enables successful avatar upload after a previous error scenario.

```typescript
await mockAvatarError(page, 500);  // Simulate error
await submitForm(page);
await mockAvatarSuccess(page);  // Reset to success
await submitForm(page);  // Should succeed
```

#### `mockAvatarError(page, status)`
Mocks avatar upload endpoint (`POST /profile/avatar`) with error responses.

```typescript
await mockAvatarError(page, 401);   // Unauthorized
await mockAvatarError(page, 422);   // Unprocessable (invalid file)
await mockAvatarError(page, 500);   // Server error
```

#### `mockAvatarNetwork(page)`
Simulates network error on avatar upload.

```typescript
await mockAvatarNetwork(page);
// Request will fail without a response
```

#### `mockAvatarSlow(page)`
Simulates slow avatar upload response (for testing loading states).

```typescript
await mockAvatarSlow(page);  // Slow response, shows spinner
```

#### `mockPatchError(page, status)`
Mocks profile update endpoint (`PATCH /user`) with error responses.

```typescript
await mockPatchError(page, 409);   // Conflict (username taken)
await mockPatchError(page, 500);   // Server error
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

### 6. Onboarding Form Submission (`onboarding.spec.ts`)

**What:** Validate onboarding form functionality, validation, and error handling.

**Setup:** All tests use `gotoAuthenticated(page, '/onboarding', 'NEW')` to access as new user.

#### Form Validation Tests

```typescript
test('should complete onboarding successfully', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'My bio');
  await submitForm(page);
  
  // Both avatar and PATCH /user succeed
  await waitForToast(page, 'Perfil actualizado!');
});

test('should require avatar before form submission', async ({ page }) => {
  await fillUsername(page, 'testuser');
  await submitForm(page);
  
  // No avatar selected
  await expectError(page, 'Avatar es requerido');
});

test('should show validation errors when submitting empty form', async ({ page }) => {
  await submitForm(page);
  await expectError(page, 'Avatar es requerido');
  await expectError(page, 'Username es requerido');
});
```

#### Avatar Upload Error Scenarios

```typescript
test('should redirect to session-expired when avatar returns 401', 
  async ({ page }) => {
    await mockAvatarError(page, 401);  // Unauthorized
    await uploadAvatar(page);
    await fillUsername(page, 'testuser');
    await submitForm(page);
    
    // Auth expired during upload
    await expect(page).toHaveURL('/session-expired');
  }
);

test('should show error when file is not valid WebP', async ({ page }) => {
  await mockAvatarError(page, 422);  // Unprocessable
  await uploadAvatar(page);
  await submitForm(page);
  
  await waitForToast(page, 'File must be a WebP image');
});

test('should show network error toast on connection failure',
  async ({ page }) => {
    await mockAvatarNetwork(page);  // Network error
    await uploadAvatar(page);
    await submitForm(page);
    
    await waitForToast(page, 'Error de red');
  }
);

test('should show loading spinner on slow response', async ({ page }) => {
  await mockAvatarSlow(page);  // Delayed response
  await uploadAvatar(page);
  await submitForm(page);
  
  // Spinner visible during wait
  await expect(page.getByRole('button', { name: 'Guardando...' })).toBeVisible({ timeout: 3_000 });
});
```

#### Profile Update Error Scenarios

```typescript
test('should show error when username is already taken', async ({ page }) => {
  await mockPatchError(page, 409);  // Conflict
  await uploadAvatar(page);
  await fillUsername(page, 'takenuser');
  await submitForm(page);
  
  // Username validation error
  await expectError(page, 'username already taken');
});

test('should show server error toast on 500 response', async ({ page }) => {
  await mockAvatarError(page, 500);  // Server error
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  
  await waitForToast(page, 'Internal server error');
});
```

#### Form State Recovery

```typescript
test('should allow retry after error', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  
  // First attempt fails
  await mockAvatarError(page, 500);
  await submitForm(page);
  await waitForToast(page, 'Internal server error');
  
  // Reset mock to success
  await mockAvatarSuccess(page);
  // Form values persist
  await submitForm(page);
  
  await waitForToast(page, 'Perfil actualizado!');
});

test('should persist form values after error', async ({ page }) => {
  await fillUsername(page, 'persisteduser');
  await fillBio(page, 'Persistent bio');
  
  await mockAvatarError(page, 500);
  await uploadAvatar(page);
  await submitForm(page);
  
  // Values still present after error
  await expect(page.getByDisplayValue('persisteduser')).toBeVisible();
  await expect(page.getByDisplayValue('Persistent bio')).toBeVisible();
});

test('should show avatar preview after file selection', async ({ page }) => {
  await uploadAvatar(page);
  
  // Avatar image visible as preview
  await expect(page.getByRole('img')).toBeVisible();
});
```

**Coverage:**
- ✓ Form validation (required fields, format)
- ✓ Avatar upload success/failure
- ✓ Profile update with conflict handling
- ✓ Network error resilience
- ✓ Loading states
- ✓ Error toast notifications
- ✓ Form state persistence

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
- Total: ~75 seconds for 35 tests

### Optimization
- Tests run sequentially (1 worker) for stability
- `serviceWorkers: 'block'` prevents MSW service worker from running; all mocks use `page.route()`
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
