import { http, HttpResponse } from "msw";
import { MOCK_OFFERS_MADE, MOCK_OFFERS_RECEIVED } from "../data/offers";

export const offersHandlers = [
  http.get("*/api/offer", ({ request }) => {
    const token = request.headers.get("Authorization");
    if (!token)
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });

    const incoming = new URL(request.url).searchParams.get("incoming");
    // truthy (≠ '0'/'false'/'') → ofertas realizadas; en otro caso → recibidas.
    const isMade = !!incoming && incoming !== "0" && incoming !== "false";
    return HttpResponse.json(isMade ? MOCK_OFFERS_MADE : MOCK_OFFERS_RECEIVED);
  }),

  // TODO: habilitar cuando el backend documente PATCH /api/offer.
  http.patch("*/api/offer", ({ request }) => {
    const token = request.headers.get("Authorization");
    if (!token)
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    return HttpResponse.json(
      { message: "Oferta actualizada" },
      { status: 200 },
    );
  }),
];
