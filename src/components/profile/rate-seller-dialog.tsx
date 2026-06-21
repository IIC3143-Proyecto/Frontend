"use client";

import { useState } from "react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateSellerRating } from "@/hooks/use-create-seller-rating";

const MAX_SELLER_SCORE = 5.0;
const MIN_SELLER_SCORE = 0.0;

type RateSellerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId: string;
  sellerName: string;
};

export function RateSellerDialog({
  open,
  onOpenChange,
  sellerId,
  sellerName,
}: RateSellerDialogProps) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const createRating = useCreateSellerRating();

  function handleClose() {
    if (createRating.isPending) return;
    setScore(0);
    setHover(0);
    onOpenChange(false);
  }

  function handleSubmit() {
    if (score < MIN_SELLER_SCORE || score > MAX_SELLER_SCORE) return;
    createRating.mutate(
      { sellerId, score },
      {
        onSuccess: () => {
          setScore(0);
          setHover(0);
          onOpenChange(false);
        },
      },
    );
  }

  const active = hover || score;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 pt-4 pb-3">
          <DialogTitle className="text-xs font-black uppercase flex items-center gap-1.5">
            <IconStar className="size-3.5" /> Calificar a @{sellerName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 px-4 py-6">
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHover(0)}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const value = i + 1;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                  className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                  disabled={createRating.isPending}
                  onMouseEnter={() => setHover(value)}
                  onClick={() => setScore(value)}
                >
                  {value <= active ? (
                    <IconStarFilled className="size-8 text-yellow-400" />
                  ) : (
                    <IconStar className="size-8 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground">
            {active > 0 ? `${active} de 5` : "Selecciona una puntuación"}
          </span>
        </div>

        <DialogFooter className="border-t border-border px-4 py-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createRating.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={score < 1 || createRating.isPending}
          >
            {createRating.isPending ? "Enviando…" : "Calificar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
