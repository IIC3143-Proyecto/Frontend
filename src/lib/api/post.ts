import { Post } from "@/lib/types/post";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const getPosts = async (): Promise<Post[]> => {
  const res = await fetch(`${BASE}/posts`);
  if (!res.ok) throw new Error("Error al obtener posts");
  return res.json();
};
