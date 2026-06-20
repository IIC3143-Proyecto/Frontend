# Testing Guide

This folder contains documentation on testing strategies and test suites.

---

## Test Suites

VTRNA uses a Testing Trophy approach — more integration tests than E2E, with unit tests for pure logic.

| Suite | Tool | Requires | ~Count |
|-------|------|----------|--------|
| **Unit** | Vitest | Nothing | 16 |
| **Integration** | Playwright + MSW | Dev server | 33 |
| **E2E** | Playwright | Auth0 creds | 14 |
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

### Summary report (after running tests)
```bash
npm run test:summary        # Print table from last test-results/results.json
npm run test:all:report     # Run unit + integration + print summary
```

### Live backend tests (requires backend running with a clean DB)
```bash
npm run test:live
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

### E2E tests
```env
AUTH0_TEST_EMAIL=user@example.com
AUTH0_TEST_PASSWORD=yourpassword
```

Without Auth0 credentials, the setup fixture saves an empty auth state and skips — integration tests still run.

---

## How Each Suite Works

### Unit tests
Pure logic, no DOM, no network. Files live in `tests/unit/`, mirroring the `src/` structure. See [unit-tests.md](unit-tests.md).

### Integration tests
Run against a dev server with MSW active (`serviceWorkers: 'allow'`, `NEXT_PUBLIC_ENABLE_MSW=true`). MSW intercepts all backend calls in the browser. Use `window.__setErrorScenario()` for error injection and `page.addInitScript()` for pre-navigation scenarios. The `tests/fixtures.ts` fixture auto-resets MSW state after each test. See [integration-tests.md](integration-tests.md).

### E2E tests
Real Auth0 OAuth flow. `serviceWorkers: 'block'` — MSW does not intercept. Test authentication flows, route protection, and logout. Require valid credentials in `.env.local`. See [e2e-tests.md](e2e-tests.md).

### Live backend tests
Full lifecycle test against a real backend and database. Requires a clean DB and an Auth0 test account that can be deleted between runs. See [live-backend-tests.md](live-backend-tests.md).

---

## Configuration

See `playwright.config.ts` for:
- Projects: `setup`, `e2e`, `integration`
- Base URL: `http://localhost:3000`
- Sequential execution (1 worker)
- HTML + JSON reporting, traces on first retry

---

## Best Practices

### Integration tests
- Use `gotoAuthenticated(page, path, scenario)` to navigate as a specific user
- Set error scenarios after navigation, before the triggering action
- Import `test` from `tests/fixtures.ts` (not `@playwright/test`) to get auto-reset
- Use semantic locators (role, text) over CSS selectors
- Group related assertions in `test.step()` blocks

### Unit tests
- Test pure functions — no mocks, no DOM, no network
- Keep test files in `tests/unit/` mirroring `src/` structure

### General
- Never use fixed `sleep()` delays — use explicit waits
- `workers: 1` — tests run sequentially for reliability

---

## CI/CD

See [ci-setup.md](ci-setup.md) for how to wire unit and integration tests into GitHub Actions.

In CI:
- `forbidOnly: true` — prevents accidentally committed `.only` tests
- 2 retries on failure
- HTML + JSON reports generated automatically

---

## Test scope

See `tests/SCOPE.md` for a complete list of what is and isn't covered.

---

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Unit Tests Guide](unit-tests.md)
- [Integration Tests Guide](integration-tests.md)
- [E2E Tests Guide](e2e-tests.md)
- [Live Backend Tests](live-backend-tests.md)
