"use client";

import { useMemo } from "react";
import { SavedPostCard } from "./saved-post-card";
import { usePosts } from "@/hooks/use-posts";

type Props = {
  userId: string;
  isOwner?: boolean;
};

export function UserPosts({ userId, isOwner = false }: Props) {
  const { data: posts, isLoading, isError } = usePosts(userId);

  const visiblePosts = useMemo(
    () => (posts ?? []).filter((p) => !p.isDeleted),
    [posts],
  );

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground text-center py-10">
        Cargando publicaciones…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-xs text-destructive text-center py-10">
        Error al cargar las publicaciones. Inténtalo de nuevo más tarde.
      </p>
    );
  }

  if (visiblePosts.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-10">
        {isOwner
          ? "Aún no tienes publicaciones."
          : "Este usuario no tiene publicaciones."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-xs text-muted-foreground">
        {visiblePosts.length}{" "}
        {visiblePosts.length === 1 ? "publicación" : "publicaciones"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
        {visiblePosts.map((p) => (
          <SavedPostCard key={p.id} post={p} canOffer={!isOwner} />
        ))}
      </div>
    </div>
  );
}
