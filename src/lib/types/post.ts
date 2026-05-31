import { PostStatus } from './post-status.enum';

export type PostDto = {
  id: string;
  sellerId: string;
  buyerId?: string;
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
  interactions: unknown[];
};

export type NewPostDto = {
  title: string;
  description: string;
  priceClp: number;
  isNegotiable: boolean;
};
