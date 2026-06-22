import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { gotoAuthenticated } from '../e2e/helpers/auth';
import { clickTab, openRateSellerDialog, selectStars, submitRating, setRatingError } from './helpers/offers';

test.describe('Offers (/offers)', () => {
  test.slow(); // offers page fires multiple parallel queries on mount; needs extra time

  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/offers', 'FULL');
    await expect(page.getByRole('button', { name: 'Realizadas' })).toBeVisible({ timeout: 15_000 });
  });

  test('tabs load offer cards', async ({ page }) => {
    await test.step('Realizadas tab shows made offers — Calificar vendedor visible on successful', async () => {
      await expect(page.getByRole('button', { name: 'Calificar vendedor' })).toBeVisible();
    });

    await test.step('Recibidas tab shows received offers', async () => {
      await clickTab(page, 'Recibidas');
      // Received offers include a SUCCESSFUL one — its status badge is "Exitosa"
      await expect(page.getByText('Exitosa').first()).toBeVisible();
    });

    await test.step('Exitosas tab shows successful offers from both directions', async () => {
      await clickTab(page, 'Exitosas');
      await expect(page.getByText('Exitosa').first()).toBeVisible();
    });
  });

  test('seller rating: happy path', async ({ page }) => {
    await test.step('open rate-seller dialog on successful made offer', async () => {
      await openRateSellerDialog(page);
      await expect(page.getByText(/Calificar a @/)).toBeVisible();
    });

    await test.step('select 4 stars and submit', async () => {
      await selectStars(page, 4);
      await submitRating(page);
      await expect(
        page.locator('[data-sonner-toast]').filter({ hasText: 'Calificación enviada' }),
      ).toBeVisible();
      await expect(page.getByText(/Calificar a @/)).not.toBeVisible();
    });
  });

  test('seller rating: 500 shows error toast', async ({ page }) => {
    await setRatingError(page, 'RATING_500');
    await openRateSellerDialog(page);
    await selectStars(page, 4);
    await submitRating(page);
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();
  });
});

test.describe('Offers — unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('requires auth — redirects to login', async ({ page }) => {
    await page.goto('/offers');
    await page.waitForURL(/login/, { timeout: 8_000 });
  });
});
