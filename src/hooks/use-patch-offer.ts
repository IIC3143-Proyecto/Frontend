import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAccessToken } from "@/actions/auth";
import { patchOffer } from "@/lib/api/offer";
import type { PatchOfferRequest } from "@/lib/types/offer";

type Options = {
  onSuccess?: () => void;
};

export const usePatchOffer = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: PatchOfferRequest) => {
      const accessToken = await getAccessToken();
      return patchOffer({ id, status }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Oferta actualizada");
      options?.onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error("Error al actualizar la oferta", {
        description: err.message,
      });
    },
  });
};
