// Estados de una oferta. Los valores coinciden con los que maneja el backend
// (se comparan de forma case-insensitive en `offer-transitions.ts`).
export enum OfferStatus {
  PENDING = "pendiente",
  ACCEPTED = "aceptada",
  REJECTED = "rechazada",
  CONFIRMED = "confirmada",
  SUCCESSFUL = "exitosa",
}
