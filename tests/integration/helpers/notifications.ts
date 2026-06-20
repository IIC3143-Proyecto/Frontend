import { type Page, type Locator } from '@playwright/test';
import type { OnboardingErrorScenario } from '../../../src/lib/msw/mocks/scenario';
import type { NotificationDto } from '../../../src/lib/types/notification';

export function getCards(page: Page): Locator {
  return page.getByTestId('notification-card');
}

export async function deleteCardAt(page: Page, idx: number) {
  await getCards(page).nth(idx).getByRole('button', { name: 'Eliminar' }).click();
}

export async function confirmDelete(page: Page) {
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
}

export async function cancelDelete(page: Page) {
  await page.getByRole('button', { name: /cancelar/i }).click();
}

export async function deleteAll(page: Page) {
  await page.getByRole('button', { name: /borrar todas/i }).click();
  await confirmDelete(page);
}

export async function setDeleteError(page: Page, scenario: OnboardingErrorScenario) {
  await page.evaluate(
    (s) => (window as Window & { __setErrorScenario?: (s: string) => void }).__setErrorScenario?.(s),
    scenario,
  );
}

export async function resetNotificationsList(page: Page, list?: NotificationDto[]) {
  await page.evaluate(
    (l) => (window as Window & { __resetNotifications?: (l?: unknown[]) => void }).__resetNotifications?.(l),
    list,
  );
}
