import { PostStatus } from '@/lib/types/post-status.enum';
import type { PostDto } from '@/lib/types/post';
import type { UserDto, InteractionDto } from '@/lib/types/user';

const MOCK_SELLER: UserDto = {
  id: 'seller-mock-1',
  name: 'Mock Seller',
  username: 'mock_seller',
  email: 'seller@mock.cl',
  providerAuth0: 'auth0|seller_mock',
  status: 'Activo',
  createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
  updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
  posts: [],
  interactions: [],
};

const MOCK_BUYER_SELF: UserDto = {
  id: 'buyer-self-mock',
  name: 'Flo Full',
  username: 'Flo_Full',
  email: 'flo_full@vtrna.cl',
  providerAuth0: 'auth0|full_123',
  status: 'Activo',
  createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
  updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
  posts: [],
  interactions: [],
};

export const mockPost = (id: string, body: Record<string, unknown> = {}): PostDto => ({
  id,
  sellerId: MOCK_SELLER.id,
  buyerId: null,
  seller: MOCK_SELLER,
  buyer: null,
  title: body.title as string ?? '',
  description: body.description as string ?? '',
  priceClp: body.priceClp as number ?? 0,
  isNegotiable: body.isNegotiable as boolean ?? false,
  status: PostStatus.UNPUBLISHED,
  likesCount: 0,
  savesCount: 0,
  viewsCount: 0,
  isActive: true,
  isDeleted: false,
  imagesUrls: '',
  createdAtUtcMinus3: new Date().toISOString(),
  interactions: [],
});

// Alias para compatibilidad con tests de integración
export const mockPostDto = mockPost;

const POST_WITH_OFFER = mockPost('post_offered_1');
const OFFERED_INTERACTION: InteractionDto = {
  id: 'interaction_offered_1',
  userId: MOCK_BUYER_SELF.id,
  postId: POST_WITH_OFFER.id,
  type: 'Offered',
  user: MOCK_BUYER_SELF,
  post: POST_WITH_OFFER,
  createdAtUtcMinus3: new Date().toISOString(),
};

const CLD = 'https://res.cloudinary.com/demo/image/upload';

export const MOCK_SELLER_POSTS: PostDto[] = [
  { ...mockPost('post_1'), title: 'Vintage 90s Jacket', description: 'Chaqueta vintage en excelente estado.', priceClp: 25000, isNegotiable: true, status: PostStatus.PUBLISHED, likesCount: 4, savesCount: 1, viewsCount: 12, imagesUrls: `${CLD}/woman-blackdress-stairs.webp;${CLD}/man-portrait.webp;${CLD}/shoes.webp` },
  { ...mockPost('post_2'), title: 'Levis 501 Custom', description: 'Talla M, usada dos veces.', priceClp: 18000, isNegotiable: false, status: PostStatus.PUBLISHED, offersCount: 2, imagesUrls: `${CLD}/jeans.webp;${CLD}/jacket.webp;${CLD}/tshirt.webp` },
  { ...mockPost('post_3'), title: 'Carhartt Detroit', description: 'Chaqueta Carhartt original.', priceClp: 45000, isNegotiable: true, status: PostStatus.RESERVED, likesCount: 8, viewsCount: 25, imagesUrls: `${CLD}/jacket.webp;${CLD}/shoes.webp` },
  { ...mockPost('post_4'), title: 'Polera Algodón Premium', description: 'Polera básica, talla M.', priceClp: 12990, isNegotiable: false, status: PostStatus.UNPUBLISHED, isActive: false, imagesUrls: '' },
  { ...mockPost('post_5'), title: 'Archive Nike Bag', description: 'Bolso Nike de colección.', priceClp: 30000, isNegotiable: false, status: PostStatus.SOLD, isActive: false, likesCount: 10, viewsCount: 40, imagesUrls: '' },
];

const MOCK_SELLER_2: UserDto = {
  id: 'seller-mock-2',
  name: 'Otro Vendedor',
  username: 'otro_vendedor',
  email: 'otro@mock.cl',
  providerAuth0: 'auth0|seller_mock_2',
  status: 'Activo',
  createdAtUtcMinus3: '2025-03-01T00:00:00.000Z',
  updatedAtUtcMinus3: '2025-03-01T00:00:00.000Z',
  posts: [],
  interactions: [],
};

