import { type Page } from '@playwright/test';
import { type MockUserScenario } from '@/lib/msw/mocks/scenario';
import { MOCK_USERS } from '@/lib/msw/mocks/data/mock-users';

export type MockScenario = MockUserScenario;

export async function mockSyncUser(page: Page, scenario: MockScenario) {
  await page.route('**/auth/sync-user', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USERS[scenario]),
    })
  );
}

export async function mockSyncUserError(page: Page, status: 401 | 403 | 500 | 503) {
  await page.route('**/auth/sync-user', (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: status === 401 ? '' : JSON.stringify({ error: 'Simulated error' }),
    })
  );
}

export async function waitForMSW(page: Page) {
  await page.waitForFunction(
    () => !document.body.innerText.includes('Cargando'),
    { timeout: 15_000 }
  );
}

export async function waitForAuthSync(page: Page) {
  await page.waitForFunction(
    () => !document.body.innerText.includes('Sincronizando con VTRNA'),
    { timeout: 10_000 }
  );
}

export async function gotoAuthenticated(page: Page, path: string, scenario: MockScenario = 'FULL') {
  await mockSyncUser(page, scenario);
  await page.goto(path);
  await waitForMSW(page);
  await waitForAuthSync(page);
}
