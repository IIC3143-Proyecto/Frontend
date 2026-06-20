"use client";

import { use } from "react";
import Link from "next/link";
import { IconUserOff } from "@tabler/icons-react";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { ProfileLayout } from "@/components/profile/profile-layout";
import { useSavedPosts } from "@/hooks/use-saved-posts";
import { Button } from "@/components/ui/button";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user: authUser, dbUser } = useAuth();

  const isOwner = !!dbUser?.id && dbUser.id === id;

  const { data: userProfile, isLoading, isError } = useUser(id);

  const { data: savedPosts = [] } = useSavedPosts(isOwner ? id : undefined);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        <p className="text-sm">Cargando perfil…</p>
      </div>
    );
  }

  if (isError || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
        <IconUserOff className="size-10 text-muted-foreground" />
        <p className="text-base font-black uppercase tracking-wide">
          Usuario no encontrado
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Este perfil no existe o ya no está disponible.
        </p>
        <Button variant="outline" size="sm" asChild className="mt-2">
          <Link href="/feed">Volver al feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <ProfileLayout
      user={userProfile}
      savedPosts={savedPosts}
      sub={authUser?.sub ?? ""}
      isOwner={isOwner}
    />
  );
}
