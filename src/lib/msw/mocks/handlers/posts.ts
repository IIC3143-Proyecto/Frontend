import { http, HttpResponse } from 'msw';

const mockPost = (id: string, body: Record<string, unknown>) => ({
  id,
  sellerId: 'seller-mock-1',
  buyerId: null,
  title: body.title ?? '',
  description: body.description ?? '',
  priceClp: body.priceClp ?? 0,
  isNegotiable: body.isNegotiable ?? false,
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

export const postsHandlers = [
  http.get('*/tags', () =>
    HttpResponse.json({
      tags: {
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

  http.post('*/image/post/:id_post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const fd = await request.formData();
    const files = fd.getAll('photos');
    if (!files.length) {
      return HttpResponse.json({ message: 'No se proporcionaron archivos' }, { status: 400 });
    }

    return HttpResponse.json(
      { message: 'Imágenes subidas y vinculadas a la publicación exitosamente.' },
      { status: 201 }
    );
  }),

  http.post('*/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const id = `post-${Date.now()}`;
    return HttpResponse.json(mockPost(id, body), { status: 201 });
  }),

  http.patch('*/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id : `post-${Date.now()}`;
    return HttpResponse.json(mockPost(id, body), { status: 200 });
  }),
];
