import type { PostDto } from './post';

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
  contactInfo?: object;
  status: string;
  createdAtUtcMinus3: string;
  updatedAtUtcMinus3: string;
  posts: PostDto[];
  interactions: InteractionDto[];
};

