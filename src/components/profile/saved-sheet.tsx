"use client";

import { IconBookmark } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SavedPostCard } from "./saved-post-card";
import type { PostDto } from "@/lib/types/post";
import { useRemoveSavedPost } from "@/hooks/use-saved-posts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedPosts: PostDto[];
  userId: string;
};

export function SavedSheet({ open, onOpenChange, savedPosts, userId }: Props) {
  const removeSaved = useRemoveSavedPost();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[300px] w-[90vw] max-w-[900px] flex flex-col gap-0 p-0 max-h-[85vh]">
        <DialogHeader className="border-b border-border px-4 pt-4 pb-3 shrink-0">
          <DialogTitle className="text-xs font-black uppercase flex items-center gap-1.5">
            <IconBookmark className="size-3.5" /> Guardados ({savedPosts.length})
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-4">
          {savedPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-10">
              No tienes publicaciones guardadas.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
              {savedPosts.map((p) => (
                <SavedPostCard
                  key={p.id}
                  post={p}
                  onRemove={(postId) => removeSaved.mutate({ postId, userId })}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
