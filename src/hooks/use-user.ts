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
  });
}
