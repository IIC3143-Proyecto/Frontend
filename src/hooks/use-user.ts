"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getUser } from "@/lib/api/user";
import type { UserDto } from "@/lib/types/user";

export function useUser(userId: string | undefined) {
  return useQuery<UserDto>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const token = await getAccessToken();
      return getUser(userId!, token);
    },
    enabled: !!userId,
    // No reintentar ante errores de cliente (p. ej. 404 usuario no encontrado):
    // el usuario no va a aparecer reintentando.
    retry: (count, error) => {
      const status = (error as Error & { status?: number }).status;
      if (status && status >= 400 && status < 500) return false;
      return count < 2;
    },
  });
}
