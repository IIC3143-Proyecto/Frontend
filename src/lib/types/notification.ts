import type { UserDto } from './user';

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
  targetUser: UserDto;
  type: NotificationType;
  title: string;
  content: string;
  createdAtUtcMinus3: string;
};
