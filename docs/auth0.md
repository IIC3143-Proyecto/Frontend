# Auth0 Integration & Route Protection

This document explains how Auth0 authentication and route protection work in VTRNA.

---

## Auth0 Authentication Flow

### 1. Login
```
User → /login → Auth0 login page → User enters credentials
    ↓
Auth0 validates → Redirects to /callback → auth0.ts onCallback
    → /auth/loading?next=/destination
    → loading page calls /auth/sync-user (persists onboardingCompleted to session)
    → redirects to destination
```

### 2. Session Management
```
Auth0 session (appSession cookie, JWE-encrypted)
    ↓
proxy.ts reads session server-side → server-side onboarding redirects
    ↓
useAuth() hook reads session client-side → client-side fallback redirects
    ↓
/auth/sync-user BFF calls backend → returns UserDto + onboardingCompleted
```

### 3. Logout
```
User → /logout → Auth0 logout → Clears session → Redirects to home
```

---

## Proxy (`src/proxy.ts`)

In Next.js 16.x there is no `middleware.ts`. Instead, **`proxy.ts`** acts as server middleware.

### Responsibilities

1. **Validate sessions** on private routes — redirect to `/login?returnTo=` if no session
2. **Server-side onboarding redirects** based on `session.user.onboardingCompleted`:
   - `false` + private route (not `/onboarding`) → redirect to `/onboarding`
   - `true` + on `/onboarding` → redirect to `/profile`
   - `undefined` (first login, not yet synced) → let through; `useAuth` handles it client-side

### Private Routes

```typescript
const privateRoutes = [
  '/feed', '/notifications', '/profile',
  '/offers', '/onboarding', '/posts'
];
```

### Configuration

```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## `/auth/loading` Page

Added to persist `onboardingCompleted` in the session before redirecting. Without this, the proxy cannot perform server-side onboarding redirects on the first visit after login.

**Flow:**
1. Auth0 callback redirects to `/auth/loading?next=/destination`
2. Page calls `/auth/sync-user`
3. BFF calls the backend, then calls `auth0.updateSession()` to write `onboardingCompleted` into the session cookie
4. Page redirects to `next` (validated to be a same-origin path)

---

## `useAuth()` Hook

`src/hooks/use-auth.ts` — client-side complement to the proxy.

### Return Values

| Value | Type | Description |
|-------|------|-------------|
| `user` | Auth0 user \| undefined | Auth0 JWT claims (sub, email, name) |
| `dbUser` | `{ id, onboardingCompleted }` \| undefined | Data from `/auth/sync-user` |
| `isLoading` | boolean | true while Auth0 or sync-user is loading |
| `isAuthenticated` | boolean | true if Auth0 user is present |
| `syncError` | `SyncError` \| null | Error from `/auth/sync-user` |

### Internal Flow

1. `useUser()` (Auth0 SDK) provides the Auth0 session
2. When `user` is present, TanStack Query fetches `/auth/sync-user` (queryKey `['dbUser', user.sub]`)
3. `useEffect` runs when `dbUser` is available:
   - `onboardingCompleted === false` + not on `/onboarding` → `router.push('/onboarding')`
   - `onboardingCompleted === true` + on `/onboarding` → `router.push('/profile')`
4. Retry: 401 errors are not retried; other errors retry up to 2 times

### Usage

```tsx
const { user, dbUser, isLoading, isAuthenticated, syncError } = useAuth();
```

---

## `AuthWrapper` Component

`src/components/auth/auth-wrapper.tsx` — wraps private page content.

- Renders `useAuth()` internally
- Shows a loading spinner while `isLoading`
- Shows an error UI if `syncError` is present (with retry button)
- Renders children only when authenticated and sync complete

The proxy already protects routes server-side; `AuthWrapper` is an additional client-side guard and the error display layer.

---

## `/auth/sync-user` BFF

`src/app/auth/sync-user/route.ts`

Calls the backend with the Auth0 access token, transforms the response, and calls `auth0.updateSession()` to persist `onboardingCompleted` in the session cookie.

### Response Shape (`SyncUserResponse`)

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "username": "username",
  "bio": "My bio",
  "photoUrl": "https://...",
  "status": "Activo",
  "providerAuth0": "auth0|xxx",
  "onboardingCompleted": true,
  "createdAtUtcMinus3": "2026-01-01T00:00:00Z",
  "updatedAtUtcMinus3": "2026-01-01T00:00:00Z",
  "posts": [],
  "interactions": []
}
```

`onboardingCompleted` is derived in the BFF as `!!user.bio` (pending a dedicated backend field).

---

## Environment Variables

```env
# Auth0 Configuration
AUTH0_SECRET=<generated-secret>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=dev-i2ktb2b4dz1j8r5t.us.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
AUTH0_ISSUER_BASE_URL=https://dev-i2ktb2b4dz1j8r5t.us.auth0.com
AUTH0_AUDIENCE=https://vtrna-api

# Test Credentials (for E2E and contract tests)
AUTH0_TEST_EMAIL=test@example.com
AUTH0_TEST_PASSWORD=password
```

- `AUTH0_DOMAIN` and `AUTH0_ISSUER_BASE_URL` must match
- `AUTH0_AUDIENCE` ensures JWT tokens are returned (not opaque tokens)

---

## Testing

See [docs/testing/e2e-tests.md](testing/e2e-tests.md) for E2E tests that validate this flow.

---

## Troubleshooting

### Error: "AuthorizationParameters is not defined"
Make sure `src/lib/auth0.ts` uses `authorizationParameters` (not `authorizationParams`).

### User doesn't sync with VTRNA
Verify that `/auth/sync-user` is available and responds correctly. Check that `AUTH0_AUDIENCE` is set — without it the SDK returns opaque tokens that the backend cannot validate.

### Stuck on `/auth/loading`
The loading page calls `/auth/sync-user`. If sync-user fails (network error or backend down), it redirects to `/`. Check the browser console for the error.

---

## References

- [Auth0 Next.js SDK Docs](https://auth0.github.io/nextjs-auth0/)
- [Next.js 16 Documentation](https://nextjs.org/docs)
