"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getUserTagPreferences } from "@/lib/api/user";
import type { UserTagPreferenceDto } from "@/lib/types/tag";

export function useUserTagPreferences(userId: string | undefined) {
  return useQuery<UserTagPreferenceDto[]>({
    queryKey: ["userTagPreferences", userId],
    queryFn: async () => {
      const token = await getAccessToken();
      return getUserTagPreferences(userId!, token);
    },
    enabled: !!userId,
  });
}
