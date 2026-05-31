import { type Page, expect } from '@playwright/test';
import path from 'path';

export const PHOTO_FILE = path.join(__dirname, '../fixtures/avatar.webp');

const TAGS_URL = '**/api/tag';
const UPLOAD_URL = '**/image/post/**';
const POST_URL = '**/post';

const TAGS_BODY = JSON.stringify({
  tags: {
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
  message: 'Imágenes subidas y vinculadas a la publicación exitosamente.',
});

const mockPostDto = (id: string) => JSON.stringify({
  id,
  sellerId: 'seller-mock-1',
  buyerId: null,
  title: '',
  description: '',
  priceClp: 0,
  isNegotiable: false,
  status: 'Sin publicar',
  likesCount: 0,
  savesCount: 0,
  viewsCount: 0,
  isActive: true,
  isDeleted: false,
  images: null,
  createdAtUtcMinus3: new Date().toISOString(),
  interactions: [],
});

const POST_CREATE_BODY = mockPostDto('post-test-1');
const PATCH_SUCCESS_BODY = mockPostDto('post-test-1');

/**
 * Registers page.route() handlers for /api/tag, /image/post/:id, and /post (POST + PATCH).
 * Must be called before navigating to avoid missing the initial /api/tags fetch.
 */
export async function mockCreatePostHandlers(page: Page) {
  await page.route(TAGS_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: TAGS_BODY })
  );
  await page.route(UPLOAD_URL, (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: UPLOAD_SUCCESS_BODY })
  );
  await page.route(POST_URL, (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      route.fulfill({ status: 201, contentType: 'application/json', body: POST_CREATE_BODY });
    } else if (method === 'PATCH') {
      route.fulfill({ status: 200, contentType: 'application/json', body: PATCH_SUCCESS_BODY });
    } else {
      route.continue();
    }
  });
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

/** Simulates an error on POST /post (step-1 Next click). */
export async function mockCreateError(page: Page, status: 401 | 500) {
  const messages: Record<number, string> = { 401: 'Unauthorized', 500: 'Internal server error' };
  await page.route(POST_URL, (route) => {
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

/** Simulates a network failure on POST /post (step-1 Next click). */
export async function mockCreateNetwork(page: Page) {
  await page.route(POST_URL, (route) => {
    if (route.request().method() === 'POST') {
      route.abort('failed');
    } else {
      route.continue();
    }
  });
}

/** Simulates an error on PATCH /post (final Publicar click). */
export async function mockPatchError(page: Page, status: 401 | 500) {
  const messages: Record<number, string> = { 401: 'Unauthorized', 500: 'Internal server error' };
  await page.route(POST_URL, (route) => {
    if (route.request().method() === 'PATCH') {
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

/** Simulates a network failure on PATCH /post (final Publicar click). */
export async function mockPatchNetwork(page: Page) {
  await page.route(POST_URL, (route) => {
    if (route.request().method() === 'PATCH') {
      route.abort('failed');
    } else {
      route.continue();
    }
  });
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
