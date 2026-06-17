import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { OfferStatus } from "@/lib/types/offer-status.enum";

// El rol del usuario frente a una oferta depende de qué pestaña está viendo:
// - ofertas RECIBIDAS  → el usuario es el VENDEDOR (alguien ofertó por su post)
// - ofertas REALIZADAS → el usuario es el COMPRADOR (él hizo la oferta)
export type OfferRole = "buyer" | "seller";

export function roleForDirection(direction: OfferDirection): OfferRole {
  return direction === OfferDirection.RECEIVED ? "seller" : "buyer";
}

export type OfferAction = {
  label: string;
  nextStatus: OfferStatus;
  variant: "default" | "destructive" | "outline";
};

// Devuelve las transiciones que el usuario (según su rol) puede ejecutar sobre
// la oferta en su estado actual. Replica las reglas del backend:
//   pendiente  →(vendedor)            aceptada | rechazada
//   aceptada   →(comprador|vendedor)  confirmada
//   confirmada →(la otra parte)       exitosa
// rechazada y exitosa son estados terminales.
export function getOfferActions(
  status: string,
  role: OfferRole,
): OfferAction[] {
  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case OfferStatus.PENDING:
      return role === "seller"
        ? [
            { label: "Aceptar", nextStatus: OfferStatus.ACCEPTED, variant: "default" },
            { label: "Rechazar", nextStatus: OfferStatus.REJECTED, variant: "destructive" },
          ]
        : [];

    case OfferStatus.ACCEPTED:
      return [
        { label: "Confirmar", nextStatus: OfferStatus.CONFIRMED, variant: "default" },
      ];

    case OfferStatus.CONFIRMED:
      return [
        { label: "Confirmar entrega", nextStatus: OfferStatus.SUCCESSFUL, variant: "default" },
      ];

    default:
      return [];
  }
}
