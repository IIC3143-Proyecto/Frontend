# Refactor PRs — API layer extraction

All PRs target `dev`. Rebase each branch on `origin/dev` before opening. Open in the order listed below.

---

## Merge order

```
1. refactor/api-auth
2. refactor/api-metro   (can be opened in parallel with api-auth)
3. refactor/api-tags
4. refactor/api-posts
```

After each PR merges, rebase the next branch on the updated `origin/dev` before opening its PR.

---

## PR 1 — `refactor/api-auth`

**Title:** `refactor(api-auth): extract syncUser to src/lib/api/auth.ts`

**Description:**

Moves the inline `fetch('/auth/sync-user')` call out of `use-auth.ts` into a dedicated `src/lib/api/auth.ts` module. Extracts `SyncUserResponse` to `src/lib/types/auth.ts` and updates `mock-users.ts` to import from there instead of defining it locally.

No behavioral changes.

**Files changed:**
- `src/lib/api/auth.ts` *(new)*
- `src/lib/types/auth.ts` *(new)*
- `src/hooks/use-auth.ts`
- `src/lib/msw/mocks/data/mock-users.ts`

---

## PR 2 — `refactor/api-metro`

**Title:** `refactor(api-metro): extract fetchMetroStations to src/lib/api/metro.ts`

**Description:**

Moves the inline fetch call from `use-metro-stations.ts` into a dedicated `src/lib/api/metro.ts` module. Extracts the `Station` and `MetroLine` types to `src/lib/types/metro.ts`.

No behavioral changes.

**Files changed:**
- `src/lib/api/metro.ts` *(new)*
- `src/lib/types/metro.ts` *(new)*
- `src/hooks/use-metro-stations.ts`

---

## PR 3 — `refactor/api-tags`

**Title:** `refactor(api-tags): extract fetchTags to src/lib/api/tag.ts, fix endpoint path`

**Description:**

Moves the inline fetch from `use-tags.ts` into `src/lib/api/tag.ts`, using the shared `BASE` constant from `src/lib/api/base.ts`. Fixes the endpoint from the incorrect `*/tags` to the documented `*/api/tag`.

Splits the MSW tags mock out of `handlers/posts.ts` into its own `handlers/tags.ts` and `data/tags.ts`. Registers `tagsHandlers` in `handlers/index.ts`. Updates the e2e `create-post` helper to match the corrected endpoint pattern.

**Files changed:**
- `src/lib/api/base.ts` *(new)*
- `src/lib/api/tag.ts` *(new)*
- `src/lib/types/tag.ts` *(new)*
- `src/lib/msw/mocks/data/tags.ts` *(new)*
- `src/lib/msw/mocks/handlers/tags.ts` *(new)*
- `src/hooks/use-tags.ts`
- `src/lib/msw/mocks/handlers/index.ts`
- `src/lib/msw/mocks/handlers/posts.ts`
- `e2e/helpers/create-post.ts`

---

## PR 4 — `refactor/api-posts`

**Title:** `refactor(api-posts): extract post API calls to src/lib/api/post.ts`

**Description:**

Moves all inline fetch calls from `use-create-post.ts` into a dedicated `src/lib/api/post.ts` module. Uses the shared `BASE` constant (with trailing-slash normalization) for all requests.

Adds `getPostsBySeller(sellerId, accessToken)` for the vendor posts listing feature. Aligns `PostDto` with the documented backend schema and exports a `Post` alias for use in UI components. Moves MSW mock post data to `data/posts.ts` and replaces the WIP mock handler with a properly authenticated `GET /api/post/seller/:id_user` handler.

> **Note:** `GET /api/post/seller/{id_user}` is not yet in `docs/backend.md` — pending backend documentation.

**Files changed:**
- `src/lib/api/post.ts` *(new)*
- `src/lib/types/post.ts` *(new)*
- `src/lib/types/post-status.enum.ts` *(new)*
- `src/lib/msw/mocks/data/posts.ts` *(new)*
- `src/hooks/use-create-post.ts`
- `src/hooks/use-posts.ts`
- `src/lib/msw/mocks/handlers/posts.ts`
- `src/lib/utils.ts`
