import { http, HttpResponse } from "msw";
import { PostStatus } from "@/lib/types/post-status.enum";
import { Post } from "@/lib/types/post";

const POSTS: Post[] = [
  {
    id: "post_1",
    sellerId: "user_123",
    title: "Vintage 90s Jacket",
    description: "Chaqueta vintage en excelente estado, sin defectos.",
    priceClp: 25000,
    isNegotiable: true,
    status: PostStatus.PUBLISHED,
    likesCount: 4,
    savesCount: 1,
    viewsCount: 12,
    offersCount: 3,
    isActive: true,
    createdAtUtcMinus3: new Date().toISOString(),
    // images omitido — es opcional
  },
  {
    id: "post_2",
    sellerId: "user_123",
    title: "Levis 501 Custom",
    description: "Talla M, usada dos veces.",
    priceClp: 18000,
    isNegotiable: false,
    status: PostStatus.PUBLISHED,
    likesCount: 0,
    savesCount: 0,
    viewsCount: 3,
    offersCount: 0,
    isActive: true,
    createdAtUtcMinus3: new Date().toISOString(),
  },
  {
    id: "post_3",
    sellerId: "user_123",
    buyerId: "user_456",
    title: "Carhartt Detroit",
    description: "Chaqueta Carhartt original.",
    priceClp: 45000,
    isNegotiable: true,
    status: PostStatus.RESERVED,
    likesCount: 8,
    savesCount: 3,
    viewsCount: 25,
    offersCount: 1,
    isActive: true,
    createdAtUtcMinus3: new Date().toISOString(),
  },
  {
    id: "post_4",
    sellerId: "user_123",
    title: "Polera Algodón Premium",
    description: "Polera básica, talla M.",
    priceClp: 12990,
    isNegotiable: false,
    status: PostStatus.UNPUBLISHED,
    likesCount: 0,
    savesCount: 0,
    viewsCount: 0,
    offersCount: 0,
    isActive: false,
    createdAtUtcMinus3: new Date().toISOString(),
  },
  {
    id: "post_5",
    sellerId: "user_123",
    buyerId: "user_789",
    title: "Archive Nike Bag",
    description: "Bolso Nike de colección.",
    priceClp: 30000,
    isNegotiable: false,
    status: PostStatus.SOLD,
    likesCount: 10,
    savesCount: 4,
    viewsCount: 40,
    offersCount: 1,
    isActive: false,
    createdAtUtcMinus3: new Date().toISOString(),
  },
];

const currentPosts = [...POSTS];

export const postsHandlers = [
  http.get("*/posts", () => {
    return HttpResponse.json(currentPosts);
  }),
];
