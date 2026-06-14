import { PostStatus } from './post-status.enum';
import type { UserDto, InteractionDto } from './user';

export type PostDto = {
  id: string;
  sellerId: string;
  buyerId: string | null;
  seller: UserDto;
  buyer: UserDto | null;
  title: string;
  description: string;
  priceClp: number;
  isNegotiable: boolean;
  status: PostStatus;
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  offersCount?: number;
  isActive: boolean;
  isDeleted: boolean;
  imagesUrls: string;
  createdAtUtcMinus3: string;
  interactions: InteractionDto[];
};

export type NewPostDto = {
  title: string;
  description: string;
  priceClp: number;
  isNegotiable: boolean;
};

// GET /api/post/:id/tags — backend pendiente
export type PostTagsDto = {
  Talla: string[];
  Condición: string;
  'Tipo de prenda': string[];
  Marca: string[];
  Color: string[];
  Género: string[];
  Estilo: string[];
  Temporada: string[];
};
