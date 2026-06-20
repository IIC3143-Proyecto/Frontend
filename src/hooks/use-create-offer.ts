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
      // TODO: invalidar queries de offers una vez que se mergee edit-offers.
      // El endpoint retorna offers enviadas o recibidas, por lo que hay que usar
      // dos query keys distintas (ej. ["offers", "sent"] vs ["offers", "received"])
      // para no mezclar cachés. Ejemplo:
      //   const queryClient = useQueryClient();
      //   queryClient.invalidateQueries({ queryKey: ["offers", "sent"] });
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
