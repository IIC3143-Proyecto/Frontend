# Integration Tests — Edit Post

5 tests for the `PostEditModal` accordion form (`tests/integration/edit-post.spec.ts`). Each test groups related assertions in `test.step()` blocks, visible as nested nodes in the Playwright HTML report.

---

## Setup

`beforeEach`: `gotoAuthenticated(page, '/posts', 'FULL')` + `openEditModal(page)`

The edit button (`aria-label="Editar"`) lives inside each `SaleCard`. `openEditModal` clicks the first available one (post_1: Vintage 90s Jacket, 3 existing photos). Use `openEditModalForPost(page, title)` to target a specific post.

---

## Tests

### `pre-population`
- title loaded from post data
- price loaded from post data
- existing photos visible
- correct tags selected

### `precio bloqueado con ofertas`
- price field disabled when post has active offers
- "Precio bloqueado" banner visible

### `form validation`
- empty title → error
- empty price → error
- required tags missing → error
- fewer than 3 photos → error

### `image management`
- delete photo → DELETE request with correct URL
- add photo → PATCH append request fires
- no photo changes → no image API calls

### `error handling`
- `PATCH_POST_401` → redirect to /session-expired
- `PATCH_POST_500` → error toast
- `DELETE_IMAGE_500` → error toast
- `APPEND_IMAGE_500` → error toast

---

## Mock data

`post_1` (Vintage 90s Jacket): PUBLISHED, 3 existing photos — used by `openEditModal`
`post_2` (Levis 501 Custom): PUBLISHED, `offersCount: 2`, 3 existing photos — used for locked-price tests

---

## Helpers (`tests/integration/helpers/edit-post.ts`)

See [integration-tests.md](integration-tests.md) for the full helper API.

---

## References

- [Integration Tests](integration-tests.md)
