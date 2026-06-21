import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { OfferStatus } from "@/lib/types/offer-status.enum";
import { OfferPatchAction } from "@/lib/types/offer-patch-action.enum";

export type OfferRole = "buyer" | "seller";

export function getRoleForDirection(direction: OfferDirection): OfferRole {
  return direction === OfferDirection.RECEIVED ? "seller" : "buyer";
}

export function getDirectionForAction(
  action: OfferPatchAction,
): OfferDirection {
  return action === OfferPatchAction.BUYER_CONFIRM
    ? OfferDirection.MADE
    : OfferDirection.RECEIVED;
}

export type OfferActionOption = {
  label: string;
  action: OfferPatchAction;
  variant: "default" | "destructive" | "outline";
};

// Actions (OfferPatchAction) the user can execute on the offer
// based on its current STATE (OfferStatus) and their role. Mirrors the backend rules:
//   Pending            →(seller)         Accepted | Rejected
//   Accepted           →(buyer|seller)   Buyer|Seller confirmed
//   Buyer confirmed    →(seller)         Successful
//   Seller confirmed   →(buyer)          Successful
// Rejected, Successful, Failed, and Deleted are terminal states.
export function getOfferActions(
  status: string,
  role: OfferRole,
): OfferActionOption[] {
  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case OfferStatus.PENDING.toLowerCase():
      return role === "seller"
        ? [
            {
              label: "Aceptar oferta",
              action: OfferPatchAction.ACCEPT,
              variant: "default",
            },
            {
              label: "Rechazar oferta",
              action: OfferPatchAction.REJECT,
              variant: "destructive",
            },
          ]
        : [];

    case OfferStatus.ACCEPTED.toLowerCase():
      return role === "seller"
        ? [
            {
              label: "Confirmar venta",
              action: OfferPatchAction.SELLER_CONFIRM,
              variant: "default",
            },
          ]
        : [
            {
              label: "Confirmar compra",
              action: OfferPatchAction.BUYER_CONFIRM,
              variant: "default",
            },
          ];

    case OfferStatus.BUYER_CONFIRMED.toLowerCase():
      return role === "seller"
        ? [
            {
              label: "Confirmar entrega",
              action: OfferPatchAction.SELLER_CONFIRM,
              variant: "default",
            },
          ]
        : [];

    case OfferStatus.SELLER_CONFIRMED.toLowerCase():
      return role === "buyer"
        ? [
            {
              label: "Confirmar entrega",
              action: OfferPatchAction.BUYER_CONFIRM,
              variant: "default",
            },
          ]
        : [];

    default:
      return [];
  }
}
