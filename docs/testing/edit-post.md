# Integration Tests — Edit Post

~20 tests for the `PostEditModal` accordion form (`tests/integration/edit-post.spec.ts`).

---

## Setup

`beforeEach`: `gotoAuthenticated(page, '/posts', 'FULL')` + `openEditModal(page)`

The edit button (`aria-label="Editar"`) lives inside each `SaleCard`. `openEditModal` clicks the first available one (post_1: Vintage 90s Jacket, 2 existing photos). Use `openEditModalForPost(page, title)` to target a specific post.

---

## Helpers (`tests/integration/helpers/edit-post.ts`)

### UI helpers

| Helper | Description |
|--------|-------------|
| `openEditModal(page)` | Clicks first `Editar` button, asserts dialog visible |
| `openEditModalForPost(page, title)` | Targets a specific post by title |
| `clickSave(page)` | Clicks "Guardar Cambios" |
| `openSection(page, name)` | Expands accordion section matching name (regex) |
| `fillEditTitle(page, value)` | Opens Título section + fills input |
| `fillEditPrice(page, value)` | Opens Precio section + fills input |
| `uploadEditPhotos(page, count?)` | Opens Fotos section + uploads photos via file input |

### Network verification helpers

| Helper | Description |
|--------|-------------|
| `waitForImageRequest(page, method)` | Returns Promise of first matching DELETE or PATCH request to `/api/image/post/*` |
| `assertNoImageRequest(page, action)` | Runs `action()` and asserts no image API call fires within 3s |

### Error scenario setters

| Helper | Scenario |
|--------|----------|
| `setPatchPostError(page, 401\|500)` | `PATCH_POST_401 / PATCH_POST_500` |
| `setPatchPostNetwork(page)` | `PATCH_POST_NETWORK` |
| `setDeleteImageError(page, 401\|500)` | `DELETE_IMAGE_401 / DELETE_IMAGE_500` |
| `setDeleteImageNetwork(page)` | `DELETE_IMAGE_NETWORK` |
| `setAppendImageError(page, 401\|500)` | `APPEND_IMAGE_401 / APPEND_IMAGE_500` |
| `setAppendImageNetwork(page)` | `APPEND_IMAGE_NETWORK` |

---

## Mock data

`post_1` (Vintage 90s Jacket): PUBLISHED, 2 existing photos — used by `openEditModal`  
`post_2` (Levis 501 Custom): PUBLISHED, `offersCount: 2` — used for locked-price tests  
MSW stub for `GET /api/post/:id/tags` returns: `{ Talla: ['M'], Condición: 'Como nuevo', 'Tipo de prenda': ['Camiseta'], Marca: [], Color: [], Género: [], Estilo: [], Temporada: [] }`

---

## Test Coverage

### Happy path

| # | Test | Key assertion |
|---|------|---------------|
| 1 | Save changes successfully | Toast "Publicación actualizada"; dialog closes |
| 2 | Pre-populate basic fields | Title and price inputs are not empty on open |
| 3 | Pre-populate tags from fetchPostTags | Talla M selected, Condición "Como nuevo" checked, Tipo "Camiseta" selected |
| 4 | Reset on close and reopen | Title reverts to original after cancel + reopen |

### Locked price

| # | Test | Key assertion |
|---|------|---------------|
| 5 | Locked banner + disabled price | Banner visible; price input disabled |
| 6 | Can save with locked price | Toast success after editing title only |

### Validation

| # | Test | Key assertion |
|---|------|---------------|
| 7 | Empty title | Error "Título requerido" |
| 8 | Empty price | Error "El precio debe ser mayor a 0" |
| 9 | Required tags empty | Error "Selecciona al menos una talla" |
| 10 | Fewer than 3 photos | Error "Debes tener al menos 3 fotos" |

### PATCH /api/post errors

| # | Test | Scenario | Key assertion |
|---|------|----------|---------------|
| 11 | 401 | `PATCH_POST_401` | Redirect `/session-expired` |
| 12 | 500 | `PATCH_POST_500` | Toast "Error al guardar cambios" |
| 13 | network | `PATCH_POST_NETWORK` | Toast "Error de red" |

### Photo endpoint correctness

| # | Test | Key assertion |
|---|------|---------------|
| 14 | No photo changes → no image API calls | `assertNoImageRequest` passes |
| 15 | Delete existing → DELETE with correct URL | Body `{urls: [deleted_url]}` |
| 16 | Delete existing → kept photos NOT in DELETE body | Other URLs absent from body |
| 17 | Add new photo → PATCH append called | `waitForImageRequest('PATCH')` resolves |
| 18 | DELETE 401 | Redirect `/session-expired` |
| 19 | DELETE 500 | Toast "Error al guardar cambios" |
| 20 | PATCH append 401 | Redirect `/session-expired` |

---

## Writing New Tests

1. Import `test` from `tests/fixtures.ts` for auto-reset between tests.
2. `gotoAuthenticated(page, '/posts', 'FULL')` navigates as a full user with mock data.
3. Call error scenario setters **after** navigation but **before** the action that triggers the request.
4. `openSection` uses regex matching — partial names work (e.g., `'Fotos'`, `'esenciales'`).
5. Photo interactions require the section to be open first.

---

## References

- [Integration Tests](integration-tests.md)
- [MSW](../msw.md)
- [PostEditModal component](../components/cards/post-edit-modal.md)
