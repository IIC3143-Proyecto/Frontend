"use client";

import { use } from "react";
import Link from "next/link";
import { IconArrowLeft, IconUserOff } from "@tabler/icons-react";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { UserPosts } from "@/components/profile/user-posts";
import { Button } from "@/components/ui/button";

export default function UserPostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { dbUser } = useAuth();

  const isOwner = !!dbUser?.id && dbUser.id === id;

  const { data: userProfile, isLoading, isError } = useUser(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        <p className="text-sm">Cargando publicaciones…</p>
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
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/profile/${id}`} aria-label="Volver al perfil">
            <IconArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="font-black uppercase text-sm tracking-wider">
          Publicaciones de @{userProfile.username}
        </h1>
      </div>

      <UserPosts userId={id} isOwner={isOwner} />
    </div>
  );
}
