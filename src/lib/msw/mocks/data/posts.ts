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

export const MOCK_SELLER_POSTS: PostDto[] = [
  { ...mockPost('post_1'), title: 'Vintage 90s Jacket', description: 'Chaqueta vintage en excelente estado.', priceClp: 25000, isNegotiable: true, status: PostStatus.PUBLISHED, likesCount: 4, savesCount: 1, viewsCount: 12, imagesUrls: 'https://picsum.photos/seed/post1a/400/500,https://picsum.photos/seed/post1b/400/500,https://picsum.photos/seed/post1c/400/500' },
  { ...mockPost('post_2'), title: 'Levis 501 Custom', description: 'Talla M, usada dos veces.', priceClp: 18000, isNegotiable: false, status: PostStatus.PUBLISHED, offersCount: 2, imagesUrls: 'https://picsum.photos/seed/post2a/400/500,https://picsum.photos/seed/post2b/400/500,https://picsum.photos/seed/post2c/400/500' },
  { ...mockPost('post_3'), title: 'Carhartt Detroit', description: 'Chaqueta Carhartt original.', priceClp: 45000, isNegotiable: true, status: PostStatus.RESERVED, likesCount: 8, viewsCount: 25, imagesUrls: 'https://picsum.photos/seed/post3a/400/500,https://picsum.photos/seed/post3b/400/500' },
  { ...mockPost('post_4'), title: 'Polera Algodón Premium', description: 'Polera básica, talla M.', priceClp: 12990, isNegotiable: false, status: PostStatus.UNPUBLISHED, isActive: false, imagesUrls: '' },
  { ...mockPost('post_5'), title: 'Archive Nike Bag', description: 'Bolso Nike de colección.', priceClp: 30000, isNegotiable: false, status: PostStatus.SOLD, isActive: false, likesCount: 10, viewsCount: 40, imagesUrls: '' },
];

export const MOCK_SAVED_POSTS: PostDto[] = [
  MOCK_SELLER_POSTS[0],
  MOCK_SELLER_POSTS[1],
  { ...POST_WITH_OFFER, title: 'Bomber Kenzo Vintage', description: 'Bomber original, talla L.', priceClp: 35000, isNegotiable: true, status: PostStatus.PUBLISHED, interactions: [OFFERED_INTERACTION] },
];
