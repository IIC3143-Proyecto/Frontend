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
- API calls or database queries (use contract or integration tests)

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
```

Vitest picks up all `tests/unit/**/*.test.ts` files automatically.

---

## Examples

### `tests/unit/post-steps.test.ts`

Tests the desktop↔mobile step conversion logic used by the create-post wizard:

```ts
import { describe, it, expect } from 'vitest'
import { desktopToMobile, mobileToDesktop } from './post-steps'

describe('desktopToMobile', () => {
  it('step 1 with photos → mobile step 2', () => expect(desktopToMobile(1, 1)).toBe(2))
  it('step 1 without photos → mobile step 1', () => expect(desktopToMobile(1, 0)).toBe(1))
})
```

### `tests/unit/api/index.test.ts`

Tests the URL builder with different environment configurations:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('api URL builder', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('syncUser() always returns the local BFF path', async () => {
    const { api } = await import('./index')
    expect(api.syncUser()).toBe('/sync-user')
  })
})
```

---

## Known Gotcha — Module-Level `process.env` Reads

Some modules read `process.env` at the top level (outside any function), which means the value is captured once when the module is first imported. To test different env configurations in the same test file, you must reset the module registry between tests:

```ts
beforeEach(() => {
  vi.resetModules()      // clears the module cache
  vi.unstubAllEnvs()     // restores original env values
})

it('returns absolute URL when API_URL is set', async () => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com')
  vi.stubEnv('NEXT_PUBLIC_ENABLE_MSW', 'false')
  const { api } = await import('./index')   // fresh import with new env
  expect(api.tags()).toBe('https://api.example.com/api/tag')
})
```

Without `vi.resetModules()`, subsequent imports return the cached module with the original env values.
