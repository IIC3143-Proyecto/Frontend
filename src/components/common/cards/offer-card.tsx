"use client";

import { IconInfoCircle, IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import type { OfferDto } from "@/lib/types/offer";
import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { formatPriceCLP } from "@/lib/utils";
import { OfferDetailModal } from "./offer-detail-modal";
import { MiniRoundButton } from "@/components/common/mini-round-button";
import { Button } from "@/components/ui/button";

type OfferCardProps = {
  offer: OfferDto;
  direction: OfferDirection;
};

export function OfferCard({ offer, direction }: OfferCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  const { post } = offer;
  const counterparty =
    direction === OfferDirection.RECEIVED ? offer.buyer : post.seller;
  const counterpartyLabel =
    direction === OfferDirection.RECEIVED ? "De" : "Para";
  const firstImage = post.imagesUrls?.split(",").filter(Boolean)[0];
  const canModify = direction === OfferDirection.MADE;

  return (
    <article className="relative bg-card border border-border flex flex-row p-3 gap-3 overflow-hidden">
      <div className="bg-muted aspect-5/6 h-auto w-2/5 max-w-40 shrink-0 flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
        {firstImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          "Imagen"
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg font-bold uppercase truncate">{post.title}</p>

            <div className="absolute top-1 right-2 z-20 flex flex-col gap-1">
              <MiniRoundButton
                aria-label="Ver detalle"
                onClick={() => setDetailOpen(true)}
              >
                <IconInfoCircle className="w-4 h-4" />
              </MiniRoundButton>

              {canModify && (
                <MiniRoundButton
                  aria-label="Editar"
                  onClick={() => toast.info("Editar")}
                >
                  <IconPencil className="w-4 h-4" />
                </MiniRoundButton>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground truncate">
            {counterpartyLabel}:{" "}
            {counterparty?.name ?? counterparty?.username ?? "—"}
          </p>

          <div className="flex items-baseline gap-2 mt-2 flex-wrap">
            <span className="font-bold text-chart-3">
              {formatPriceCLP(offer.priceClp)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {formatPriceCLP(post.priceClp)}
            </span>
          </div>

          <span className="inline-block mt-2 text-xs font-bold uppercase border border-border rounded-full px-2 py-0.5">
            {offer.status}
          </span>
        </div>

        <div className="flex gap-2 mt-3 w-full pt-1">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setDetailOpen(true)}
          >
            Ver detalle
          </Button>
        </div>
      </div>

      <OfferDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        offer={offer}
        direction={direction}
      />
    </article>
  );
}
