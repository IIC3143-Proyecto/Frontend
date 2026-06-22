import { http, HttpResponse } from "msw";
import { MOCK_OFFERS_MADE, MOCK_OFFERS_RECEIVED } from "../data/offers";
import { OfferStatus } from "@/lib/types/offer-status.enum";
import { OfferPatchAction } from "@/lib/types/offer-patch-action.enum";

// Simulates Backend
function resolveStatus(current: string, action: string): OfferStatus | null {
  const now = current.trim().toLowerCase();
  switch (action.trim().toLowerCase()) {
    case OfferPatchAction.ACCEPT:
      return OfferStatus.ACCEPTED;
    case OfferPatchAction.REJECT:
      return OfferStatus.REJECTED;
    case OfferPatchAction.BUYER_CONFIRM:
      return now === OfferStatus.SELLER_CONFIRMED.toLowerCase()
        ? OfferStatus.SUCCESSFUL
        : OfferStatus.BUYER_CONFIRMED;
    case OfferPatchAction.SELLER_CONFIRM:
      return now === OfferStatus.BUYER_CONFIRMED.toLowerCase()
        ? OfferStatus.SUCCESSFUL
        : OfferStatus.SELLER_CONFIRMED;
    default:
      return null;
  }
}

export const offersHandlers = [
  http.get("*/api/offer", ({ request }) => {
    const token = request.headers.get("Authorization");
    if (!token)
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    const incoming = new URL(request.url).searchParams.get("incoming");
    // truthy (≠ '0'/'false'/'') → ofertas recibidas; en otro caso → realizadas.
    const isReceived = !!incoming && incoming !== "0" && incoming !== "false";
    return HttpResponse.json(
      isReceived ? MOCK_OFFERS_RECEIVED : MOCK_OFFERS_MADE,
    );
  }),

  // PATCH /api/offer — modifica el estado de una oferta { id, status }.
  // Muta el mock en memoria para que el refetch refleje el cambio.
  http.patch("*/api/offer", async ({ request }) => {
    const token = request.headers.get("Authorization");
    if (!token)
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id, status } = (await request.json()) as {
      id?: string;
      status?: string;
    };
    if (!id || !status)
      return HttpResponse.json(
        { message: "id y status son requeridos" },
        { status: 400 },
      );
    const offer =
      MOCK_OFFERS_MADE.find((o) => o.id === id) ??
      MOCK_OFFERS_RECEIVED.find((o) => o.id === id);
    if (!offer)
      return HttpResponse.json(
        { message: "Oferta no encontrada" },
        { status: 404 },
      );
    const nextStatus = resolveStatus(offer.status, status);
    if (!nextStatus)
      return HttpResponse.json(
        { message: `Acción no válida: ${status}` },
        { status: 400 },
      );
    offer.status = nextStatus;
    return HttpResponse.json(offer, { status: 200 });
  }),

  http.post("*/api/offer", ({ request }) => {
    const token = request.headers.get("Authorization");
    if (!token)
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    return HttpResponse.json({ message: "Oferta creada" }, { status: 201 });
  }),
];