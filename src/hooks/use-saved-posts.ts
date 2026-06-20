"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAccessToken } from "@/actions/auth";
import { getSavedPosts, removeInteraction } from "@/lib/api/user";
import type { PostDto } from "@/lib/types/post";

export function useSavedPosts(userId: string | undefined) {
  return useQuery<PostDto[]>({
    queryKey: ["savedPosts", userId],
    queryFn: async () => {
      const token = await getAccessToken();
      return getSavedPosts(userId!, token);
    },
    enabled: !!userId,
  });
}

export function useRemoveSavedPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: string; userId: string }) => {
      const token = await getAccessToken();
      await removeInteraction(postId, "Saved", token);
    },
    onSuccess: (_, { postId, userId }) => {
      queryClient.setQueryData<PostDto[]>(["savedPosts", userId], (old) =>
        old ? old.filter((p) => p.id !== postId) : [],
      );
    },
    onError: (err) => {
      toast.error("No se pudo quitar de guardados", {
        description: err instanceof Error ? err.message : "Inténtalo de nuevo",
      });
    },
  });
}
