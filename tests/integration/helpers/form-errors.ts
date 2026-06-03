import { type Page } from '@playwright/test';
import type { OnboardingErrorScenario } from '../../../src/lib/msw/mocks/scenario';

async function setScenario(page: Page, scenario: OnboardingErrorScenario) {
  await page.evaluate(
    (s) => (window as Window & { __setErrorScenario?: (s: string) => void }).__setErrorScenario?.(s),
    scenario,
  );
}

export async function resetErrorScenario(page: Page) {
  await page.evaluate(
    () => (window as Window & { __resetErrorScenario?: () => void }).__resetErrorScenario?.(),
  );
}

export async function setAvatarError(page: Page, status: 401 | 422 | 500) {
  const map: Record<number, OnboardingErrorScenario> = {
    401: 'AVATAR_401',
    422: 'AVATAR_422',
    500: 'AVATAR_500',
  };
  await setScenario(page, map[status]);
}

export async function setAvatarNetwork(page: Page) {
  await setScenario(page, 'AVATAR_NETWORK');
}

export async function setAvatarSlow(page: Page) {
  await setScenario(page, 'AVATAR_SLOW');
}

export async function setPatchError(page: Page, status: 409 | 500) {
  await setScenario(page, status === 409 ? 'PATCH_409' : 'PATCH_500');
}
