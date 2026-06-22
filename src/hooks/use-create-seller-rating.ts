"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAccessToken } from "@/actions/auth";
import { createSellerRating } from "@/lib/api/rating";
import { handleApiError } from "@/lib/api/handle-error";

type CreateSellerRatingInput = {
  sellerId: string;
  score: number;
};

export function useCreateSellerRating() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ sellerId, score }: CreateSellerRatingInput) => {
      const accessToken = await getAccessToken();
      return createSellerRating(sellerId, score, accessToken);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sellerRating", variables.sellerId],
      });
      toast.success("Calificación enviada");
    },
    onError: (err) => {
      handleApiError(err, "Crear rating", router);
    },
  });
}
