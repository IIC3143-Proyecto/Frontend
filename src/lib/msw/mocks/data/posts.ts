import { PostStatus } from '@/lib/types/post-status.enum';
import type { PostDto } from '@/lib/types/post';

export const mockPost = (id: string, body: Record<string, unknown> = {}): PostDto => ({
  id,
  sellerId: 'seller-mock-1',
  buyerId: undefined,
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
  images: undefined,
  createdAtUtcMinus3: new Date().toISOString(),
  interactions: [],
});

export const MOCK_SELLER_POSTS: PostDto[] = [
  { ...mockPost('post_1'), title: 'Vintage 90s Jacket', description: 'Chaqueta vintage en excelente estado.', priceClp: 25000, isNegotiable: true, status: PostStatus.PUBLISHED, likesCount: 4, savesCount: 1, viewsCount: 12 },
  { ...mockPost('post_2'), title: 'Levis 501 Custom', description: 'Talla M, usada dos veces.', priceClp: 18000, isNegotiable: false, status: PostStatus.PUBLISHED },
  { ...mockPost('post_3'), title: 'Carhartt Detroit', description: 'Chaqueta Carhartt original.', priceClp: 45000, isNegotiable: true, status: PostStatus.RESERVED, likesCount: 8, viewsCount: 25 },
  { ...mockPost('post_4'), title: 'Polera Algodón Premium', description: 'Polera básica, talla M.', priceClp: 12990, isNegotiable: false, status: PostStatus.UNPUBLISHED, isActive: false },
  { ...mockPost('post_5'), title: 'Archive Nike Bag', description: 'Bolso Nike de colección.', priceClp: 30000, isNegotiable: false, status: PostStatus.SOLD, isActive: false, likesCount: 10, viewsCount: 40 },
];
