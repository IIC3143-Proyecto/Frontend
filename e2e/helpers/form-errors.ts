import { type Page } from '@playwright/test';

const AVATAR_URL = '**/profile/avatar';
const USER_URL = '**/user';

const AVATAR_SUCCESS_BODY = JSON.stringify({ photoUrl: 'https://vtrna.com/avatars/mock.webp' });
const USER_SUCCESS_BODY = JSON.stringify({});

/** Register default success-path handlers. Call in beforeEach before any error overrides. */
export async function mockDefaultHandlers(page: Page) {
  await page.route(AVATAR_URL, (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: AVATAR_SUCCESS_BODY })
  );
  await page.route(USER_URL, (route) => {
    if (route.request().method() !== 'PATCH') return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/json', body: USER_SUCCESS_BODY });
  });
}

/**
 * Re-register the avatar success handler on top of the stack.
 * Use after mockAvatarError/mockAvatarNetwork/mockAvatarSlow to restore success behavior
 * without removing the error handler (page.unroute would remove the default too).
 */
export async function mockAvatarSuccess(page: Page) {
  await page.route(AVATAR_URL, (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: AVATAR_SUCCESS_BODY })
  );
}

export async function mockAvatarError(page: Page, status: 401 | 422 | 500) {
  const messages: Record<number, string> = {
    401: 'Unauthorized',
    422: 'File must be a WebP image',
    500: 'Internal server error',
  };
  await page.route(AVATAR_URL, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ message: messages[status] }),
    })
  );
}

export async function mockAvatarNetwork(page: Page) {
  await page.route(AVATAR_URL, (route) => route.abort('failed'));
}

export async function mockAvatarSlow(page: Page) {
  await page.route(AVATAR_URL, async (route) => {
    await new Promise((res) => setTimeout(res, 2000));
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ photoUrl: 'https://vtrna.com/avatars/mock-slow.webp' }),
    });
  });
}

export async function mockPatchError(page: Page, status: 409 | 500) {
  const bodies: Record<number, object> = {
    409: { message: 'Username already taken', field: 'username' },
    500: { message: 'Internal server error' },
  };
  await page.route(USER_URL, (route) => {
    if (route.request().method() !== 'PATCH') return route.continue();
    return route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(bodies[status]),
    });
  });
}
