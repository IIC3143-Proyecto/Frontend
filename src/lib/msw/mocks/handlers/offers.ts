import { http, HttpResponse } from "msw";

export const offersHandlers = [
  http.post("*/api/offer", ({ request }) => {
    const token = request.headers.get("Authorization");
    if (!token)
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    return HttpResponse.json({ message: "Oferta creada" }, { status: 201 });
  }),
];
