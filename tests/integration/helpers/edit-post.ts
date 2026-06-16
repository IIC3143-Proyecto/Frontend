import { type Page, expect } from '@playwright/test';
import path from 'path';
import type { OnboardingErrorScenario } from '../../../src/lib/msw/mocks/scenario';

export const PHOTO_FILE = path.join(__dirname, '../../e2e/fixtures/avatar.webp');

async function setScenario(page: Page, scenario: OnboardingErrorScenario) {
  await page.evaluate(
    (s) => (window as Window & { __setErrorScenario?: (s: string) => void }).__setErrorScenario?.(s),
    scenario,
  );
}

export async function setPatchPostError(page: Page, status: 401 | 500) {
  await setScenario(page, status === 401 ? 'PATCH_POST_401' : 'PATCH_POST_500');
}

export async function setPatchPostNetwork(page: Page) {
  await setScenario(page, 'PATCH_POST_NETWORK');
}

export async function setDeleteImageError(page: Page, status: 401 | 500) {
  await setScenario(page, status === 401 ? 'DELETE_IMAGE_401' : 'DELETE_IMAGE_500');
}

export async function setDeleteImageNetwork(page: Page) {
  await setScenario(page, 'DELETE_IMAGE_NETWORK');
}

export async function setAppendImageError(page: Page, status: 401 | 500) {
  await setScenario(page, status === 401 ? 'APPEND_IMAGE_401' : 'APPEND_IMAGE_500');
}

export async function setAppendImageNetwork(page: Page) {
  await setScenario(page, 'APPEND_IMAGE_NETWORK');
}

/** Opens the edit modal for the first post with an edit button. */
export async function openEditModal(page: Page) {
  await page.getByRole('button', { name: 'Editar' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

/** Opens the edit modal for the post whose card contains the given title text. */
export async function openEditModalForPost(page: Page, title: string) {
  await page
    .locator('article')
    .filter({ hasText: title })
    .getByRole('button', { name: 'Editar' })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

export async function clickSave(page: Page) {
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();
}

/** Expands an accordion section matching the given text. No-op if already open. */
export async function openSection(page: Page, name: string) {
  const trigger = page
    .locator('[data-slot="accordion-trigger"]')
    .filter({ hasText: new RegExp(name, 'i') })
    .first();
  const state = await trigger.getAttribute('data-state');
  if (state !== 'open') {
    await trigger.click();
  }
}

export async function fillEditTitle(page: Page, value: string) {
  await openSection(page, 'Título');
  await page.getByPlaceholder('ej: Camiseta Nike azul').fill(value);
}

export async function fillEditPrice(page: Page, value: string | number) {
  await openSection(page, 'Precio');
  await page.getByPlaceholder('ej: 25000').fill(String(value));
}

/** Uploads `count` photos via the sequential-unlock grid inside the edit modal. */
export async function uploadEditPhotos(page: Page, count = 1) {
  await openSection(page, 'Fotos');
  for (let i = 0; i < count; i++) {
    await page.locator('input[type="file"]').setInputFiles(PHOTO_FILE);
    await expect(page.locator('img[alt="Foto de prenda"]')).toHaveCount(
      // existing photos + i + 1
      await page.locator('img[alt="Foto de prenda"]').count() + 1,
      { timeout: 5_000 },
    );
  }
}

/**
 * Waits for a request matching `method` to `/api/image/post/*` and returns it.
 * Rejects after `timeout` ms if no matching request arrives.
 */
export async function waitForImageRequest(page: Page, method: 'DELETE' | 'PATCH', timeout = 8_000) {
  return page.waitForRequest(
    (req) =>
      req.method() === method &&
      /\/api\/image\/post\//.test(req.url()),
    { timeout },
  );
}

/**
 * Asserts that no image API request (DELETE or PATCH to /api/image/post/*) is made
 * within `timeout` ms after the given action.
 */
export async function assertNoImageRequest(page: Page, action: () => Promise<void>, timeout = 3_000) {
  let called = false;
  page.on('request', (req) => {
    if (/\/api\/image\/post\//.test(req.url()) && ['DELETE', 'PATCH'].includes(req.method())) {
      called = true;
    }
  });
  await action();
  await page.waitForTimeout(timeout);
  expect(called).toBe(false);
}
