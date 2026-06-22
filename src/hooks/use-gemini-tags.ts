"use client";

import { useMutation } from '@tanstack/react-query';
import { getAccessToken } from '@/actions/auth';
import { fetchGeminiTags } from '@/lib/api/gemini';
import type { TagDto } from '@/lib/types/tag';

export type { TagDto };

export function useGeminiTags() {
  return useMutation<TagDto[], Error, File[]>({
    mutationFn: async (images: File[]) => {
      const token = await getAccessToken();
      return fetchGeminiTags(images, token);
    },
  });
}
