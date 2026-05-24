"use client";

import { usePosts } from "@/hooks/use-posts";

export function PostsList() {
  const { data: posts, isLoading, isError } = usePosts();

  if (isLoading) return <p>Cargando...</p>;
  if (isError) return <p>Error al cargar los posts</p>;

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.priceClp}</p>
          <span>{post.status}</span>
        </li>
      ))}
    </ul>
  );
}
