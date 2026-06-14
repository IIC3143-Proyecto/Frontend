import type { PostDto } from "@/lib/types/post";

export type MockUser = {
  username: string;
  name: string;
  bio: string;
  photoUrl: string;
  stations: string[];
  contactInfo: {
    instagram: string;
    whatsapp: string;
    email: string;
  };
};

export type ProfileLayoutProps = {
  user: MockUser;
  savedPosts: PostDto[];
};

export const MOCK_METRO: Record<string, string[]> = {
  L1: ['San Pablo', 'Pajaritos', 'Las Rejas', 'Estación Central', 'Baquedano', 'Universidad de Chile'],
  L2: ['Tobalaba', 'Manuel Montt', 'Pedro de Valdivia', 'Los Leones', 'Bustamante'],
  L4: ['Ñuñoa', 'Irarrázaval', 'Macul', 'Grecia'],
};
