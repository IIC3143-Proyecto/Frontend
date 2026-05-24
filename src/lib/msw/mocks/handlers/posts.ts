import { http, HttpResponse } from "msw";
import { PostStatus } from "@/lib/types/post-status.enum";

const POSTS = [
  {
    id: "post_1",
    sellerId: "user_123",
    buyerId: null,
    title: "Audífonos Bluetooth Pro",
    description: "Muy buen estado, poco uso",
    priceClp: 89990,
    isNegotiable: true,
    status: PostStatus.PUBLISHED,
    likesCount: 4,
    savesCount: 1,
    viewsCount: 12,
    images: null,
    isActive: true,
    createdAtUtcMinus3: new Date().toISOString(),
  },
  {
    id: "post_2",
    sellerId: "user_123",
    buyerId: null,
    title: "Polera algodón premium",
    description: "Talla M, usada dos veces",
    priceClp: 12990,
    isNegotiable: false,
    status: PostStatus.UNPUBLISHED,
    likesCount: 0,
    savesCount: 0,
    viewsCount: 3,
    images: null,
    isActive: true,
    createdAtUtcMinus3: new Date().toISOString(),
  },
];

const currentPosts = [...POSTS];

export const postHandlers = [
  http.get("*/posts", () => {
    return HttpResponse.json(currentPosts);
  }),
];
