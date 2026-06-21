"use client";

import { useQuery } from "@tanstack/react-query";
import { getSellerRating } from "@/lib/api/seller-rating";
import type { AverageSellerRatingDto } from "@/lib/types/seller-rating";

export function useSellerRating(sellerId: string | undefined) {
  return useQuery<AverageSellerRatingDto>({
    queryKey: ["sellerRating", sellerId],
    queryFn: () => getSellerRating(sellerId!),
    enabled: !!sellerId,
  });
}
