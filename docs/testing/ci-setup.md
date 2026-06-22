# CI Setup — Tests

## Prerequisites

Add in GitHub → Settings → Secrets and variables → Actions:

| Secret                | Description                              |
|-----------------------|------------------------------------------|
| `AUTH0_TEST_EMAIL`    | Email of the Auth0 test account          |
| `AUTH0_TEST_PASSWORD` | Password of the Auth0 test account       |

## Steps to add in `ci.yml` after the build step

```yaml
- name: Unit tests
  run: npm run test:unit

- name: Integration tests
  if: ${{ secrets.AUTH0_TEST_EMAIL != '' }}
  env:
    AUTH0_TEST_EMAIL: ${{ secrets.AUTH0_TEST_EMAIL }}
    AUTH0_TEST_PASSWORD: ${{ secrets.AUTH0_TEST_PASSWORD }}
  run: |
    npx playwright install --with-deps chromium
    npx playwright test --project=integration
```

## Tests that do NOT run in CI

- `test:e2e` — the e2e specs themselves require specific fixtures or a live backend
- `test:contract` — requires a deployed backend
- `test:live` (`playwright.config.live.ts`) — requires backend + clean DB
