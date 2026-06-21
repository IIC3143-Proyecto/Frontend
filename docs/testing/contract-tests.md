# Contract Tests

Contract tests validate that the real backend returns the response shapes the frontend expects, and detect when pending endpoints get implemented.

---

## Purpose

Two goals:

1. **Shape validation** (`api-shapes.spec.ts`) — assert that implemented endpoints return the expected DTO structure. If the backend changes a field name or type, these tests catch it.

2. **Pending endpoint detection** (`unimplemented.spec.ts`) — assert that not-yet-implemented endpoints return 404. When the backend ships an endpoint, this test *fails*, which is the intended signal to the frontend team.

---

## Running

```bash
BACKEND_API_URL=https://your-backend.onrender.com npm run test:contract
```

Requires in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
AUTH0_TEST_EMAIL=user@example.com
AUTH0_TEST_PASSWORD=yourpassword
ENABLE_TEST_ENDPOINTS=true
```

Without credentials, `contract-setup` skips obtaining a token, and all contract tests self-skip.

---

## How it Works

1. **`tests/contract/auth.setup.ts`** — uses the active Auth0 session (from the main auth setup) to call `/api/test/access-token` and write a JWT to `tests/contract/.auth/token.json`
2. **`api-shapes.spec.ts`** and **`unimplemented.spec.ts`** — read the token in `beforeAll`, skip in `beforeEach` when the token is missing, and include `Authorization: Bearer <token>` in every request

---

## Interpreting a Failing `unimplemented.spec.ts` Test

When a test in `unimplemented.spec.ts` fails, it means the backend now returns something other than 404 for that endpoint. This is the intended trigger. Do the following:

1. **Move the test** to `api-shapes.spec.ts` — add shape assertions for the new response
2. **Update the MSW handler** — replace the 404 stub with a realistic response
3. **Remove the `.fixme`** from the related integration test (if one exists)
4. **Delete the failing entry** from `unimplemented.spec.ts`

---

## Covered Endpoints

### `api-shapes.spec.ts`
| Endpoint | Assertions |
|----------|-----------|
| `GET /api/auth/sync-user` | UserDto shape, 401 without token |
| `GET /api/tag` | TagsByCategoryDto shape, 401 without token |
| `POST /api/post` | PostDto shape (id, imagesUrls), 401 without token |
| `PATCH /api/post` | PostDto shape, 401 without token |
| `DELETE /api/post/:id` | PostDto with `isDeleted: true`, 401 |
| `POST /api/image/user/:id` | `{ message }` shape, 201, 401 |
| `POST /api/image/post/:id` | `{ message }` shape, 201, 401 |
| `GET /api/post/:id` | PostDto shape, 401 |
| `GET /api/post/saved/:id` | PostDto array, 401 |
| `DELETE /api/image/post/:id` | `{ message }`, 401 |
| `DELETE /api/image/user/:id` | `{ message }`, 401 |
| `GET /api/user/:id` | UserDto shape, 401 |

### `unimplemented.spec.ts` (expect 404)
| Endpoint | Pending issue |
|----------|--------------|
| `GET /api/post/user/:id` | #22 |
| `PATCH /api/user/:id` | #46 |
| `GET /api/post/search` | #47 |
| `PATCH /api/post/:id/tags` | #48 |

---

## Security Note

`/api/test/access-token` is only available when `NODE_ENV=development` **and** `ENABLE_TEST_ENDPOINTS=true`. It should never be reachable in production or staging.
