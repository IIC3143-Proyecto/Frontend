"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { PostsList } from "@/components/vendor/posts-list";
import { CreatePostModal } from "@/components/create-post/create-post-modal";

export default function PostsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-black uppercase text-lg tracking-wider">
        Mis Publicaciones
      </h1>

      <PostsList />

      <CreatePostModal isOpen={open} onClose={() => setOpen(false)} />

      <button
        type="button"
        aria-label="Nueva publicación"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full cursor-pointer items-center z-50 p-3"
      >
        <IconPlus className="w-6 h-6 md:w-10 md:h-10" />
      </button>
    </div>
  );
}
