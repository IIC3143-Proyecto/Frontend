import type { PostDto } from './post';

export type ContactInfo = {
  instagram?: string;
  email?: string;
  whatsapp?: string;
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

export type UserDto = {
  id: string;
  name: string;
  username: string;
  email: string;
  providerAuth0: string;
  bio?: string;
  photoUrl?: string;
  contactInfo?: ContactInfo;
  status: string;
  createdAtUtcMinus3: string;
  updatedAtUtcMinus3: string;
  posts: PostDto[];
  interactions: InteractionDto[];
};

