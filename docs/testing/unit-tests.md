# Unit Tests (Vitest)

Unit tests cover pure logic — functions with no DOM, no network, and no React. They run instantly with no setup required.

---

## When to Write Unit Tests

Write a unit test when a function:
- Takes inputs and returns outputs with no side effects
- Has non-trivial branching (multiple conditions worth verifying)
- Could silently break without a type error

Do **not** write unit tests for:
- One-line functions that just delegate to another function
- React components (use integration tests)
- API calls or database queries (use integration tests)

---

## Running Tests

```bash
npm run test:unit           # Run once, CI mode
npm run test:unit:watch     # Watch mode during development
```

No environment variables required.

---

## File Location

Test files live in `tests/unit/`, mirroring the `src/` structure:

```
src/lib/post-steps.ts       → tests/unit/post-steps.test.ts
src/lib/api/index.ts        → tests/unit/api/index.test.ts
src/lib/utils.ts            → tests/unit/lib/utils.test.ts
```

Vitest picks up all `tests/unit/**/*.test.ts` files automatically.

---

## Examples

### `tests/unit/lib/utils.test.ts`

Tests `formatRelativeDate()` — the relative date formatter used in notification cards:

```ts
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeDate } from '@/lib/utils';

describe('formatRelativeDate', () => {
  const NOW = new Date('2026-06-19T12:00:00');

  beforeEach(() => vi.setSystemTime(NOW));
  afterEach(() => vi.useRealTimers());

  test('devuelve formato relativo según la distancia temporal', () => {
    expect(formatRelativeDate(new Date(NOW.getTime() - 30_000).toISOString())).toBe('Ahora');
    expect(formatRelativeDate(new Date(NOW.getTime() - 45 * 60_000).toISOString())).toBe('Hace 45 min');
    // ...
  });
});
```

`vi.setSystemTime()` pins the "now" so assertions are deterministic regardless of when the test runs.

### `tests/unit/post-steps.test.ts`

Tests the desktop↔mobile step conversion logic used by the create-post wizard.

### `tests/unit/api/index.test.ts`

Tests the URL builder with different environment configurations. Uses `vi.resetModules()` + `vi.stubEnv()` to test module-level `process.env` reads across multiple scenarios.

---

## Known Gotcha — Module-Level `process.env` Reads

Some modules read `process.env` at the top level (outside any function), which means the value is captured once when the module is first imported. To test different env configurations in the same test file, reset the module registry between tests:

```ts
beforeEach(() => {
  vi.resetModules()
  vi.unstubAllEnvs()
})

it('returns absolute URL when API_URL is set', async () => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com')
  const { api } = await import('./index')   // fresh import with new env
  expect(api.tags()).toBe('https://api.example.com/api/tag')
})
```
