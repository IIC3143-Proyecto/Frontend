# Test Scope — VTRNA Frontend

| Feature                | Status | Spec                                    | Happy path | Sad / alternative paths                         | Out of scope (intentional)                        |
|------------------------|--------|-----------------------------------------|------------|-------------------------------------------------|---------------------------------------------------|
| Login / logout         | done   | e2e/auth.spec.ts                        | yes        | —                                               | MFA, social login                                 |
| Route protection       | done   | e2e/routes.spec.ts                      | yes        | unauthenticated redirect                        | Server-side redirect without flicker              |
| Onboarding redirects   | done   | integration/redirects.spec.ts           | yes        | pending user redirect, stays on /onboarding     | FULL user proxy redirect (requires live backend)  |
| Sync-user errors       | done   | integration/sync-user-errors.spec.ts    | —          | 401, 500, 503, 403, retry flow                  | Retry after 503 with new session                  |
| Onboarding             | done   | integration/onboarding.spec.ts          | yes        | validation, avatar errors, patch errors         | Other languages, non-WebP photos                  |
| Create post            | done   | integration/create-post.spec.ts         | yes        | validation, upload/create/tag errors, Gemini    | Draft posts, scheduled publishing, Gemini error   |
| Edit post              | done   | integration/edit-post.spec.ts           | yes        | validation, patch/delete/append errors          | Concurrency, version conflicts                    |
| Notifications          | done   | integration/notifications.spec.ts       | yes        | empty state, delete flow, delete errors         | Real-time, pagination                             |
| Profile (own)          | done   | integration/profile.spec.ts             | yes        | contact edit, saved posts & offer, patch error  | Style preferences, metrics, avatar edit           |
| Profile view           | done   | integration/profile-view.spec.ts        | yes        | third-party read-only, unknown user 404         | Blocked users, private profiles                   |
| Offers                 | done   | integration/offers.spec.ts              | yes        | rating error (500)                              | Pagination, offer counter-offers                  |
| `formatRelativeDate()` | done   | unit/lib/utils.test.ts                  | yes        | edge cases (yesterday boundary, >7 days)        | Timezones other than UTC-3                        |
| Full lifecycle (live)  | done   | e2e/live-backend.spec.ts (manual only)  | yes        | —                                               | Requires backend + clean DB                       |
| Feed                   | -      | —                                       | —          | —                                               | Out of scope this iteration                       |
