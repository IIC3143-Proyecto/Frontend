# Testing Guide

This folder contains documentation on testing strategies and test suites.

---

## Test Suites

VTRNA uses a Testing Trophy approach — more integration tests than E2E, with unit tests for pure logic and contract tests to validate the real backend.

| Suite | Tool | Requires | ~Count |
|-------|------|----------|--------|
| **Unit** | Vitest | Nothing | 14 |
| **Integration** | Playwright + MSW | Dev server | 43 |
| **Contract** | Playwright | `BACKEND_API_URL` + Auth0 creds | 22 |
| **E2E** | Playwright | Auth0 creds | 4 |
| **Live Backend** | Playwright | Backend + DB limpia + Auth0 creds | ~5 |

---

## Installation

Before running Playwright tests for the first time, install browsers and dependencies:

```bash
npm run test:install
```

---

## Running Tests

### Unit tests (Vitest)
```bash
npm run test:unit           # Run once
npm run test:unit:watch     # Watch mode
```

### Integration tests (Playwright + MSW)
```bash
npm run test:integration    # Run integration suite
```

### E2E tests (real Auth0)
```bash
npm run test:e2e            # Run E2E suite
```

### Both E2E + Integration
```bash
npm run test:all            # Runs e2e + integration projects
```

### Live backend tests (requires backend running with a clean DB)
```bash
npm run test:live
```

### Contract tests (requires real backend)
```bash
BACKEND_API_URL=https://your-backend.com npm run test:contract
```

### Utilities
```bash
npm run test:report         # Open last HTML report
```

---

## Prerequisites

### Integration tests
```env
NEXT_PUBLIC_ENABLE_MSW=true
```

### Contract tests
```env
NEXT_PUBLIC_API_URL=https://your-backend.com
AUTH0_TEST_EMAIL=user@example.com
AUTH0_TEST_PASSWORD=yourpassword
ENABLE_TEST_ENDPOINTS=true
```

### E2E tests
```env
AUTH0_TEST_EMAIL=user@example.com
AUTH0_TEST_PASSWORD=yourpassword
```

Without Auth0 credentials, the setup fixture saves an empty auth state and skips — integration tests still run.

---

## How Each Suite Works

### Unit tests
Pure logic, no DOM, no network. Files live next to the module they test (`src/**/*.test.ts`). See [unit-tests.md](unit-tests.md).

### Integration tests
Run against a dev server with MSW active (`serviceWorkers: 'allow'`, `NEXT_PUBLIC_ENABLE_MSW=true`). Use `window.__setErrorScenario()` for error injection and `page.addInitScript()` for pre-navigation scenarios. The `tests/fixtures.ts` fixture auto-resets MSW state after each test. See [MSW documentation](../msw.md).

### Contract tests
Make direct HTTP requests to a real backend. Validate response shapes and detect when pending endpoints are implemented. Self-skip without credentials. See [contract-tests.md](contract-tests.md).

### E2E tests
Real Auth0 OAuth flow. `serviceWorkers: 'block'` — MSW does not intercept. Require valid credentials in `.env.local`.

---

## Configuration

See `playwright.config.ts` for:
- Projects: `setup`, `e2e`, `integration`, `contract-setup`, `contract`
- Base URL: `http://localhost:3000`
- Sequential execution (1 worker)
- HTML reporting, traces on first retry

---

## Best Practices

### Integration tests
- Use `gotoAuthenticated(page, path, scenario)` to navigate as a specific user
- Set error scenarios after navigation, before the triggering action
- Import `test` from `tests/fixtures.ts` (not `@playwright/test`) to get auto-reset
- Use semantic locators (role, text) over CSS selectors

### Unit tests
- Test pure functions — no mocks, no DOM, no network
- Keep test files next to the module: `src/lib/foo.ts` → `src/lib/foo.test.ts`

### General
- Never use fixed `sleep()` delays — use explicit waits
- `workers: 1` — tests run sequentially for reliability

---

## CI/CD

In CI:
- `forbidOnly: true` — prevents accidentally committed `.only` tests
- 2 retries on failure
- HTML report and traces generated automatically

---

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](../msw.md)
- [Unit Tests Guide](unit-tests.md)
- [Contract Tests Guide](contract-tests.md)
- [Live Backend Tests](live-backend-tests.md)
