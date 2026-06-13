import type { NotificationDto } from "@/lib/types/notification";

const baseUser = {
  targetUserId: "user-001",
  targetUser: { name: "Florencia Aqueveque", username: "floaq" },
};

const now = new Date();
const minsAgo = (m: number) =>
  new Date(now.getTime() - m * 60_000).toISOString();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 86_400_000).toISOString();

export const MOCK_NOTIFICATIONS: NotificationDto[] = [
  {
    id: "notif-001",
    ...baseUser,
    type: "Sistema",
    title: "Mantenimiento programado",
    content: "El sistema estara en mantenimiento el sabado a las 2:00 AM por 30 minutos.",
    createdAtUtcMinus3: minsAgo(5),
    read: false,
  },
  {
    id: "notif-002",
    ...baseUser,
    type: "Seguidores",
    title: "Nuevo seguidor",
    content: "@marti.gl comenzo a seguirte. Revisa su perfil!",
    createdAtUtcMinus3: minsAgo(45),
    read: false,
  },
  {
    id: "notif-003",
    ...baseUser,
    type: "Siguiendo",
    title: "Nueva publicacion de alguien que seguis",
    content: "@ropa.sustentable publico un nuevo articulo: Vestido lino talla M.",
    createdAtUtcMinus3: daysAgo(1),
    read: true,
  },
  {
    id: "notif-004",
    ...baseUser,
    type: "Ofertas",
    title: "Oferta recibida",
    content: "Recibiste una oferta de $8.500 por tu publicacion 'Cartera de cuero beige'.",
    createdAtUtcMinus3: daysAgo(2),
    read: false,
  },
  {
    id: "notif-005",
    ...baseUser,
    type: "Publicaciones",
    title: "Tu publicacion fue guardada",
    content: "@cami.store guardo tu publicacion 'Polera oversize negra'.",
    createdAtUtcMinus3: daysAgo(3),
    read: true,
  },
  {
    id: "notif-006",
    ...baseUser,
    type: "Vendedor",
    title: "Venta confirmada",
    content: "Tu venta de 'Jeans wide leg talla 38' fue marcada como completada.",
    createdAtUtcMinus3: daysAgo(5),
    read: true,
  },
];
