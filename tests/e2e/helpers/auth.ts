import { type Page } from '@playwright/test';
import { type MockUserScenario } from '@/lib/msw/mocks/scenario';

export type MockScenario = MockUserScenario;

export async function waitForMSW(page: Page) {
  await page.waitForFunction(
    () => !document.body.innerText.includes('Cargando'),
    { timeout: 15_000 },
  );
}

export async function setInitialSyncUserError(page: Page, status: 401 | 403 | 500 | 503) {
  const map: Record<number, string> = {
    401: 'SYNC_USER_401', 403: 'SYNC_USER_403',
    500: 'SYNC_USER_500', 503: 'SYNC_USER_503',
  };
  await page.addInitScript((s) => { (window as Window & { __mswInitError?: string }).__mswInitError = s; }, map[status]);
}

export async function gotoAuthenticated(page: Page, path: string, scenario: MockScenario = 'FULL') {
  await page.addInitScript(
    (s) => { (window as Window & { __mswInitScenario?: string }).__mswInitScenario = s; },
    scenario,
  );
  await page.goto(path);
  await waitForMSW(page);
  // Wait for useAuth to process sync-user and any client-side redirects to settle
  await page.waitForLoadState('networkidle').catch(() => {});
}
