import type { PostDto } from "./post";
import type { UserDto } from "./user";
import type { OfferPatchAction } from "./offer-patch-action.enum";

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

export interface PatchOfferRequest {
  id: string;
  status: OfferPatchAction;
}