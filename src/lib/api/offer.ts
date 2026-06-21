import type { OfferDto, PatchOfferRequest } from "@/lib/types/offer";
import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { BASE } from "./base";
import { api } from "./index";

// incoming=true  → ofertas REALIZADAS por el usuario (salientes, el usuario es el buyer).
// incoming=falsy → ofertas RECIBIDAS por el usuario (entrantes, el usuario es el seller).
export async function getOffers(
  direction: OfferDirection,
  accessToken: string,
): Promise<OfferDto[]> {
  const incoming = direction === OfferDirection.MADE;
  const res = await fetch(`${BASE}/api/offer?incoming=${incoming}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(
        (json as { message?: string }).message ??
          "Error al obtener las ofertas",
      ),
      { status: res.status },
    );
  }
  return res.json() as Promise<OfferDto[]>;
}

export async function patchOffer(
  body: PatchOfferRequest,
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${BASE}/api/offer`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(
        (json as { message?: string }).message ??
          "Error al actualizar la oferta",
      ),
      { status: res.status },
    );
  }
}

export async function createOffer(
  data: { postId: string; priceClp: number; comment?: string },
  accessToken: string,
): Promise<void> {
  const res = await fetch(api.offer(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(
        (json as { message?: string }).message ?? "Error al crear la oferta",
      ),
      { status: res.status },
    );
  }
}