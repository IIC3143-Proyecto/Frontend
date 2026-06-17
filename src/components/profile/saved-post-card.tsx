"use client";

import { useState } from "react";
import {
  IconInfoCircle,
  IconCoins,
  IconBookmarkOff,
  IconDots,
} from "@tabler/icons-react";
import type { PostDto } from "@/lib/types/post";
import { cn, formatPriceCLP } from "@/lib/utils";
import { PostDetailModal } from "@/components/common/cards/post-detail-modal";
import { MiniRoundButton } from "@/components/common/mini-round-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SaleView } from "@/components/common/cards/sale-card";

type Props = {
  post: PostDto;
  view: SaleView;
  onRemove?: (postId: string) => void;
};

export function SavedPostCard({ post, view, onRemove }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  const isCompact = view === "grid4";

  const cardClasses = cn(
    "relative bg-card border border-border flex flex-col overflow-hidden",
    view === "list" && "w-full flex-row p-3 gap-3",
    (view === "grid2" || view === "grid4") && "p-3 w-full max-w-[250px]",
  );

  const thumbClasses = cn(
    "bg-muted aspect-[5/6] flex items-center justify-center text-xs text-muted-foreground",
    view === "list" ? "h-auto w-2/5 max-w-40 shrink-0" : "w-full",
  );

  return (
    <article className={cardClasses}>
      {!isCompact && (
        <div className="absolute top-1 right-2 z-20 flex flex-col gap-1">
          <MiniRoundButton aria-label="Ver detalle" onClick={() => setDetailOpen(true)}>
            <IconInfoCircle className="w-4 h-4" />
          </MiniRoundButton>
          <MiniRoundButton aria-label="Hacer oferta">
            <IconCoins className="w-4 h-4" />
          </MiniRoundButton>
          <MiniRoundButton
            aria-label="Quitar de guardados"
            className="text-destructive"
            onClick={() => onRemove?.(post.id)}
          >
            <IconBookmarkOff className="w-4 h-4" />
          </MiniRoundButton>
        </div>
      )}

      <div className={thumbClasses}>Imagen</div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <p className="text-lg font-bold uppercase truncate">{post.title}</p>
          <p className="font-bold text-chart-3">{formatPriceCLP(post.priceClp)}</p>
        </div>

        {isCompact && (
          <div className="flex justify-center pb-2 pt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Acciones" className="rounded-full">
                  <IconDots className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onSelect={() => setDetailOpen(true)}>
                  <IconInfoCircle className="w-4 h-4" /> Ver info
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconCoins className="w-4 h-4" /> Hacer oferta
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => onRemove?.(post.id)}>
                  <IconBookmarkOff className="w-4 h-4" /> Quitar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <PostDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} post={post} />
    </article>
  );
}
