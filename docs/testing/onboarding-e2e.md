# E2E Testing - Onboarding Form

12 tests for the onboarding profile completion flow (`e2e/onboarding.spec.ts`).

> All mocking uses `page.route()` — `serviceWorkers: 'block'` in `playwright.config.ts` prevents Auth0's service worker from interfering, so MSW does not run during tests.

---

## Fixtures

| File | Purpose |
|------|---------|
| `e2e/fixtures/avatar.webp` | Pre-converted WebP image used for avatar upload tests |

---

## Test Helpers

### `e2e/helpers.ts` — Form interaction

| Helper | Description |
|--------|-------------|
| `uploadAvatar(page)` | Sets the file input to `fixtures/avatar.webp` and waits for the blob preview |
| `fillUsername(page, value)` | Fills the username input |
| `fillBio(page, value)` | Fills the bio textarea |
| `submitForm(page)` | Clicks `"Guardar perfil"` |
| `waitForToast(page, text, timeout?)` | Asserts a `[data-sonner-toast]` with `text` becomes visible |
| `expectError(page, message)` | Asserts a validation or server error message is visible |

### `e2e/helpers/form-errors.ts` — Mock error conditions

| Helper | Description |
|--------|-------------|
| `mockDefaultHandlers(page)` | Success handlers for `POST /profile/avatar` (201) and `PATCH /user` (200). Call in `beforeEach`. |
| `mockAvatarSuccess(page)` | Re-registers the avatar success handler on top of the stack |
| `mockAvatarError(page, status)` | Fulfills `POST /profile/avatar` with 401, 422, or 500 |
| `mockAvatarNetwork(page)` | Aborts the avatar request (network failure) |
| `mockAvatarSlow(page)` | Delays avatar response 2s then returns success |
| `mockPatchError(page, status)` | Fulfills `PATCH /user` with 409 or 500 |

---

## Test Coverage

`beforeEach`: registers default handlers via `mockDefaultHandlers`, navigates to `/onboarding` as a `NEW` user via `gotoAuthenticated`.

| # | Name | Mock | Key Assertion |
|---|------|------|---------------|
| 1 | Happy path | default | Toast `"Perfil actualizado!"` |
| 2 | Empty form | — (client) | `"Avatar es requerido"` and `"Username es requerido"` |
| 3 | Avatar required | — (client) | `"Avatar es requerido"` only |
| 4 | API 401 | `mockAvatarError(401)` | Redirects to `/session-expired` |
| 5 | API 422 | `mockAvatarError(422)` | `"File must be a WebP image"` |
| 6 | API 409 | `mockPatchError(409)` | `"Username already taken"` on field |
| 7 | API 500 | `mockAvatarError(500)` | Toast `"Internal server error"` |
| 8 | Network error | `mockAvatarNetwork()` | Toast `"Error de red"` |
| 9 | Slow response | `mockAvatarSlow()` | Button shows `"Guardando..."`, then success toast |
| 10 | Retry after error | `mockAvatarError(500)` → `mockAvatarSuccess()` | Fails first, succeeds on retry |
| 11 | Field persistence | `mockAvatarError(500)` | Username and bio retain values after error |
| 12 | Avatar preview | — | `<img>` has `blob:` src after file selection |

---

## Writing New Tests

1. **`mockDefaultHandlers(page)` antes de `gotoAuthenticated`** en `beforeEach` — registra los handlers de éxito para que el form funcione por defecto.
2. **Usar `gotoAuthenticated(page, '/onboarding', 'NEW')`** en lugar de navegar directamente — mockea `sync-user` y espera que `AuthWrapper` resuelva.
3. **Overrides de error en el test body**: `page.route()` es LIFO, el último handler registrado tiene prioridad sobre el de `beforeEach`.
4. **`mockAvatarSuccess(page)` para restaurar éxito** dentro de un test — no usar `page.unroute()` (eliminaría también el handler del `beforeEach`).
5. **Fixtures binarios** en `e2e/fixtures/` referenciados con `path.join(__dirname, 'fixtures/filename')`.

---

## References

- [Auth0 E2E Tests](./auth0-e2e-tests.md) — auth helpers (`gotoAuthenticated`, `mockSyncUser`)
- [Testing Guide](./README.md)
