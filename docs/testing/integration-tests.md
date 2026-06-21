# Integration Tests

Integration tests cover full UI flows using a real dev server with MSW intercepting HTTP requests. They are the largest suite (~43 tests) and the primary layer for verifying feature behavior.

---

## How They Work

The dev server runs with `NEXT_PUBLIC_ENABLE_MSW=true` and Playwright uses `serviceWorkers: 'allow'`. MSW's service worker intercepts all backend requests in the browser. There are no real backend calls.

**Two mechanisms for controlling MSW state:**

- **Pre-navigation** (`page.addInitScript`): set `window.__mswInitScenario` or `window.__mswInitError` before the page loads. `MSWProvider` applies the value after `worker.start()`. Used by `gotoAuthenticated` and `setInitialSyncUserError`.

- **Post-navigation** (`page.evaluate`): call `window.__setErrorScenario('AVATAR_500')` after navigating but before the action that triggers the request. Used by all error injection helpers.

**Auto-reset:** `tests/fixtures.ts` extends Playwright's `page` fixture to call `__resetErrorScenario()` and `__resetMockUser()` after every test.

---

## Running

```bash
npm run test:integration
```

No credentials required. If `AUTH0_TEST_EMAIL`/`AUTH0_TEST_PASSWORD` are not set, the auth setup saves an empty session state and skips — integration tests still run with an empty `storageState`.

---

## Test Files

| File | Tests | What it covers |
|------|-------|----------------|
| `onboarding.spec.ts` | ~13 | Form validation, avatar upload errors (401/422/500/network/slow), retry after error, form persistence, avatar preview |
| `create-post.spec.ts` | ~20 | Desktop + mobile step flows, photo upload, tag selection, upload/create errors (401/500/network), slow upload spinner, modal lifecycle |
| `edit-post.spec.ts` | ~20 | Save changes, pre-population (fields + tags), locked price, validation (title/price/tags/photos), PATCH post errors (401/500/network), photo endpoint correctness (DELETE/PATCH image) |
| `redirects.spec.ts` | ~5 | `useAuth` client-side redirects based on `onboardingCompleted`; one `fixme` for server-side proxy redirect |
| `sync-user-errors.spec.ts` | ~5 | 401 → `/session-expired`, 500/503 → error UI with retry, 403 → error without redirect |

---

## Helpers

### `tests/e2e/helpers/auth.ts`
Shared with e2e tests.

```ts
gotoAuthenticated(page, path, scenario?)
// Navigate to `path` as a specific MSW user scenario.
// Sets scenario via page.addInitScript before navigation.
// Waits for MSW to start and network to idle after navigation.
// Default scenario: 'FULL'

setInitialSyncUserError(page, status: 401 | 403 | 500 | 503)
// Set a sync-user error scenario before navigating.
// Must be called before page.goto().

waitForMSW(page)
// Wait for MSWProvider's loading screen ("Cargando") to disappear.
```

### `tests/integration/helpers/onboarding.ts`
Form interaction helpers for the onboarding flow.

```ts
uploadAvatar(page)     // Set file input + assert preview appears
fillUsername(page, value)
fillBio(page, value)
submitForm(page)
waitForToast(page, text, timeout?)
expectError(page, text)
```

### `tests/integration/helpers/form-errors.ts`
Error scenario setters for onboarding (avatar + user patch).

```ts
setAvatarError(page, status: 401 | 422 | 500)
setAvatarNetwork(page)
setAvatarSlow(page)
setPatchError(page, status: 409 | 500)
resetErrorScenario(page)   // explicit reset (fixture also auto-resets)
```

### `tests/integration/helpers/edit-post.ts`
Modal interaction + error scenario setters for edit-post.

```ts
// UI interaction
openEditModal(page)                  // first Editar button
openEditModalForPost(page, title)    // edit button for a specific post
clickSave(page)
openSection(page, name)              // expand accordion section by name
fillEditTitle(page, value)
fillEditPrice(page, value)
uploadEditPhotos(page, count?)

// Network verification
waitForImageRequest(page, method)    // returns request Promise (DELETE|PATCH)
assertNoImageRequest(page, action)   // asserts no image API calls during action

// Error injection
setPatchPostError(page, status: 401 | 500)
setPatchPostNetwork(page)
setDeleteImageError(page, status: 401 | 500)
setDeleteImageNetwork(page)
setAppendImageError(page, status: 401 | 500)
setAppendImageNetwork(page)
```

### `tests/integration/helpers/create-post.ts`
Modal interaction + error scenario setters for create-post.

```ts
// UI interaction
openModal(page)
clickNext(page)
clickBack(page)
clickPublish(page)
fillStep1(page, { title, price, description? })
uploadPhotos(page, count?)
selectRequiredTags(page)
selectMultipleTags(page)

// Error injection (call after navigation, before the triggering action)
setUploadError(page, status: 401 | 500)
setUploadNetwork(page)
setUploadSlow(page)
setCreateError(page, status: 401 | 500)
setCreateNetwork(page)
setPatchTagsError(page, status: 401 | 500)
setPatchTagsNetwork(page)
```

---

## Fixture

Import `test` from `tests/fixtures.ts` instead of `@playwright/test` to get the auto-reset behavior:

```ts
import { test } from '../fixtures';
import { expect } from '@playwright/test';
```

Tests in `redirects.spec.ts` and `sync-user-errors.spec.ts` import directly from `@playwright/test` because they manage MSW state differently (pre-navigation init scripts, no post-test cleanup needed).

---

## Fixtures File

`tests/e2e/fixtures/avatar.webp` is used as the test image for both avatar uploads and post photo uploads.

---

## Technical Notes

- ⚠️ PATCH `/api/user/:id` (#46) and PATCH `/api/post/:id/tags` (#48) are stubs — the related tests that exercise error paths for those endpoints are marked `test.fixme`
- `gotoAuthenticated` uses `page.waitForLoadState('networkidle')` to wait for `useAuth` to process sync-user and any client-side redirects to settle before assertions
- Tests run sequentially (`workers: 1`) for reliability

---

## References

- [MSW Documentation](../msw.md)
- [Contract Tests](contract-tests.md) — for testing real backend responses
