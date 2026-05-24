import { PostStatus } from "./post-status.enum";

export type Post = {
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
  images?: string;
  isActive: boolean;
  createdAtUtcMinus3: string;
};
