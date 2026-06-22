import { type Page, type Locator } from '@playwright/test';
import type { OnboardingErrorScenario } from '../../../src/lib/msw/mocks/scenario';

export function openContactEditor(page: Page) {
  return page.locator('section').filter({ hasText: 'Contacto' }).getByRole('button', { name: 'Editar' }).click();
}

export function openZoneEditor(page: Page) {
  return page.locator('section').filter({ hasText: 'Zona' }).getByRole('button', { name: 'Editar' }).click();
}

export async function openSavedSheet(page: Page) {
  await page.getByRole('button', { name: /ver guardados/i }).click();
}

export function getSavedCards(page: Page): Locator {
  return page.getByTestId('saved-post-card');
}

export async function removeCardAt(page: Page, idx: number) {
  await getSavedCards(page).nth(idx).getByRole('button', { name: 'Quitar de guardados' }).click();
}

export async function openOfferFormAt(page: Page, idx: number) {
  await getSavedCards(page).nth(idx).getByRole('button', { name: 'Hacer oferta' }).click();
}

export async function setPatchError(page: Page, scenario: OnboardingErrorScenario) {
  await page.evaluate(
    (s) => (window as Window & { __setErrorScenario?: (s: string) => void }).__setErrorScenario?.(s),
    scenario,
  );
}
