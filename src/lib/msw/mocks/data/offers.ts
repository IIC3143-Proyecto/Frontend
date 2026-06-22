import type { OfferDto } from '@/lib/types/offer';
import type { UserDto } from '@/lib/types/user';
import { OfferStatus } from '@/lib/types/offer-status.enum';
import { MOCK_SELLER_POSTS } from './posts';

const mockBuyer = (id: string, name: string, username: string): UserDto => ({
  id,
  name,
  username,
  email: `${username}@mock.cl`,
  providerAuth0: `auth0|${id}`,
  status: 'Activo',
  createdAtUtcMinus3: '2025-01-01T00:00:00.000Z',
  updatedAtUtcMinus3: '2025-01-01T00:00:00.000Z',
  posts: [],
  interactions: [],
});

const BUYERS = [
  mockBuyer('buyer-mock-1', 'Diego Soto', 'diegosoto'),
  mockBuyer('buyer-mock-2', 'Valentina Pérez', 'valep'),
  mockBuyer('buyer-mock-3', 'Camila Rojas', 'camirojas'),
  mockBuyer('buyer-mock-4', 'Tomás Fuentes', 'tomasf'),
];

let seq = 0;

const mockOffer = (
  id: string,
  postIdx: number,
  status: string,
  overrides: Partial<OfferDto> = {},
): OfferDto => {
  const post = MOCK_SELLER_POSTS[postIdx % MOCK_SELLER_POSTS.length];
  const buyer = BUYERS[seq++ % BUYERS.length];
  return {
    id,
    buyerId: buyer.id,
    buyer,
    postId: post.id,
    post,
    priceClp: Math.round(post.priceClp * 0.9),
    comment: 'Me interesa, ¿aceptas este precio?',
    status,
    createdAtUtcMinus3: new Date().toISOString(),
    ...overrides,
  };
};

// Ofertas REALIZADAS por el usuario (incoming=true) → el usuario es el COMPRADOR.
// Cubre cada estado para probar qué acciones ve el comprador:
//   pendiente          → sin acciones (espera al vendedor)
//   aceptada           → "Confirmar compra"
//   vendedor confirmó  → "Confirmar entrega" (cierra a exitosa)
//   comprador confirmó → sin acciones (ya confirmó, espera al vendedor)
//   rechazada / exitosa→ terminales, sin acciones
export const MOCK_OFFERS_MADE: OfferDto[] = [
  mockOffer('offer_made_pending', 0, OfferStatus.PENDING, {
    comment: 'Me interesa, ¿aceptas $22.000?',
  }),
  mockOffer('offer_made_accepted', 1, OfferStatus.ACCEPTED, {
    comment: 'Perfecto, lo llevo.',
  }),
  mockOffer('offer_made_seller_confirmed', 2, OfferStatus.SELLER_CONFIRMED, {
    comment: 'El vendedor ya confirmó, falta yo.',
  }),
  mockOffer('offer_made_buyer_confirmed', 3, OfferStatus.BUYER_CONFIRMED, {
    comment: 'Ya confirmé, espero al vendedor.',
  }),
  mockOffer('offer_made_rejected', 4, OfferStatus.REJECTED, {
    comment: 'No alcanzamos acuerdo.',
  }),
  mockOffer('offer_made_successful', 0, OfferStatus.SUCCESSFUL, {
    comment: '¡Compra concretada!',
  }),
  mockOffer('offer_made_failed', 1, OfferStatus.FAILED, {
    comment: 'Una parte no confirmó a tiempo.',
  }),
  mockOffer('offer_made_deleted', 2, OfferStatus.DELETED, {
    comment: 'Eliminé esta oferta.',
  }),
];

// Ofertas RECIBIDAS por el usuario (incoming=false) → el usuario es el VENDEDOR.
// Cubre cada estado para probar qué acciones ve el vendedor:
//   pendiente          → "Aceptar" / "Rechazar"
//   aceptada           → "Confirmar venta"
//   comprador confirmó → "Confirmar entrega" (cierra a exitosa)
//   vendedor confirmó  → sin acciones (ya confirmó, espera al comprador)
//   rechazada / exitosa→ terminales, sin acciones
export const MOCK_OFFERS_RECEIVED: OfferDto[] = [
  mockOffer('offer_recv_pending', 2, OfferStatus.PENDING, {
    comment: 'Te ofrezco esto por la chaqueta.',
  }),
  mockOffer('offer_recv_accepted', 1, OfferStatus.ACCEPTED, {
    comment: 'Acepté, coordinemos la entrega.',
  }),
  mockOffer('offer_recv_buyer_confirmed', 0, OfferStatus.BUYER_CONFIRMED, {
    comment: 'El comprador ya confirmó, falta yo.',
  }),
  mockOffer('offer_recv_seller_confirmed', 3, OfferStatus.SELLER_CONFIRMED, {
    comment: 'Ya confirmé, espero al comprador.',
  }),
  mockOffer('offer_recv_rejected', 4, OfferStatus.REJECTED, {
    comment: 'Muy poco, gracias.',
  }),
  mockOffer('offer_recv_successful', 2, OfferStatus.SUCCESSFUL, {
    comment: '¡Venta concretada!',
  }),
  mockOffer('offer_recv_failed', 0, OfferStatus.FAILED, {
    comment: 'Una parte no confirmó a tiempo.',
  }),
  mockOffer('offer_recv_deleted', 1, OfferStatus.DELETED, {
    comment: 'El comprador eliminó la oferta.',
  }),
];
