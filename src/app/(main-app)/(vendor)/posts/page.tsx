"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { PostsList } from "@/components/vendor/posts-list";
import { PostCreateModal } from "@/components/common/cards/post-create-modal";

export default function PostsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-black uppercase text-lg tracking-wider h-7 sticky top-0 md:top-20 z-30 w-full bg-background text-center">
        Mis Publicaciones
      </h1>

      <PostsList />

      <button
        type="button"
        aria-label="Nueva publicación"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 md:bottom-4 right-4 bg-primary text-primary-foreground rounded-full cursor-pointer items-center z-35 p-3"
      >
        <IconPlus className="w-6 h-6 md:w-10 md:h-10" />
      </button>

      <PostCreateModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
