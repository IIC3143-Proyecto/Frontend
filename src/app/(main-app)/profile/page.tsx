"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useQuery } from "@tanstack/react-query";
import { ProfileLayout } from "@/components/profile/profile-layout";
import { useSavedPosts } from "@/hooks/use-saved-posts";
import { syncUser } from "@/lib/api/auth";
import type { SyncUserResponse } from "@/lib/types/auth";

export default function ProfilePage() {
  const { user: authUser } = useUser();
  const sub = authUser?.sub;

  const { data: dbUser } = useQuery<SyncUserResponse>({
    queryKey: ["dbUser", sub],
    queryFn: async () => {
      const data = await syncUser();
      return { ...data, onboardingCompleted: data.onboardingCompleted ?? false };
    },
    enabled: !!sub,
    staleTime: 5 * 60 * 1000,
  });

  const { data: savedPosts = [] } = useSavedPosts(dbUser?.id);

  if (!dbUser) return null;

  return <ProfileLayout user={dbUser} savedPosts={savedPosts} />;
}
