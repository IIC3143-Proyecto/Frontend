import { http, HttpResponse } from 'msw';
import { getErrorScenario } from '../scenario';
import { MOCK_SELLER_RATING } from '../data/ratings';

export const ratingsHandlers = [
  http.get('*/api/seller/rating/:id_seller', () => {
    return HttpResponse.json(MOCK_SELLER_RATING);
  }),

  http.post('*/api/seller/rating/:id_seller', async ({ request }) => {
    if (getErrorScenario() === 'RATING_500') {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
    const body = await request.json() as { score: number };
    return HttpResponse.json({
      ...MOCK_SELLER_RATING,
      score: body.score,
      buyerId: 'mock-buyer-id',
      buyer: { name: 'Mock Buyer' },
      timestamp: new Date().toISOString(),
    });
  }),
];
