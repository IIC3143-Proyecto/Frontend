import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getOffers } from "@/lib/api/offer";
import type { OfferDirection } from "@/lib/types/offer-direction.enum";

export const useOffers = (direction: OfferDirection) =>
  useQuery({
    queryKey: ["offers", direction],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return getOffers(direction, accessToken);
    },
  });
