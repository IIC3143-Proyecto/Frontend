"use client";

import type { MockUser } from "@/lib/types/profile-mockup";
import type { PostDto } from "@/lib/types/post";
import { PostStatus } from "@/lib/types/post-status.enum";
import { Layout3Grid } from "@/components/profile/layout-3-grid";

const MOCK_USER: MockUser = {
  username: "michi_store",
  name: "María González",
  bio: "Vendo ropa en buen estado. Precios justos, despacho a todo Santiago.",
  photoUrl: "https://i.pravatar.cc/150?img=47",
  stations: ["Baquedano", "Tobalaba", "Manuel Montt"],
  contactInfo: {
    instagram: "@michi.store",
    whatsapp: "91234567",
    email: "michi@ejemplo.com",
  },
};

const MOCK_SELLER = {
  id: "user-1",
  name: "María González",
  username: "michi_store",
  email: "michi@ejemplo.com",
  providerAuth0: "auth0|mock",
  status: "active",
  createdAtUtcMinus3: "2024-01-01T00:00:00",
  updatedAtUtcMinus3: "2024-01-01T00:00:00",
  posts: [] as PostDto[],
  interactions: [],
};

const MOCK_SAVED: PostDto[] = [
  {
    id: "1", sellerId: "user-1", buyerId: null,
    seller: MOCK_SELLER, buyer: null,
    title: "Chaqueta de cuero", description: "Chaqueta de cuero en muy buen estado",
    priceClp: 25000, isNegotiable: true,
    status: PostStatus.PUBLISHED,
    likesCount: 3, savesCount: 1, viewsCount: 12, offersCount: 0,
    isActive: true, isDeleted: false, imagesUrls: "",
    createdAtUtcMinus3: "2025-03-01T00:00:00", interactions: [],
  },
  {
    id: "2", sellerId: "user-1", buyerId: null,
    seller: MOCK_SELLER, buyer: null,
    title: "Vestido floral verano", description: "Vestido floral talla S",
    priceClp: 12000, isNegotiable: false,
    status: PostStatus.PUBLISHED,
    likesCount: 5, savesCount: 2, viewsCount: 20, offersCount: 1,
    isActive: true, isDeleted: false, imagesUrls: "",
    createdAtUtcMinus3: "2025-03-05T00:00:00", interactions: [],
  },
  {
    id: "3", sellerId: "user-1", buyerId: null,
    seller: MOCK_SELLER, buyer: null,
    title: "Jeans skinny talla 38", description: "Jeans en buen estado",
    priceClp: 8000, isNegotiable: true,
    status: PostStatus.RESERVED,
    likesCount: 2, savesCount: 1, viewsCount: 8, offersCount: 1,
    isActive: true, isDeleted: false, imagesUrls: "",
    createdAtUtcMinus3: "2025-03-10T00:00:00", interactions: [],
  },
  {
    id: "4", sellerId: "user-1", buyerId: "user-2",
    seller: MOCK_SELLER, buyer: null,
    title: "Polera básica negra", description: "Polera de algodón talla M",
    priceClp: 5000, isNegotiable: false,
    status: PostStatus.SOLD,
    likesCount: 1, savesCount: 0, viewsCount: 5, offersCount: 0,
    isActive: false, isDeleted: false, imagesUrls: "",
    createdAtUtcMinus3: "2025-03-15T00:00:00", interactions: [],
  },
];

export default function ProfilePage() {
  return <Layout3Grid user={MOCK_USER} savedPosts={MOCK_SAVED} />;
}
