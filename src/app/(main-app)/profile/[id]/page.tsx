"use client";

import { use } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { ProfileLayout } from "@/components/profile/profile-layout";
import { useSavedPosts } from "@/hooks/use-saved-posts";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user: authUser, dbUser } = useAuth();

  const isOwner = !!dbUser?.id && dbUser.id === id;

  const { data: userProfile } = useUser(id);

  const { data: savedPosts = [] } = useSavedPosts(isOwner ? id : undefined);

  if (!userProfile) return null;

  return (
    <ProfileLayout
      user={userProfile}
      savedPosts={savedPosts}
      sub={authUser?.sub ?? ""}
      isOwner={isOwner}
    />
  );
}
