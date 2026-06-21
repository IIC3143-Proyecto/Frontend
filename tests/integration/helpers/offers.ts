import { type Page } from '@playwright/test';
import type { OnboardingErrorScenario } from '../../../src/lib/msw/mocks/scenario';

export function clickTab(page: Page, label: 'Realizadas' | 'Recibidas' | 'Exitosas') {
  return page.getByRole('button', { name: label }).click();
}

export async function setRatingError(page: Page, scenario: OnboardingErrorScenario) {
  await page.evaluate(
    (s) => (window as Window & { __setErrorScenario?: (s: string) => void }).__setErrorScenario?.(s),
    scenario,
  );
}

export async function openRateSellerDialog(page: Page) {
  await page.getByRole('button', { name: 'Calificar vendedor' }).click();
}

export async function selectStars(page: Page, stars: 1 | 2 | 3 | 4 | 5) {
  const label = `${stars} ${stars === 1 ? 'estrella' : 'estrellas'}`;
  await page.getByRole('button', { name: label }).click();
}

export async function submitRating(page: Page) {
  await page.getByRole('button', { name: 'Calificar' }).click();
}
