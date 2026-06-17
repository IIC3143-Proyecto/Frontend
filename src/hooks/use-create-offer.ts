"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAccessToken } from "@/actions/auth";
import { createOffer } from "@/lib/api/offer";

type CreateOfferInput = {
  postId: string;
  priceClp: number;
  comment?: string;
};

export function useCreateOffer() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateOfferInput) => {
      const token = await getAccessToken();
      return createOffer(data, token);
    },
    onSuccess: () => {
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
