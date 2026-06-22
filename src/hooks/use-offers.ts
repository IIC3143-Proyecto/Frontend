import { useQueries, useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getOffers } from "@/lib/api/offer";
import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { OfferStatus } from "@/lib/types/offer-status.enum";
import type { OfferDto } from "@/lib/types/offer";


export type DirectedOffer = { offer: OfferDto; direction: OfferDirection };

export const offerKeys = {
  all: ["offers"] as const,
  list: (direction: OfferDirection) => [...offerKeys.all, direction] as const,
};

const byNewest = (a: OfferDto, b: OfferDto) =>
  (b.createdAtUtcMinus3 ?? "").localeCompare(a.createdAtUtcMinus3 ?? "");

const buildOfferQueryOptions = (direction: OfferDirection) => ({
  queryKey: offerKeys.list(direction),
  queryFn: async () => {
    const accessToken = await getAccessToken();
    return getOffers(direction, accessToken);
  },
  select: (offers: OfferDto[]) => [...offers].sort(byNewest),
});

const isSuccessful = (status: string) =>
  status.trim().toLowerCase() === OfferStatus.SUCCESSFUL.toLowerCase();


export const useOffers = (direction: OfferDirection) =>
  useQuery(buildOfferQueryOptions(direction));

export const useSuccessfulOffers = () =>
  useQueries({
    queries: [
      buildOfferQueryOptions(OfferDirection.MADE),
      buildOfferQueryOptions(OfferDirection.RECEIVED),
    ],
    combine: ([made, received]) => {
      const tag =
        (direction: OfferDirection) =>
        (offer: OfferDto): DirectedOffer => ({ offer, direction });
      const data: DirectedOffer[] = [
        ...(made.data ?? []).map(tag(OfferDirection.MADE)),
        ...(received.data ?? []).map(tag(OfferDirection.RECEIVED)),
      ]
        .filter(({ offer }) => isSuccessful(offer.status))
        .sort((a, b) => byNewest(a.offer, b.offer));

      return {
        data,
        isLoading: made.isLoading || received.isLoading,
        isError: made.isError || received.isError,
      };
    },
  });
