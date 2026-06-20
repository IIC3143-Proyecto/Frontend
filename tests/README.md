# Tests — Quick Reference

Full documentation in [docs/testing/](../docs/testing/README.md).

## Commands

| Command | Suite | Requires |
|---------|-------|----------|
| `npm run test:unit` | Unit (Vitest) | Nothing |
| `npm run test:integration` | Integration (MSW) | Dev server |
| `npm run test:e2e` | E2E (real Auth0) | Auth0 creds |
| `npm run test:contract` | Contract (real backend) | Backend + Auth0 creds |
| `npm run test:live` | Live backend | Backend + clean DB + Auth0 creds |
| `npm run test:all` | E2E + Integration | Auth0 creds |
| `npm run test:report` | Open last HTML report | — |

## Environment variables (`.env.local`)

```env
# E2E + Live backend: existing Auth0 user
AUTH0_TEST_EMAIL=test2@gmail.com
AUTH0_TEST_PASSWORD=Test2@password

# Live backend: sign-up test user (delete from Auth0 between runs)
AUTH0_TEST_SIGNUP_EMAIL=test3@gmail.com
AUTH0_TEST_SIGNUP_PASSWORD=Test3@password

# Contract + Live backend: backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001/
```

## Preparing the DB for live tests

```bash
yarn infra:reset   # wipes the DB
yarn infra:up      # starts the API with migrations and seeds
```

Or directly with Docker:

```bash
docker compose -f infra/docker/docker-compose.dev.yml exec db \
  psql -U IsabellaKPM -d iic3143_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker compose -f infra/docker/docker-compose.dev.yml exec api yarn db:setup
```

## Sign-up test lifecycle

1. Set `AUTH0_TEST_SIGNUP_EMAIL` and `AUTH0_TEST_SIGNUP_PASSWORD` in `.env.local`
2. Make sure that email does **not** exist in the Auth0 tenant
3. Run `npm run test:live`
4. After each run: delete the user from [Auth0 Dashboard → User Management](https://manage.auth0.com/)
