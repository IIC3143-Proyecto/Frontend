import type { AverageSellerRatingDto } from '@/lib/types/rating';

export const MOCK_SELLER_RATING: AverageSellerRatingDto = {
  sellerId: 'auth0|full_123',
  seller: {
    id: 'auth0|full_123',
    name: 'Flo Full',
    username: 'Flo_Full',
    email: 'flo_full@vtrna.cl',
    providerAuth0: 'auth0|full_123',
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
