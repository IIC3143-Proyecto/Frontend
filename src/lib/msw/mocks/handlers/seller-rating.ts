import { http, HttpResponse } from 'msw';
import { MOCK_SELLER_RATING } from '../data/seller-rating';

export const sellerRatingHandlers = [
  http.get('*/api/seller/rating/:id_seller', ({ params }) => {
    return HttpResponse.json({
      ...MOCK_SELLER_RATING,
      sellerId: params.id_seller as string,
    });
  }),
];
