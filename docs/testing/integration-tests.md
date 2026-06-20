# Integration Tests

Integration tests cover full UI flows using a real dev server with MSW intercepting HTTP requests. They are the primary layer for verifying feature behavior (33 tests total).

---

## How They Work

The dev server runs with `NEXT_PUBLIC_ENABLE_MSW=true` and Playwright uses `serviceWorkers: 'allow'`. MSW's service worker intercepts all backend requests in the browser. There are no real backend calls.

**Two mechanisms for controlling MSW state:**

- **Pre-navigation** (`page.addInitScript`): set `window.__mswInitScenario` before the page loads. Used by `gotoAuthenticated`.

- **Post-navigation** (`page.evaluate`): call `window.__setErrorScenario('UPLOAD_500')` after navigating but before the action that triggers the request. Used by all error injection helpers.

**Auto-reset:** `tests/fixtures.ts` extends Playwright's `page` fixture to call `__resetErrorScenario()`, `__resetMockUser()`, and `__resetNotifications()` after every test.

---

## Running

```bash
npm run test:integration
```

No credentials required. If `AUTH0_TEST_EMAIL`/`AUTH0_TEST_PASSWORD` are not set, the auth setup saves an empty session state — integration tests still run.

---

## Test Files

| File | Tests | What it covers |
|------|-------|----------------|
| `redirects.spec.ts` | 3 | `useAuth` client-side redirects: pending user → /onboarding, stays on /onboarding, NEW user on private route → /onboarding |
| `sync-user-errors.spec.ts` | 5 | 401 → /session-expired, 500/503 → error UI + retry, 403 → error without redirect |
| `onboarding.spec.ts` | 5 | Happy path, form validation per step, step persistence, avatar errors, patch errors |
| `create-post.spec.ts` | 6 | Happy path, form validation, navigation, error handling, slow upload spinner, mobile viewport |
| `edit-post.spec.ts` | 5 | Pre-population, locked price with offers, form validation, image management, error handling |
| `notifications.spec.ts` | 4 | Happy path, empty state, delete flow (cancel/confirm/all), error handling with optimistic rollback |
| `profile.spec.ts` | 4 | Happy path view, contact edit, saved posts & offer, error handling |

Each test uses `test.step()` to group related assertions, visible as nested nodes in the Playwright HTML report.

---

## Helpers

### `tests/e2e/helpers/auth.ts`

```ts
gotoAuthenticated(page, path, scenario?)
// Navigate as a specific MSW user scenario (default: 'FULL').
// Sets scenario via page.addInitScript before navigation.
// Waits for MSW to start and network to idle.

setInitialSyncUserError(page, status: 401 | 403 | 500 | 503)
// Set a sync-user error before navigating (pre-navigation).

waitForMSW(page)
// Wait for MSWProvider's loading screen to disappear.
```

### `tests/integration/helpers/onboarding.ts`

```ts
uploadAvatar(page)
fillUsername(page, value)
fillBio(page, value)
submitForm(page)
waitForToast(page, text, timeout?)
expectError(page, text)
```

### `tests/integration/helpers/form-errors.ts`

```ts
setAvatarError(page, status: 401 | 422 | 500)
setAvatarNetwork(page)
setAvatarSlow(page)
setPatchError(page, status: 409 | 500)
resetErrorScenario(page)
```

### `tests/integration/helpers/create-post.ts`

```ts
openModal(page)
clickNext(page)
clickBack(page)
clickPublish(page)
fillStep1(page, { title, price, description? })
uploadPhotos(page, count?)
selectRequiredTags(page)
setUploadError(page, status: 401 | 500)
setCreateError(page, status: 401 | 500)
setPatchTagsError(page, status: 401 | 500)
```

### `tests/integration/helpers/edit-post.ts`

```ts
openEditModal(page)
openEditModalForPost(page, title)
clickSave(page)
fillEditTitle(page, value)
fillEditPrice(page, value)
uploadEditPhotos(page, count?)
waitForImageRequest(page, method)
assertNoImageRequest(page, action)
setPatchPostError(page, status: 401 | 500)
setDeleteImageError(page, status: 401 | 500)
setAppendImageError(page, status: 401 | 500)
```

### `tests/integration/helpers/notifications.ts`

```ts
getCards(page)                          // Locator for [data-testid="notification-card"]
deleteCardAt(page, idx)                 // Click trash button on nth card
confirmDelete(page)                     // Click "Eliminar" in the confirm dialog
cancelDelete(page)                      // Click "Cancelar"
deleteAll(page)                         // Click "Borrar todas" + confirm
setDeleteError(page, scenario)          // Inject NOTIF_DELETE_500 / NOTIF_DELETE_ALL_500
resetNotificationsList(page, list?)     // Reset in-memory notifications via window.__resetNotifications
```

### `tests/integration/helpers/profile.ts`

```ts
openContactEditor(page)     // Click "Editar" in the Contacto section
openZoneEditor(page)        // Click "Editar" in the Zona section
openSavedSheet(page)        // Click "Ver guardados"
getSavedCards(page)         // Locator for [data-testid="saved-post-card"]
removeCardAt(page, idx)     // Click "Quitar de guardados" on nth card
openOfferFormAt(page, idx)  // Click "Hacer oferta" on nth card
setPatchError(page, scenario)
```

---

## Fixture

Import `test` from `tests/fixtures.ts` instead of `@playwright/test`:

```ts
import { test } from '../fixtures';
import { expect } from '@playwright/test';
```

Tests in `redirects.spec.ts` and `sync-user-errors.spec.ts` import directly from `@playwright/test` because they use pre-navigation init scripts and don't need post-test cleanup.

---

## References

- [MSW Documentation](../msw.md)
- [tests/SCOPE.md](../../tests/SCOPE.md)
