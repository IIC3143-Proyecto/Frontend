# E2E Testing - Create Post

22 tests for the multi-step post creation modal (`e2e/create-post.spec.ts`).

> All mocking uses `page.route()` — `serviceWorkers: 'block'` in `playwright.config.ts` prevents MSW from intercepting during tests.

---

## Fixtures

| File | Purpose |
|------|---------|
| `e2e/fixtures/avatar.webp` | Pre-converted WebP image used as a stand-in for clothing photos |

---

## Test Helpers

### `e2e/helpers/create-post.ts` — Route mocks

| Helper | Description |
|--------|-------------|
| `mockCreatePostHandlers(page)` | Success handlers for `GET /tags` (200), `POST /upload` (201), `POST /post` (201). Call in `beforeEach` before navigating. |
| `mockUploadError(page, status)` | Overrides `POST /upload` to return 401 or 500 |
| `mockUploadNetwork(page)` | Aborts the upload request (network failure) |
| `mockUploadSlow(page)` | Delays the upload response 2s then returns success |
| `mockPostError(page, status)` | Overrides `POST /post` to return 401 or 500 |
| `mockPostNetwork(page)` | Aborts the post request (network failure) |

### `e2e/helpers/create-post.ts` — UI helpers

| Helper | Description |
|--------|-------------|
| `openModal(page)` | Clicks "Nueva Publicación" and asserts the dialog is visible |
| `clickNext(page)` | Clicks "Siguiente" |
| `clickBack(page)` | Clicks "Atrás" |
| `clickPublish(page)` | Clicks "Publicar" |
| `fillStep1(page, opts)` | Fills title, price, and optionally description on the first step |
| `uploadPhotos(page, count)` | Uploads `count` photos (default 3) via the sequential-unlock file input |
| `selectRequiredTags(page)` | Selects one Talla (M), one Condición (Nuevo), one Tipo de prenda (Camiseta) |
| `selectMultipleTags(page)` | Selects multiple Talla (M, L), one Condición, multiple Tipo de prenda |

---

## Test Coverage

`beforeEach`: registers mock handlers via `mockCreatePostHandlers`, navigates to `/test` as a `FULL` user via `gotoAuthenticated`, opens the modal.

### Desktop (1280px viewport) — 18 tests

| # | Name | Mock override | Key assertion |
|---|------|---------------|---------------|
| 1 | Publish with minimum required data | — | Toast `"Publicación creada"`; dialog closes |
| 2 | Validation: empty title | — | `"Título requerido"` |
| 3 | Validation: empty price | — | `"El precio debe ser mayor a 0"` |
| 4 | Validation: fewer than 3 photos | — | `"Debes subir al menos 3 fotos"` |
| 5 | Advance without description (optional) | — | Proceeds to step 2 without error |
| 6 | Validation: required tags skipped | — | Errors for Talla, Condición, Tipo de prenda |
| 7 | Multiple sizes and garment types | — | Multiple selections accepted without errors |
| 8 | Upload 401 → session-expired | `mockUploadError(401)` | Redirects to `/session-expired` |
| 9 | Upload 500 → error toast | `mockUploadError(500)` | Toast `"Error al subir fotos"` |
| 10 | Upload network failure | `mockUploadNetwork()` | Toast `"Error de red"` |
| 11 | Upload slow → loading state | `mockUploadSlow()` | Button shows `"Subiendo…"` during upload |
| 12 | POST /post 401 → session-expired | `mockPostError(401)` | Redirects to `/session-expired` |
| 13 | POST /post 500 → error toast | `mockPostError(500)` | Toast `"Error"` |
| 14 | POST /post network failure | `mockPostNetwork()` | Toast `"Error de red"` |
| 15 | Cancel closes modal | — | Dialog not visible |
| 16 | Back navigation | — | Step decrements correctly |
| 17 | No Atrás button on first step | — | `"Atrás"` not present on step 1 |
| 18 | Reset on close and reopen | — | Reopened form is empty |

### Mobile (390px viewport) — 3 tests

| # | Name | Mock override | Key assertion |
|---|------|---------------|---------------|
| 19 | Publish across all 5 steps | — | Toast `"Publicación creada"`; dialog closes |
| 20 | Validation: fewer than 3 photos on step 2 | — | `"Debes subir al menos 3 fotos"` |
| 21 | Back from step 3 to step 2 (photos) | — | Photo grid visible again |

---

## Writing New Tests

1. **`mockCreatePostHandlers(page)` before `gotoAuthenticated`** in `beforeEach` — the `/tags` fetch fires immediately on mount; registering after navigation misses it.
2. **Use `gotoAuthenticated(page, '/test', 'FULL')`** instead of navigating directly — mocks `sync-user` and waits for `AuthWrapper` to resolve.
3. **Override with error mocks in the test body** — `page.route()` is LIFO; the last registered handler takes precedence.
4. **Call `openModal(page)` in `beforeEach`**, not per test, to keep tests focused on the step being verified.
5. **Use `waitForToast`** from `e2e/helpers` for Sonner notifications.
6. **Avoid fixed `sleep`** — use `await expect(...).toBeVisible({ timeout })` instead.

---

## References

- [Auth0 E2E Tests](./auth0-e2e-tests.md) — auth helpers (`gotoAuthenticated`, `mockSyncUser`)
- [MSW](../msw.md)
- [Onboarding E2E](./onboarding-e2e.md)
