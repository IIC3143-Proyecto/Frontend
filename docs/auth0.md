# Auth0 Integration & Route Protection

This document explains how Auth0 authentication and route protection work in VTRNA.

---

## Auth0 Authentication Flow

### 1. Login
```
User → /login → Auth0 login page → User enters credentials
    ↓
Auth0 validates → Redirects to /callback → Proxy captures and syncs → User logged in
```

### 2. Session Management
```
User Context (Auth0) ← useAuth() hook → DB User Context (VTRNA API)
         ↓                                        ↓
   JWT Token                              onboardingCompleted
   user.sub                                    age, bio, etc
```

### 3. Logout
```
User → /logout → Auth0 logout → Clears session → Redirects to home
```

---

## What is the Proxy (Middleware in Next.js 16)

In Next.js 16.x there is no `middleware.ts`. Instead, **`proxy.ts`** is used, which acts as a server middleware.

### Location
`src/proxy.ts`

### Responsibilities
1. **Intercept Auth0 callbacks** (`/login`, `/logout`, `/callback`)
2. **Validate sessions** on private routes
3. **Redirect to login** if no session and accessing private route
4. **Add `returnTo` parameter** to redirect post-login

### Configuration
```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```
This regex intercepts ALL routes except Next.js static assets.

---

## Public, Private, and Auth Routes

### Public Routes (accessible without session)
```
/                          Home
/about-us                  About page
/faq                       FAQ page
/login                     Auth0 login (proxy)
/logout                    Logout (proxy)
/callback                  Auth0 callback (proxy)
```

### Auth Routes (handled by proxy)
```
/login                     GET: Redirects to Auth0 login page
/logout                    GET: Initiates logout at Auth0
/callback                  GET: Auth0 redirects here after login
```

### Private Routes (require session)
```
/profile                   User profile
/profile/metrics           User metrics
/profile/saved             Saved publications
/profile/settings          Profile settings
/notifications             Notifications
/publications              User publications
/shopping-history          Purchase history
/onboarding                Pending onboarding
```

### Protection Logic
```typescript
// In src/proxy.ts
const privateRoutes = [
  '/notifications',
  '/profile',
  '/publications',
  '/shopping-history',
  '/onboarding'
];

if (isPrivateRoute && !session) {
  // Redirects to /login with returnTo
  redirect(`/login?returnTo=${pathname}`);
}
```

---

## `useAuth()` Hook

Used in client components to access authentication state.

### Location
`src/hooks/use-auth.ts`

### Usage
```tsx
import { useAuth } from '@/hooks/use-auth';

export function Profile() {
  const { 
    user,           // Auth0 user object (JWT claims)
    dbUser,         // VTRNA DB user (onboardingCompleted, etc)
    isLoading,      // true while Auth0 + VTRNA sync loading
    isAuthenticated,// true if Auth0 user present
    syncError       // Error if /auth/sync-user fails
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Onboarding: {dbUser?.onboardingCompleted ? 'Complete' : 'Pending'}</p>
    </div>
  );
}
```

### States
| State | Meaning |
|-------|---------|
| `isLoading` | Auth0 or VTRNA API still loading |
| `isAuthenticated` | Valid JWT from Auth0 |
| `user` | Info from Auth0 (sub, email, name) |
| `dbUser` | Info from VTRNA (onboardingCompleted) |
| `syncError` | Error in /auth/sync-user |

### Internal Flow
```
1. useAuth() initializes
2. Reads Auth0 session (useUser from Auth0)
3. If user exists, fetch /auth/sync-user
4. Handles automatic redirects:
   - If 401 error: auto logout
   - If onboarding pending: redirects to /onboarding
   - If onboarding complete on /onboarding: redirects to /profile
```

---

## How to Protect Routes with `auth-wrapper`

### Location
`src/components/auth/auth-wrapper.tsx`

### Purpose
Wrapper component that validates session on client BEFORE rendering.

### Usage
```tsx
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import Profile from './profile-content';

// In src/app/(main-app)/profile/page.tsx
export default function Page() {
  return (
    <AuthWrapper>
      <Profile />
    </AuthWrapper>
  );
}
```

### What It Does
```
1. Renders useAuth() hook internally
2. Shows spinner while loading
3. If not authenticated: error UI (shouldn't reach here due to proxy)
4. If authenticated: renders children
```

### Important Note
**The proxy already protects on server**, so `auth-wrapper` is additional defense on client.

---

## Auth0 ↔ VTRNA Synchronization

### Endpoint
`GET /auth/sync-user` (src/app/auth/sync-user/route.ts)

### Purpose
After Auth0 validates the user, VTRNA syncs user data (onboarding status, etc).

### Flow
```
1. User successfully logs in with Auth0
2. useAuth() hook detects new user
3. Fetch to GET /auth/sync-user
4. Backend responds with DBUser (onboardingCompleted, bio, etc)
5. useAuth() validates onboarding and redirects accordingly
```

### Expected Response
```json
{
  "id": "auth0|user123",
  "email": "user@example.com",
  "name": "User Name",
  "username": "username",
  "bio": "My bio",
  "age": 25,
  "photoUrl": "https://...",
  "onboardingCompleted": true,
  "contact_info": {
    "phone": "+1234567890",
    "email": "user@example.com",
    "instagram": "@user"
  }
}
```

---

## Environment Variables

See `.env.local`:

```env
# Auth0 Configuration
AUTH0_SECRET=<generated-secret>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=dev-i2ktb2b4dz1j8r5t.us.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
AUTH0_ISSUER_BASE_URL=https://dev-i2ktb2b4dz1j8r5t.us.auth0.com
AUTH0_AUDIENCE=https://vtrna-api

# Test Credentials
AUTH0_TEST_EMAIL=test@example.com
AUTH0_TEST_PASSWORD=password
```

### Note
- `AUTH0_DOMAIN` and `AUTH0_ISSUER_BASE_URL` must match
- `AUTH0_AUDIENCE` is used to obtain JWT (not opaque tokens)

---


## Testing Auth0

See `docs/testing/auth0-e2e-tests.md` for E2E tests that validate this flow.

---

## Troubleshooting

### Error: "AuthorizationParameters is not defined"
Make sure `src/lib/auth0.ts` uses `authorizationParameters` (not `authorizationParams`).

### Error: "Module not found: Can't resolve './test'"
Clean cache: `rm -rf .next && npm run build`

### /test 404 during login
Verify that `AUTH0_ISSUER_BASE_URL` is correct in `.env.local`.

### User doesn't sync with VTRNA
Verify that `/auth/sync-user` is available and responds correctly.

---

## References

- [Auth0 Next.js Quickstart](https://auth0.com/docs/quickstart/webapp/nextjs)
- [nextjs-auth0 SDK Docs](https://auth0.github.io/nextjs-auth0/)
- [Next.js 16 Proxy Documentation](https://nextjs.org/docs)
