export type NotificationType =
  | "Sistema"
  | "Seguidores"
  | "Siguiendo"
  | "Ofertas"
  | "Publicaciones"
  | "Vendedor";

export type NotificationDto = {
  id: string;
  targetUserId: string;
  targetUser: { name: string; username: string; photoUrl?: string };
  type: NotificationType;
  title: string;
  content: string;
  createdAtUtcMinus3: string;
  read?: boolean;
};
