"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePaginatedFeed, useSearchByTags } from "./use-feed";
import { usePostTags } from "./use-tags";
import { useCreateInteraction } from "./use-interaction";
import { getAccessToken } from "@/actions/auth";
import { removeInteraction } from "@/lib/api/user";
import { fetchPostTags } from "@/lib/api/post";
import type { PostDto } from "@/lib/types/post";

export type ProductPost = PostDto & { size: string };

type Interaction = "Liked" | "Saved" | null;
type HistoryEntry = { postId: string; interaction: Interaction };

export function useFeedNavigation(appliedFilters: string[] = []) {
  const isFiltering = appliedFilters.length > 0;
  const filtersKey = appliedFilters.join("|");

  const { posts: feedPosts, isFetching: isFeedFetching, prefetchIfNeeded } = usePaginatedFeed();
  const { data: searchData = [], isFetching: isSearchFetching } = useSearchByTags(
    isFiltering ? appliedFilters : []
  );
  const source = isFiltering ? searchData : feedPosts;

  const createInteraction = useCreateInteraction();
  const queryClient = useQueryClient();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Reset al cambiar de modo/filtros (ajuste de estado en render, patrón documentado de React)
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (prevFiltersKey !== filtersKey) {
    setPrevFiltersKey(filtersKey);
    setHistory([]);
    setIndex(0);
    setDirection(1);
  }

  const currentPost = source[index] ?? null;
  const canGoBack = index > 0;

  // Talla: solo cae en "no especificada" cuando las tags ya cargaron (evita el flash)
  const { data: postTags } = usePostTags(currentPost?.id);
  const size = postTags ? (postTags["Talla"]?.[0] ?? "no especificada") : "";

  // Prefetch de las tags del siguiente post para que la talla aparezca de inmediato al avanzar
  const nextPostId = source[index + 1]?.id;
  useEffect(() => {
    if (!nextPostId) return;
    queryClient.prefetchQuery({
      queryKey: ["postTags", nextPostId],
      queryFn: async () => fetchPostTags(nextPostId, await getAccessToken()),
    });
  }, [nextPostId, queryClient]);

  // Prefetch de más posts del feed (la búsqueda es finita, sin paginación)
  useEffect(() => {
    if (!isFiltering) prefetchIfNeeded(index);
  }, [index, isFiltering, prefetchIfNeeded]);

  const advance = useCallback(
    (interaction: Interaction, dir: 1 | -1 = 1) => {
      if (!currentPost) return;
      setHistory((h) => [...h, { postId: currentPost.id, interaction }]);
      setDirection(dir);
      setIndex((i) => i + 1);
    },
    [currentPost]
  );

  const like = useCallback(() => {
    if (!currentPost) return;
    createInteraction.mutate({ postId: currentPost.id, type: "Liked" });
    advance("Liked", 1);
  }, [currentPost, createInteraction, advance]);

  const save = useCallback(() => {
    if (!currentPost) return;
    createInteraction.mutate({ postId: currentPost.id, type: "Saved" });
    advance("Saved", 1);
  }, [currentPost, createInteraction, advance]);

  const ignore = useCallback(() => advance(null, -1), [advance]);

  // Para oferta: avanza sin registrar interacción (el rewind no la deshace)
  const next = useCallback(() => advance(null, 1), [advance]);

  const rewind = useCallback(() => {
    if (index === 0) return;
    const entry = history[index - 1];
    setHistory((h) => h.slice(0, index - 1));
    if (entry?.interaction) {
      getAccessToken()
        .then((t) => removeInteraction(entry.postId, entry.interaction!, t))
        .catch(() => {});
    }
    setDirection(-1);
    setIndex((i) => i - 1);
  }, [index, history]);

  const sourceFetching = isFiltering ? isSearchFetching : isFeedFetching;
  const isLoading = sourceFetching && !currentPost;
  const isFinished = !currentPost && !sourceFetching;

  const currentProduct: ProductPost | null = currentPost ? { ...currentPost, size } : null;

  return {
    currentPost: currentProduct,
    direction,
    isLoading,
    isFinished,
    canGoBack,
    like,
    ignore,
    save,
    next,
    rewind,
  };
}
