import { PostStatus } from './post-status.enum';
import type { UserDto, InteractionDto } from './user';

export type PostDto = {
  id: string;
  sellerId: string;
  buyerId?: string;
  seller: UserDto;
  buyer?: UserDto;
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
  images?: string;
  createdAtUtcMinus3: string;
  interactions: InteractionDto[];
};

export type NewPostDto = {
  title: string;
  description: string;
  priceClp: number;
  isNegotiable: boolean;
};
