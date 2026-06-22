import { ProductPost } from "@/hooks/use-feed-navigation";

export type ProductDetails = {
  title: string;
  description: string;
  price: number;
  size: string;
};

export function extractDetails(post: ProductPost): ProductDetails {
  return {
    title: post.title,
    description: post.description,
    price: post.priceClp,
    size: post.size,
  };
}