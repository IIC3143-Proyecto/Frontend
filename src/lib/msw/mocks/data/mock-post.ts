import type { PostDto } from '@/lib/types/post';
import { PostStatus } from '@/lib/types/post-status.enum';

export function mockPostDto(id: string, body: Record<string, unknown> = {}): PostDto {
  return {
    id,
    sellerId: 'seller-mock-1',
    buyerId: null,
    buyer: null,
    imagesUrls: '',
    seller: {
      id: 'seller-mock-1',
      name: 'Mock Seller',
      username: 'mock_seller',
      email: 'seller@mock.cl',
      providerAuth0: 'auth0|seller_mock',
      status: 'active',
      createdAtUtcMinus3: new Date().toISOString(),
      updatedAtUtcMinus3: new Date().toISOString(),
      posts: [],
      interactions: [],
    },
    title: typeof body.title === 'string' ? body.title : '',
    description: typeof body.description === 'string' ? body.description : '',
    priceClp: typeof body.priceClp === 'number' ? body.priceClp : 0,
    isNegotiable: typeof body.isNegotiable === 'boolean' ? body.isNegotiable : false,
    status: PostStatus.UNPUBLISHED,
    likesCount: 0,
    savesCount: 0,
    viewsCount: 0,
    isActive: true,
    isDeleted: false,
    createdAtUtcMinus3: new Date().toISOString(),
    interactions: [],
  };
}
