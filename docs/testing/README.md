# Testing Guide

This folder contains documentation on testing strategies used in VTRNA Frontend.

## Running Tests

### All Tests
```bash
npm test              # Run all tests (unit + integration)
npm run e2e           # Run E2E tests
```

### Specific Test Suite
```bash
# E2E
npm run e2e                    # Run all E2E tests
npm run e2e -- auth.spec.ts    # Run specific E2E file
npm run e2e -- --project chromium  # Run specific browser

# Watch mode (not recommended for E2E)
npm run e2e -- --ui            # Interactive UI mode
npm run e2e:ui                 # Same as above

# Reports
npm run e2e:report             # Open last HTML report
```

---

## Current Test Distribution

### E2E Tests: 23 tests
**Location:** `e2e/`

```
e2e/
├── auth.setup.ts                 # Setup fixture (Auth0 login)
├── auth.spec.ts                  # Auth flow tests
├── routes.spec.ts                # Route protection tests
├── sync-user-errors.spec.ts      # Sync-user error handling tests
├── debug-auth0.spec.ts           # Debug utilities
└── helpers/
    └── auth.ts                   # Test helpers
```

**Configuration:** `playwright.config.ts`

---

## Test Types

### 1. Integration Tests
**Purpose:** Validate component interactions and data flow

Example:
```typescript
describe('useAuth hook', () => {
  it('should sync user from VTRNA on login', () => {
    // Test hook integration
  });
});
```

### 2. E2E Tests (Playwright)
**Purpose:** Validate full user flows end-to-end

Example:
```typescript
test('user can login and access profile', async ({ page }) => {
  await page.goto('/login');
  await loginWithAuth0(page, email, password);
  await expect(page).toHaveURL('/profile');
});
```

---

## E2E Testing Details

### Setup
- **Browser:** Chromium (single worker to avoid flakiness)
- **Parallelization:** Sequential (not parallel) to avoid race conditions
- **Retries:** 0 in dev, 2 in CI
- **Service Workers:** Blocked (MSW mocks API)

### Authentication Flow (for E2E)
1. **Setup Phase** (`auth.setup.ts`):
   - Authenticates with Auth0 using test credentials
   - Stores session in `e2e/.auth/user.json`
   - All subsequent tests reuse this session

2. **Test Phase**:
   - Tests use stored Auth0 session
   - Can also test unauthenticated flow with `NO_AUTH` context

### MSW in E2E
During E2E tests:
```
Playwright Browser → Next.js Dev Server (with MSW enabled)
                      ↓
                   MSW intercepts requests
                      ↓
                   Returns mock responses
```

**Key:** Tests start server with `NEXT_PUBLIC_ENABLE_MSW=true`

---

## For Specific E2E Test Details

See: **[E2E Testing - Auth0](./auth0-e2e-tests.md)**

---

## Maintenance

### Adding New E2E Tests
1. Create `.spec.ts` file in `e2e/`
2. Import test utilities from `e2e/helpers/auth.ts`
3. Use existing fixtures for auth state
4. Test new user flows

### Updating Mocks
MSW mocks are configured in:
```
src/lib/msw/
├── mocks/
│   ├── handlers/
│   │   └── sync-user.ts        # Main handler for /auth/sync-user
│   ├── scenario.ts             # User scenarios (FULL, ONBOARDING_PENDING, etc)
│   └── data/
│       └── mock-users.ts       # Mock user data
```

See: `docs/msw.md` for MSW details

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Auth0 Testing Guide](../auth0.md)
- [MSW Documentation](../msw.md)
