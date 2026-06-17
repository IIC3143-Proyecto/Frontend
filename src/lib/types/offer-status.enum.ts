export enum OfferStatus {
  PENDING = "Pendiente", // El comprador ofertó; el vendedor aún no responde.
  ACCEPTED = "Aceptada", // El vendedor aceptó la oferta.
  REJECTED = "Rechazada", // El vendedor rechazó la oferta.
  BUYER_CONFIRMED = "Comprador confirmó", // El comprador confirmó la compra.
  SELLER_CONFIRMED = "Vendedor confirmó", // El vendedor confirmó la venta.
  SUCCESSFUL = "Exitosa", // Ambas partes confirmaron.
  FAILED = "Fallida", // Una de las partes no confirmó.
  DELETED = "Eliminada", // El comprador eliminó la oferta.
}
