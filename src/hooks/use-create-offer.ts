"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAccessToken } from "@/actions/auth";
import { createOffer } from "@/lib/api/offer";
import { offerKeys } from "@/hooks/use-offers";
import { OfferDirection } from "@/lib/types/offer-direction.enum";

type CreateOfferInput = {
  postId: string;
  priceClp: number;
  comment?: string;
};

export function useCreateOffer() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOfferInput) => {
      const token = await getAccessToken();
      return createOffer(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: offerKeys.list(OfferDirection.MADE),
      });
      toast.success("Oferta enviada");
    },
    onError: (err) => {
      const status = (err as { status?: number }).status;
      if (status === 401) {
        router.push("/session-expired");
      } else {
        toast.error("Error al enviar oferta", {
          description: err instanceof Error ? err.message : "Inténtalo de nuevo",
        });
      }
    },
  });
}
