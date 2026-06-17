import type { OfferDto } from '@/lib/types/offer';
import type { UserDto } from '@/lib/types/user';
import { MOCK_SELLER_POSTS } from './posts';

const MOCK_BUYER: UserDto = {
  id: 'buyer-mock-1',
  name: 'Mock Buyer',
  username: 'mock_buyer',
  email: 'buyer@mock.cl',
  providerAuth0: 'auth0|buyer_mock',
  status: 'Activo',
  createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
  updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
  posts: [],
  interactions: [],
};

const mockOffer = (id: string, postIdx: number, overrides: Partial<OfferDto> = {}): OfferDto => {
  const post = MOCK_SELLER_POSTS[postIdx];
  return {
    id,
    buyerId: MOCK_BUYER.id,
    buyer: MOCK_BUYER,
    postId: post.id,
    post,
    priceClp: Math.round(post.priceClp * 0.9),
    comment: 'Me interesa, ¿aceptas este precio?',
    status: 'Pendiente',
    createdAtUtcMinus3: new Date().toISOString(),
    ...overrides,
  };
};

// Ofertas realizadas por el usuario (incoming=true).
export const MOCK_OFFERS_MADE: OfferDto[] = [
  mockOffer('offer_made_1', 0),
  mockOffer('offer_made_2', 1, { status: 'Aceptada', comment: 'Perfecto, lo llevo.' }),
];

// Ofertas recibidas por el usuario (incoming=false).
export const MOCK_OFFERS_RECEIVED: OfferDto[] = [
  mockOffer('offer_recv_1', 2, { comment: 'Te ofrezco esto por la chaqueta.' }),
  mockOffer('offer_recv_2', 0, { status: 'Rechazada', comment: 'Muy poco, gracias.' }),
];
