import { api } from "./index";

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
