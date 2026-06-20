import { api } from './index';
import type { AverageSellerRatingDto } from '@/lib/types/rating';

export async function getSellerRating(sellerId: string): Promise<AverageSellerRatingDto> {
  const res = await fetch(api.sellerRating(sellerId));
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al obtener rating'),
      { status: res.status },
    );
  }
  return res.json() as Promise<AverageSellerRatingDto>;
}
