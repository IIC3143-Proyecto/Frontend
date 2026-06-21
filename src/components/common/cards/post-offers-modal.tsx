"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOffers } from "@/hooks/use-offers";
import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { OfferCard } from "./offer-card";
import type { PostDto } from "@/lib/types/post";

type Props = {
  open: boolean;
  onClose: () => void;
  post: PostDto;
};

export function PostOffersModal({ open, onClose, post }: Props) {
  const { data: offers, isLoading, isError } = useOffers(OfferDirection.RECEIVED);

  const postOffers = useMemo(
    () =>
      (offers ?? [])
        .filter((o) => o.postId === post.id)
        .map((o) => ({ ...o, post })),
    [offers, post],
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="min-w-[300px] w-[90vw] max-w-[640px] flex flex-col gap-0 p-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="border-b border-border px-4 pt-4 pb-3 shrink-0">
          <DialogTitle className="text-xs font-black uppercase tracking-wider truncate">
            Ofertas — {post.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {isLoading && (
            <p className="text-xs text-muted-foreground text-center py-8">
              Cargando ofertas…
            </p>
          )}
          {isError && (
            <p className="text-xs text-destructive text-center py-8">
              Error al cargar las ofertas.
            </p>
          )}
          {!isLoading && !isError && postOffers.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              Esta publicación no tiene ofertas.
            </p>
          )}
          {postOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              direction={OfferDirection.RECEIVED}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
