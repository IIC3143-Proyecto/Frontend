import { api } from "./index";
import type {
  AverageSellerRatingDto,
  SellerRatingDto,
} from "@/lib/types/rating";

export async function getSellerRating(
  sellerId: string,
): Promise<AverageSellerRatingDto> {
  const res = await fetch(api.sellerRating(sellerId));
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(
        (json as { message?: string }).message ?? "Error al obtener rating",
      ),
      { status: res.status },
    );
  }
  return res.json() as Promise<AverageSellerRatingDto>;
}

export async function createSellerRating(
  id_seller: string,
  score: number,
  accessToken: string,
): Promise<SellerRatingDto> {
  const res = await fetch(api.sellerRating(id_seller), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ score }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(
        (json as { message?: string }).message ?? "Error al crear rating",
      ),
      { status: res.status },
    );
  }
  return res.json() as Promise<SellerRatingDto>;
}