export const MOCK_FEED_POSTS: PostDto[] = [
  { ...mockPost('feed_1'), sellerId: MOCK_SELLER.id, seller: MOCK_SELLER, title: 'Parka Oversized Beige', description: 'Parka cálida, perfecta para invierno.', priceClp: 32000, isNegotiable: true, status: PostStatus.PUBLISHED, likesCount: 12, savesCount: 5, viewsCount: 30, imagesUrls: `${CLD}/woman-blackdress-stairs.webp;${CLD}/jacket.webp` },
  { ...mockPost('feed_2'), sellerId: MOCK_SELLER_2.id, seller: MOCK_SELLER_2, title: 'Camiseta Vintage Nike', description: 'Talla L, sin uso.', priceClp: 14000, isNegotiable: false, status: PostStatus.PUBLISHED, likesCount: 7, savesCount: 2, viewsCount: 18, imagesUrls: `${CLD}/tshirt.webp` },
  { ...mockPost('feed_3'), sellerId: MOCK_SELLER.id, seller: MOCK_SELLER, title: 'Jeans Mom Azul', description: 'Talla 28, en buen estado.', priceClp: 21000, isNegotiable: true, status: PostStatus.PUBLISHED, likesCount: 3, savesCount: 1, viewsCount: 9, imagesUrls: `${CLD}/jeans.webp;${CLD}/shoes.webp;${CLD}/man-portrait.webp` },
  { ...mockPost('feed_4'), sellerId: MOCK_SELLER_2.id, seller: MOCK_SELLER_2, title: 'Poleron Adidas Clásico', description: 'Talla M, ligero uso.', priceClp: 18500, isNegotiable: false, status: PostStatus.PUBLISHED, likesCount: 20, savesCount: 8, viewsCount: 55, imagesUrls: `${CLD}/tshirt.webp` },
  { ...mockPost('feed_5'), sellerId: MOCK_SELLER.id, seller: MOCK_SELLER, title: 'Falda Midi Floral', description: 'Talla S, nueva con etiqueta.', priceClp: 9500, isNegotiable: false, status: PostStatus.PUBLISHED, likesCount: 6, savesCount: 3, viewsCount: 14, imagesUrls: `${CLD}/woman-blackdress-stairs.webp;${CLD}/shoes.webp` },
  { ...mockPost('feed_6'), sellerId: MOCK_SELLER_2.id, seller: MOCK_SELLER_2, title: 'Chaqueta Denim Negra', description: 'Talla XL, estilo vintage.', priceClp: 27000, isNegotiable: true, status: PostStatus.PUBLISHED, likesCount: 15, savesCount: 6, viewsCount: 40, imagesUrls: `${CLD}/jacket.webp` },
  { ...mockPost('feed_7'), sellerId: MOCK_SELLER.id, seller: MOCK_SELLER, title: 'Shorts Cargo Verde', description: 'Talla M, poco uso.', priceClp: 11000, isNegotiable: true, status: PostStatus.PUBLISHED, likesCount: 4, savesCount: 0, viewsCount: 7, imagesUrls: `${CLD}/jeans.webp` },
  { ...mockPost('feed_8'), sellerId: MOCK_SELLER_2.id, seller: MOCK_SELLER_2, title: 'Bolso de Cuero', description: 'Cuero genuino, muy poco uso.', priceClp: 40000, isNegotiable: false, status: PostStatus.PUBLISHED, likesCount: 9, savesCount: 4, viewsCount: 22, imagesUrls: `${CLD}/woman-blackdress-stairs.webp;${CLD}/shoes.webp` },
];

export const MOCK_FEED_POST_TAGS: Record<string, string[]> = {
  feed_1: ['Abrigo', 'Invierno', 'Nuevo', 'Femenino'],
  feed_2: ['Polera', 'Nike', 'Casual', 'Nuevo'],
  feed_3: ['Pantalón', 'Azul', 'M', 'Casi nuevo'],
  feed_4: ['Polera', 'Adidas', 'M', 'Deportivo'],
  feed_5: ['Falda', 'S', 'Nuevo', 'Femenino'],
  feed_6: ['Chaqueta', 'XL', 'Vintage', 'Negro'],
  feed_7: ['Shorts', 'M', 'Verde', 'Casual'],
  feed_8: ['Bolso', 'Casi nuevo'],
};

export const MOCK_SAVED_POSTS: PostDto[] = [
  MOCK_SELLER_POSTS[0],
  MOCK_SELLER_POSTS[1],
  { ...POST_WITH_OFFER, title: 'Bomber Kenzo Vintage', description: 'Bomber original, talla L.', priceClp: 35000, isNegotiable: true, status: PostStatus.PUBLISHED, interactions: [OFFERED_INTERACTION] },
];
