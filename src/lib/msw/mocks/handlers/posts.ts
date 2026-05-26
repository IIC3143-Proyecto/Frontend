import { http, HttpResponse } from 'msw';

/**
 * MSW handlers for post creation endpoints: GET /tags, POST /upload, POST /post.
 * All handlers validate the Authorization header and return 401 when absent.
 */
export const postsHandlers = [
  http.get('*/tags', () =>
    HttpResponse.json({
      categories: {
        'Marca': ['Nike', 'Adidas', 'Gucci', 'Zara', 'Polo', 'Otro'],
        'Estilo': ['Casual', 'Formal', 'Deportivo', 'Streetwear', 'Vintage', 'Otro'],
        'Color': ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'],
        'Temporada': ['Verano', 'Invierno', 'Primavera', 'Otoño'],
        'Condición': ['Nuevo', 'Casi nuevo', 'Aceptable', 'Usado'],
        'Talla': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        Género: ['Masculino', 'Femenino', 'Unisex'],
        'Tipo de prenda': ['Polera', 'Pantalón', 'Vestido', 'Abrigo', 'Shorts', 'Falda', 'Camiseta', 'Chaqueta', 'Otro'],
      },
    })
  ),

  http.post('*/upload', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const fd = await request.formData();
    const files = fd.getAll('photos');
    if (!files.length) {
      return HttpResponse.json({ message: 'No se proporcionaron archivos' }, { status: 400 });
    }

    const photoUrls = files.map(
      (_, i) => `https://vtrna.com/posts/mock-photo-${i}-${Date.now()}.webp`
    );
    return HttpResponse.json({ photoUrls }, { status: 201 });
  }),

  http.post('*/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: `post-${Date.now()}`, ...body }, { status: 201 });
  }),
];
