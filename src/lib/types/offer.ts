import type { PostDto } from "./post";
import type { UserDto } from "./user";

export type OfferDto = {
  id: string;
  buyerId: string;
  buyer: UserDto;
  postId: string;
  post: PostDto;
  priceClp: number;
  comment?: string;
  status: string;
  createdAtUtcMinus3: string;
};
