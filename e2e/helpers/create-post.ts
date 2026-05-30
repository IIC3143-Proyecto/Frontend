import { type Page, expect } from '@playwright/test';
import path from 'path';
import { TAGS_MOCK } from '../../src/lib/msw/mocks/data/mock-tags';
import { mockPostDto } from '../../src/lib/msw/mocks/data/mock-post';

export const PHOTO_FILE = path.join(__dirname, '../fixtures/avatar.webp');

const TAGS_URL = '**/api/tag';
const UPLOAD_URL = '**/api/image/post/**';
const POST_CREATE_URL = '**/api/post';
const PATCH_TAGS_URL = '**/api/post/*/tags';

const TAGS_BODY = JSON.stringify(TAGS_MOCK);
const UPLOAD_SUCCESS_BODY = JSON.stringify({
  message: 'Imágenes subidas y vinculadas a la publicación exitosamente.',
});
const MOCK_POST_BODY = JSON.stringify(mockPostDto('post-test-1'));
const POST_CREATE_BODY = MOCK_POST_BODY;
const PATCH_SUCCESS_BODY = MOCK_POST_BODY;

/**
 * Registers page.route() handlers for /api/tag, /api/image/post/:id,
 * POST /api/post and PATCH /api/post/:id/tags.
 * Must be called before navigating to avoid missing the initial /api/tag fetch.
 */
export async function mockCreatePostHandlers(page: Page) {
  await page.route(TAGS_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: TAGS_BODY })
  );
  await page.route(UPLOAD_URL, (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: UPLOAD_SUCCESS_BODY })
  );
  await page.route(POST_CREATE_URL, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({ status: 201, contentType: 'application/json', body: POST_CREATE_BODY });
    } else {
      route.continue();
    }
  });
  await page.route(PATCH_TAGS_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: PATCH_SUCCESS_BODY })
  );
}

export async function mockUploadError(page: Page, status: 401 | 500) {
  const messages: Record<number, string> = { 401: 'Unauthorized', 500: 'Internal server error' };
  await page.route(UPLOAD_URL, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ message: messages[status] }),
    })
  );
}

export async function mockUploadNetwork(page: Page) {
  await page.route(UPLOAD_URL, (route) => route.abort('failed'));
}

export async function mockUploadSlow(page: Page) {
  await page.route(UPLOAD_URL, async (route) => {
    await new Promise((res) => setTimeout(res, 2000));
    await route.fulfill({ status: 201, contentType: 'application/json', body: UPLOAD_SUCCESS_BODY });
  });
}

/** Simulates an error on POST /api/post (step-1 Next click). */
export async function mockCreateError(page: Page, status: 401 | 500) {
  const messages: Record<number, string> = { 401: 'Unauthorized', 500: 'Internal server error' };
  await page.route(POST_CREATE_URL, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ message: messages[status] }),
      });
    } else {
      route.continue();
    }
  });
}

/** Simulates a network failure on POST /api/post (step-1 Next click). */
export async function mockCreateNetwork(page: Page) {
  await page.route(POST_CREATE_URL, (route) => {
    if (route.request().method() === 'POST') {
      route.abort('failed');
    } else {
      route.continue();
    }
  });
}

/** Simulates an error on PATCH /api/post/:id/tags (final Publicar click). */
export async function mockPatchError(page: Page, status: 401 | 500) {
  const messages: Record<number, string> = { 401: 'Unauthorized', 500: 'Internal server error' };
  await page.route(PATCH_TAGS_URL, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ message: messages[status] }),
    })
  );
}

/** Simulates a network failure on PATCH /api/post/:id/tags (final Publicar click). */
export async function mockPatchNetwork(page: Page) {
  await page.route(PATCH_TAGS_URL, (route) => route.abort('failed'));
}

export async function openModal(page: Page) {
  await page.getByRole('button', { name: 'Nueva Publicación' }).click();
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
 * Minimum valid selection for required tags.
 * Talla and Tipo de prenda are type="multiple" — one item each satisfies min(1).
 */
export async function selectRequiredTags(page: Page) {
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('radio', { name: 'Nuevo', exact: true }).click();
  await page.getByRole('button', { name: 'Camiseta', exact: true }).click();
}

/**
 * Select multiple items for Talla and Tipo de prenda (type="multiple" groups).
 * Used to verify multi-select behavior specifically.
 */
export async function selectMultipleTags(page: Page) {
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: 'L', exact: true }).click();
  await page.getByRole('radio', { name: 'Nuevo', exact: true }).click();
  await page.getByRole('button', { name: 'Camiseta', exact: true }).click();
  await page.getByRole('button', { name: 'Pantalón', exact: true }).click();
}
