import { http, HttpResponse } from 'msw';
import { MOCK_SELLER_RATING } from '../data/ratings';

export const ratingsHandlers = [
  http.get('*/api/seller/rating/:id_seller', () => {
    return HttpResponse.json(MOCK_SELLER_RATING);
  }),
];
