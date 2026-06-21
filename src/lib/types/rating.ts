import type { UserDto } from "./user";

export type SellerTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export type AverageSellerRatingDto = {
  sellerId: string;
  seller: UserDto;
  score: number;
  tier: SellerTier;
  timesRated: number;
};

export type SellerRatingDto = AverageSellerRatingDto & {
  buyerId: string;
  buyer: UserDto;
  updatedAtUtcMinus3: string;
};
