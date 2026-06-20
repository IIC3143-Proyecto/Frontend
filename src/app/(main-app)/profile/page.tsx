"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { ProfileLayout } from "@/components/profile/profile-layout";
import { useSavedPosts } from "@/hooks/use-saved-posts";

export default function ProfilePage() {
  const { user: authUser, dbUser } = useAuth();
  const { data: userProfile } = useUser(dbUser?.id);
  const { data: savedPosts = [] } = useSavedPosts(dbUser?.id);

  if (!userProfile) return null;

  return (
    <ProfileLayout
      user={userProfile}
      savedPosts={savedPosts}
      sub={authUser?.sub ?? ""}
    />
  );
}
