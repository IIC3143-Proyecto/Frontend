import { PostStatus } from '@/lib/types/post-status.enum';

export const mockPost = (id: string, body: Record<string, unknown> = {}) => ({
  id,
  sellerId: 'seller-mock-1',
  buyerId: null,
  title: body.title ?? '',
  description: body.description ?? '',
  priceClp: body.priceClp ?? 0,
  isNegotiable: body.isNegotiable ?? false,
  status: PostStatus.UNPUBLISHED,
  likesCount: 0,
  savesCount: 0,
  viewsCount: 0,
  isActive: true,
  isDeleted: false,
  images: null,
  createdAtUtcMinus3: new Date().toISOString(),
  interactions: [],
});
