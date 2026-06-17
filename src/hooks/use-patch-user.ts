"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAccessToken } from "@/actions/auth";
import { patchUser } from "@/lib/api/user";
import type { ContactInfo } from "@/lib/types/user";
import type { SyncUserResponse } from "@/lib/types/auth";

type PatchContactInput = {
  userId: string;
  sub: string;
  contactInfo: ContactInfo;
};

export function usePatchContact() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ userId, sub, contactInfo }: PatchContactInput) => {
      const token = await getAccessToken();
      const current = queryClient.getQueryData<SyncUserResponse>(["dbUser", sub]);
      await patchUser(
        userId,
        {
          username: current?.username ?? "",
          bio: current?.bio ?? "",
          contactInfo,
        },
        token,
      );
      return { contactInfo };
    },
    onSuccess: ({ contactInfo }, { sub }) => {
      queryClient.setQueryData<SyncUserResponse>(["dbUser", sub], (old) =>
        old ? { ...old, contactInfo } : old,
      );
      toast.success("Contacto actualizado");
    },
    onError: (err) => {
      const status = (err as { status?: number }).status;
      if (status === 401) {
        router.push("/session-expired");
      } else {
        toast.error("Error al guardar contacto", {
          description: err instanceof Error ? err.message : "Inténtalo de nuevo",
        });
      }
    },
  });
}

type PatchStationsInput = { userId: string; sub: string; stations: string[] };

export function usePatchStations() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ userId, sub, stations }: PatchStationsInput) => {
      const token = await getAccessToken();
      const current = queryClient.getQueryData<SyncUserResponse>(["dbUser", sub]);
      await patchUser(
        userId,
        {
          username: current?.username ?? "",
          bio: current?.bio ?? "",
          metro: stations,
        },
        token,
      );
      return { stations };
    },
    onSuccess: ({ stations }, { sub }) => {
      queryClient.setQueryData<SyncUserResponse>(["dbUser", sub], (old) =>
        old ? { ...old, stations } : old,
      );
      toast.success("Zona actualizada");
    },
    onError: (err) => {
      const status = (err as { status?: number }).status;
      if (status === 401) {
        router.push("/session-expired");
      } else {
        toast.error("Error al guardar zona", {
          description: err instanceof Error ? err.message : "Inténtalo de nuevo",
        });
      }
    },
  });
}

