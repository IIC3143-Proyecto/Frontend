import { PostStatus } from './post-status.enum';
import type { UserDto, InteractionDto } from './user';

export interface PhotoItem {
  file: File;
  preview: string;
}

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

export type PostTagsDto = Record<string, string[]>;
