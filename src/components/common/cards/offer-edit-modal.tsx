"use client";

import { useState } from "react";
import {
  IconCalendar,
  IconCoin,
  IconCoinOff,
  IconLoader2,
  IconLock,
  IconMailCheck,
  IconUser,
} from "@tabler/icons-react";

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
import { OfferPatchAction } from "@/lib/types/offer-patch-action.enum";
import { formatPriceCLP } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  offer: OfferDto;
  direction: OfferDirection;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ACTION_ICONS: Partial<Record<OfferPatchAction, React.ReactNode>> = {
  [OfferPatchAction.ACCEPT]: <IconCoin className="size-5" />,
  [OfferPatchAction.REJECT]: <IconCoinOff className="size-5" />,
  [OfferPatchAction.SELLER_CONFIRM]: <IconMailCheck className="size-5" />,
  [OfferPatchAction.BUYER_CONFIRM]: <IconMailCheck className="size-5" />,
};

export function OfferEditModal({ open, onClose, offer, direction }: Props) {
  const [activeAction, setActiveAction] = useState<OfferPatchAction | null>(
    null,
  );
  const { mutate: patchOffer, isPending } = usePatchOffer({
    onSuccess: onClose,
  });

  const { post } = offer;
  const actions = getOfferActions(offer.status, getRoleForDirection(direction));
  const counterparty =
    direction === OfferDirection.RECEIVED ? offer.buyer : post.seller;

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
        className="flex flex-col gap-0 p-0 w-full sm:max-w-sm"
      >
        <DialogHeader className="px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-xs font-black uppercase tracking-wider">
              Gestionar oferta
            </DialogTitle>
            <span className="text-xs font-medium border border-border rounded-full px-2 py-0.5 whitespace-nowrap">
              {offer.status}
            </span>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-col items-center text-center gap-1">
            <p className="text-sm text-muted-foreground truncate max-w-full">
              {post.title}
            </p>
            <p className="text-4xl font-bold text-chart-3">
              {formatPriceCLP(offer.priceClp)}
            </p>
            <p className="text-sm text-muted-foreground line-through">
              {formatPriceCLP(post.priceClp)}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <IconUser className="size-3.5 shrink-0" />
              {counterparty?.name ?? counterparty?.username ?? "—"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <IconCalendar className="size-3.5 shrink-0" />
              {formatDate(offer.createdAtUtcMinus3)}
            </span>
          </div>

          {actions.length > 0 ? (
            <div
              className={
                actions.length >= 2
                  ? "flex flex-row gap-2"
                  : "flex flex-col gap-2"
              }
            >
              {actions.map((action) => (
                <Button
                  key={action.action}
                  variant={action.variant}
                  disabled={isPending}
                  onClick={() => runAction(action.action)}
                  className={actions.length >= 2 ? "flex-1" : undefined}
                >
                  {activeAction === action.action ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    ACTION_ICONS[action.action]
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <IconLock className="size-3.5 shrink-0" />
              No hay acciones disponibles
            </div>
          )}
        </div>

        <Separator />

        <div className="px-6 py-4 flex justify-end shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
