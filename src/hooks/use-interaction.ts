"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAccessToken } from "@/actions/auth";
import { createInteraction, removeInteraction } from "@/lib/api/user";

export function useCreateInteraction() {
  return useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: "Liked" | "Saved" }) => {
      const token = await getAccessToken();
      return createInteraction(postId, type, token);
    },
    onError: (err) => {
      toast.error("Error al registrar interacción", {
        description: err instanceof Error ? err.message : "Inténtalo de nuevo",
      });
    },
  });
}

export function useRemoveInteraction() {
  return useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: "Liked" | "Saved" }) => {
      const token = await getAccessToken();
      return removeInteraction(postId, type, token);
    },
    onError: (err) => {
      toast.error("Error al quitar interacción", {
        description: err instanceof Error ? err.message : "Inténtalo de nuevo",
      });
    },
  });
}
