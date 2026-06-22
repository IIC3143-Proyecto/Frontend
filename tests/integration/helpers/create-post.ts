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

export async function setUploadError(page: Page, status: 401 | 500) {
  await setScenario(page, status === 401 ? 'UPLOAD_401' : 'UPLOAD_500');
}


export async function setUploadNetwork(page: Page) {
  await setScenario(page, 'UPLOAD_NETWORK');
}

export async function setUploadSlow(page: Page) {
  await setScenario(page, 'UPLOAD_SLOW');
}

export async function setCreateError(page: Page, status: 401 | 500) {
  await setScenario(page, status === 401 ? 'CREATE_401' : 'CREATE_500');
}

export async function setCreateNetwork(page: Page) {
  await setScenario(page, 'CREATE_NETWORK');
}

export async function setPatchTagsError(page: Page, status: 401 | 500) {
  await setScenario(page, status === 401 ? 'PATCH_TAGS_401' : 'PATCH_TAGS_500');
}

export async function setPatchTagsNetwork(page: Page) {
  await setScenario(page, 'PATCH_TAGS_NETWORK');
}

export async function openModal(page: Page) {
  await page.getByRole('button', { name: 'Nueva publicación' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

export async function clickNext(page: Page) {
  await page.getByRole('button', { name: 'Siguiente' }).click();
}

export async function clickBack(page: Page) {
  await page.getByRole('button', { name: 'Atrás' }).click();
}

export async function clickPublish(page: Page) {
  await page.getByRole('button', { name: 'Publicar' }).click();
}

/**
 * @param opts.title Required title text.
 * @param opts.price Price in CLP (string or number).
 * @param opts.description Optional description text.
 */
export async function fillStep1(
  page: Page,
  opts: { title: string; price: string | number; description?: string },
) {
  await page.getByPlaceholder('ej: Camiseta Nike azul').fill(opts.title);
  await page.getByPlaceholder('ej: 25000').fill(String(opts.price));
  if (opts.description !== undefined) {
    await page.getByPlaceholder('Describe la prenda, tela, detalles…').fill(opts.description);
  }
}

/**
 * Upload `count` photos via the sequential-unlock grid.
 * Only the active slot renders input[type="file"], so the locator is always unambiguous.
 */
export async function uploadPhotos(page: Page, count = 3) {
  for (let i = 0; i < count; i++) {
    await page.locator('input[type="file"]').setInputFiles(PHOTO_FILE);
    await expect(page.locator('img[alt="Foto de prenda"]')).toHaveCount(i + 1, {
      timeout: 5_000,
    });
  }
}

/**
 * Dismiss the Gemini tag suggestion dialog if it appears after photo upload.
 * The dialog only shows when both photo upload and post creation succeed.
 * Silently no-ops if the dialog isn't present (e.g. when an error scenario is active).
 */
export async function dismissGeminiSuggestions(page: Page) {
  await page
    .getByRole('button', { name: 'No, yo eligiré los tags manualmente' })
    .click({ timeout: 4_000 })
    .catch(() => {});
}

/**
 * Expand the "Tallas de letra" section in SizeSelector (collapsed by default).
 */
async function expandLetterSizes(page: Page) {
  await page.getByRole('button', { name: 'Tallas de letra' }).click();
}

/**
 * Minimum valid selection for required tags.
 * Dismisses the Gemini suggestion dialog first (shown after successful photo upload).
 * Talla (SizeSelector) requires expanding the letter-sizes section before clicking.
 */
export async function selectRequiredTags(page: Page) {
  await dismissGeminiSuggestions(page);
  await expandLetterSizes(page);
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('radio', { name: 'Nuevo', exact: true }).click();
  await page.getByRole('button', { name: 'Camiseta', exact: true }).click();
}

/**
 * Select multiple items for Talla and Tipo de prenda (type="multiple" groups).
 */
export async function selectMultipleTags(page: Page) {
  await dismissGeminiSuggestions(page);
  await expandLetterSizes(page);
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: 'L', exact: true }).click();
  await page.getByRole('radio', { name: 'Nuevo', exact: true }).click();
  await page.getByRole('button', { name: 'Camiseta', exact: true }).click();
  await page.getByRole('button', { name: 'Pantalón', exact: true }).click();
}
