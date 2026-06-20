"use client";

import { useState } from "react";
import { IconInfoCircle, IconCoins, IconBookmarkOff } from "@tabler/icons-react";
import type { PostDto } from "@/lib/types/post";
import { formatPriceCLP } from "@/lib/utils";
import { PostDetailModal } from "@/components/common/cards/post-detail-modal";
import { MiniRoundButton } from "@/components/common/mini-round-button";
import { MakeOfferForm } from "@/components/common/cards/make-offer/make-offer-form";
import { useCreateOffer } from "@/hooks/use-create-offer";
import type { OfferForm } from "@/components/common/cards/make-offer/offer-schema";

type Props = {
  post: PostDto;
  onRemove?: (postId: string) => void;
};

export function SavedPostCard({ post, onRemove }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const createOffer = useCreateOffer();

  function handleOfferSubmit(data: OfferForm) {
    createOffer.mutate({ postId: post.id, priceClp: data.priceClp, comment: data.comment });
  }

  return (
    <article data-testid="saved-post-card" className="relative bg-card border border-border flex flex-col p-3 w-full max-w-62.5 overflow-hidden">
      <div className="absolute top-1 right-2 z-20 flex flex-col gap-1">
        <MiniRoundButton aria-label="Ver detalle" onClick={() => setDetailOpen(true)}>
          <IconInfoCircle className="size-4" />
        </MiniRoundButton>
        <MiniRoundButton aria-label="Hacer oferta" onClick={() => setOfferOpen(true)}>
          <IconCoins className="size-4" />
        </MiniRoundButton>
        <MiniRoundButton
          aria-label="Quitar de guardados"
          className="text-destructive"
          onClick={() => onRemove?.(post.id)}
        >
          <IconBookmarkOff className="size-4" />
        </MiniRoundButton>
      </div>

      <div className="bg-muted aspect-5/6 w-full flex items-center justify-center text-xs text-muted-foreground">
        Imagen
      </div>

      <div className="flex-1 flex flex-col min-w-0 mt-1">
        <p className="text-lg font-bold uppercase truncate">{post.title}</p>
        <p className="font-bold text-chart-3">{formatPriceCLP(post.priceClp)}</p>
      </div>

      <PostDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} post={post} />
      <MakeOfferForm
        post={post}
        open={offerOpen}
        onOpenChange={setOfferOpen}
        onSubmit={handleOfferSubmit}
      />
    </article>
  );
}
