# Testing Guide

This folder contains documentation on testing strategies and test suites.

---

## Overview

VTRNA implements different testing layers using Playwright for E2E testing.

---

## Installation

Before running E2E tests for the first time, install Playwright and its dependencies:

```bash
npx playwright install --with-deps    # Install Playwright + browser dependencies
```

Or use the npm script (if available):
```bash
npm run e2e:install                   # Alternative: install via npm script
```

---

## Running Tests

### E2E Tests
```bash
npm run e2e                    # Run all E2E tests (headless)
npm run e2e -- --ui           # Interactive UI mode
npm run e2e -- --headed       # Run with browser visible
npm run e2e -- --debug        # Debug mode with inspector
npm run e2e:report            # Open last HTML report
```

### Specific Test File
```bash
npm run e2e -- onboarding.spec.ts    # Run specific test
npm run e2e -- -g "pattern"           # Run tests matching pattern
```

---

## Configuration

See `playwright.config.ts` for:
- Test directory: `./e2e`
- Base URL: `http://localhost:3000`
- Browser: Chromium
- Sequential execution (1 worker)
- HTML reporting
- Auto-start dev server

---

## Best Practices

### E2E Tests
- ✓ Use semantic locators (role, text) over CSS selectors
- ✓ Wait for content visibility before assertions
- ✓ Reset state in `beforeEach` or `beforeAll`
- ✗ Avoid fixed delays (`sleep`)
- ✗ Don't make actual API calls (use MSW mocks)

### Debugging
```bash
npx playwright test --debug        # Step-by-step debugging
npm run e2e:ui                     # Interactive test runner
npx playwright test --trace on     # Generate traces
```

### Performance
- Tests run sequentially for reliability
- MSW mocks intercept all network calls
- Typical run: 20-30 seconds

---

## CI/CD Integration

In CI environment:
- `forbidOnly: true` — prevents skipped tests
- 1 retry on failure
- HTML report generated
- Traces on first retry

---

## Prerequisites

Ensure `.env.local` contains:
```
NEXT_PUBLIC_ENABLE_MSW=true
```

MSW must be enabled for tests to work correctly.

---

## Adding New Tests

1. **Call helpers first** — ensure MSW and page state ready
2. **Reset scenarios** — each test starts clean
3. **Use explicit waits** — `await expect(...).toBeVisible()`
4. **Add fixtures to `e2e/fixtures/`** — for images, PDFs, etc
5. **Reference the feature E2E doc** — for available helpers and scenarios

---

## References

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [MSW Documentation](../msw.md)

