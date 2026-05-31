import type { TagsByCategoryDto } from '@/lib/types/tag';

export const TAGS_MOCK: TagsByCategoryDto = {
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
};
