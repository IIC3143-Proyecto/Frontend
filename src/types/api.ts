// DTO types derived from docs/backend.md

export type UserDto = {
  id: string;
  name: string;
  username: string;
  email: string;
  providerAuth0: string;
  bio?: string;
  photoUrl?: string;
  contactInfo?: object;
  notificationPreferences?: object;
  createdAtUtcMinus3: string;
  updatedAtUtcMinus3: string;
  posts: PostDto[];
  interactions: InteractionDto[];
  following: FollowerDto[];
  followers: FollowerDto[];
};

// BFF adds onboardingCompleted derived from UserDto.bio
export type SyncUserResponse = UserDto & {
  onboardingCompleted: boolean;
};

export type PostDto = {
  id: string;
  sellerId: string;
  buyerId?: string;
  seller: UserDto;
  buyer?: UserDto;
  title: string;
  description: string;
  priceClp: number;
  isNegotiable: boolean;
  status: 'Sin publicar' | 'Publicado' | 'Reservado' | 'Vendido';
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  isActive: boolean;
  isDeleted: boolean;
  images?: string;
  createdAtUtcMinus3: string;
  interactions: InteractionDto[];
};

export type NewPostDto = {
  title: string;
  description: string;
  priceClp: number;
  isNegotiable: boolean;
};

export type PatchPostDto = {
  id: string;
  title?: string;
  description?: string;
  priceClp?: number;
  isNegotiable?: boolean;
  status?: PostDto['status'];
};

export type TagsByCategoryDto = {
  tags: Record<string, string[]>;
};

export type SimpleResponseDto = {
  message: string;
};

export type InteractionDto = {
  id: string;
  userId: string;
  postId: string;
  type: 'Liked' | 'Saved' | 'Offered' | 'Purchased';
  user: UserDto;
  post: PostDto;
  createdAtUtcMinus3: string;
};

export type FollowerDto = {
  followerId: string;
  followedId: string;
  follower: UserDto;
  followed: UserDto;
};
