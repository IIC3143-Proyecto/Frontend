import type { AverageSellerRatingDto } from '@/lib/types/seller-rating';

export const MOCK_SELLER_RATING: AverageSellerRatingDto = {
  sellerId: 'seller-mock-1',
  seller: {
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
  },
  score: 4.2,
  tier: 'Gold',
  timesRated: 12,
};
