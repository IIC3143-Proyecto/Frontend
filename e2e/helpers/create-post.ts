import { type Page, expect } from '@playwright/test';
import path from 'path';

export const PHOTO_FILE = path.join(__dirname, '../fixtures/avatar.webp');

const TAGS_URL = '**/tags';
const UPLOAD_URL = '**/upload';
const POST_URL = '**/post';

const TAGS_BODY = JSON.stringify({
  categories: {
    Marca: ['Nike', 'Adidas', 'Gucci', 'Zara', 'Polo', 'Otro'],
    Estilo: ['Casual', 'Formal', 'Deportivo', 'Streetwear', 'Vintage', 'Otro'],
    Color: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'],
    Temporada: ['Verano', 'Invierno', 'Primavera', 'Otoño'],
    Condición: ['Nuevo', 'Casi nuevo', 'Aceptable', 'Usado'],
    Talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    Género: ['Masculino', 'Femenino', 'Unisex'],
    'Tipo de prenda': ['Polera', 'Pantalón', 'Vestido', 'Abrigo', 'Shorts', 'Falda', 'Camiseta', 'Chaqueta', 'Otro'],
  },
});

const UPLOAD_SUCCESS_BODY = JSON.stringify({
  photoUrls: ['https://vtrna.com/posts/mock-photo.webp'],
});
const POST_SUCCESS_BODY = JSON.stringify({ id: 'post-test-1' });

/**
 * Registers page.route() handlers for /tags, /upload, and /post.
 * Must be called before navigating to avoid missing the initial /tags fetch.
 */
export async function mockCreatePostHandlers(page: Page) {
  await page.route(TAGS_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: TAGS_BODY })
  );
  await page.route(UPLOAD_URL, (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: UPLOAD_SUCCESS_BODY })
  );
  await page.route(POST_URL, (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: POST_SUCCESS_BODY })
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

export async function mockPostError(page: Page, status: 401 | 500) {
  const messages: Record<number, string> = { 401: 'Unauthorized', 500: 'Internal server error' };
  await page.route(POST_URL, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ message: messages[status] }),
    })
  );
}

export async function mockPostNetwork(page: Page) {
  await page.route(POST_URL, (route) => route.abort('failed'));
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
