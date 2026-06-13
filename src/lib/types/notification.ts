export type NotificationType =
  | "Sistema"
  | "Seguidores"
  | "Siguiendo"
  | "Ofertas"
  | "Publicaciones"
  | "Vendedor";

export type NotificationTargetUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  photoUrl?: string;
  contactInfo?: Record<string, string>;
  status: string;
  createdAtUtcMinus3: string;
  updatedAtUtcMinus3: string;
  posts: unknown[];
  interactions: unknown[];
};

export type NotificationDto = {
  id: string;
  targetUserId: string;
  targetUser: NotificationTargetUser;
  type: NotificationType;
  title: string;
  content: string;
  createdAtUtcMinus3: string;
};
