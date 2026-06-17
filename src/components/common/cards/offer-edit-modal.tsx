"use client";

import { useState } from "react";
import { IconLoader2, IconLock } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { usePatchOffer } from "@/hooks/use-patch-offer";
import { getOfferActions, getRoleForDirection } from "@/lib/offer-transitions";
import type { OfferDto } from "@/lib/types/offer";
import { OfferDirection } from "@/lib/types/offer-direction.enum";
import type { OfferPatchAction } from "@/lib/types/offer-patch-action.enum";
import { formatPriceCLP } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  offer: OfferDto;
  direction: OfferDirection;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
      {children}
    </p>
  );
}

export function OfferEditModal({ open, onClose, offer, direction }: Props) {
  const [activeAction, setActiveAction] = useState<OfferPatchAction | null>(
    null,
  );
  const { mutate: patchOffer, isPending } = usePatchOffer({
    onSuccess: onClose,
  });

  const { post } = offer;
  const actions = getOfferActions(offer.status, getRoleForDirection(direction));

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const runAction = (action: OfferPatchAction) => {
    setActiveAction(action);
    patchOffer(
      { id: offer.id, status: action },
      { onSettled: () => setActiveAction(null) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex flex-col p-0 gap-0 w-full sm:max-w-md"
      >
        <DialogHeader className="px-6 pt-5 pb-4 shrink-0">
          <DialogTitle className="text-base font-semibold">
            Gestionar oferta
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold uppercase leading-tight truncate">
              {post.title}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-chart-3">
                {formatPriceCLP(offer.priceClp)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPriceCLP(post.priceClp)}
              </span>
            </div>
          </div>

          <div>
            <FieldLabel>Estado actual</FieldLabel>
            <span className="inline-block text-xs font-bold uppercase border border-border rounded-full px-2 py-0.5">
              {offer.status}
            </span>
          </div>

          <Separator />

          {actions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <FieldLabel>Acciones disponibles</FieldLabel>
              {actions.map((action) => (
                <Button
                  key={action.action}
                  variant={action.variant}
                  disabled={isPending}
                  onClick={() => runAction(action.action)}
                >
                  {activeAction === action.action && (
                    <IconLoader2 className="mr-1.5 size-4 animate-spin" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-3xl bg-muted px-3 py-3 text-sm font-black uppercase text-muted-foreground">
              <IconLock className="size-3.5 shrink-0" />
              <span>No hay acciones disponibles</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="px-6 py-4 flex items-center justify-end shrink-0">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
            className="text-muted-foreground"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
