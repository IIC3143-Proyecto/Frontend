"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TagsByCategoryDto } from "@/types/api";

type TagCategories = Record<string, string[]>;

export function useTags() {
  const { data: categories = {}, isLoading, error } = useQuery<TagCategories>({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetch(api.tags());
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json() as TagsByCategoryDto;
      return data.tags;
    },
    staleTime: 60 * 60 * 1000, // 1 hour — tags change rarely
  });

  return {
    categories,
    isLoading,
    error: error?.message ?? null,
  };
}
