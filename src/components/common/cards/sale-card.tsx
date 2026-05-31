"use client";

import {
  IconInfoCircle,
  IconDots,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import type { Post } from "@/lib/types/post";
import { PostStatus } from "@/lib/types/post-status.enum";
import { cn, formatPriceCLP } from "@/lib/utils";
import { PostDetailModal } from "./post-detail-modal";
import { PostEditModal } from "./post-edit-modal";
import { MiniRoundButton } from "@/components/common/mini-round-button";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export type SaleView = "list" | "grid2" | "grid4";

type SaleCardProps = {
  post: Post;
  view: SaleView;
  onDeleteAction?: (postId: string) => void;
  isDeleting?: boolean;
};

const STEPS = ["Con ofertas", "Oferta aceptada", "Venta realizada"] as const;

function getSteps(post: Post): [boolean, boolean, boolean] {
  const isSold = post.status === PostStatus.SOLD;
  const isAccepted = post.status === PostStatus.RESERVED || isSold;
  const hasOffers = post.offersCount > 0 || isAccepted;
  return [hasOffers, isAccepted, isSold];
}

function VerticalTimeline({ steps }: { steps: [boolean, boolean, boolean] }) {
  return (
    <div className="relative">
      {STEPS.map((label, i) => {
        const done = steps[i];
        const hasNext = i < STEPS.length - 1;
        const nextDone = hasNext && steps[i + 1];
        return (
          <div
            key={label}
            className={cn(
              "relative flex items-center gap-2 mb-2",
              done ? "text-chart-3" : "text-muted-foreground",
            )}
          >
            {hasNext && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-1.5 top-1/2 w-0.5 h-[calc(100%+0.5rem)] -translate-x-1/2",
                  nextDone ? "bg-chart-3" : "bg-muted-foreground",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 w-3 h-3 rounded-full border-2 border-card shrink-0",
                done ? "bg-chart-3" : "bg-muted-foreground",
              )}
            />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalTimeline({ steps }: { steps: [boolean, boolean, boolean] }) {
  const seg1Done = steps[1];
  const seg2Done = steps[2];

  return (
    <div className="relative w-12.5 flex justify-between items-center my-3">
      <span
        aria-hidden
        className="absolute top-1/2 left-2.5 right-2.5 h-0.5 -translate-y-1/2 z-1 flex"
      >
        <span className={cn("flex-1", seg1Done ? "bg-chart-3" : "bg-muted")} />
        <span className={cn("flex-1", seg2Done ? "bg-chart-3" : "bg-muted")} />
      </span>
      {steps.map((done, i) => (
        <span
          key={i}
          className={cn(
            "w-2.5 h-2.5 rounded-full border border-card z-2",
            done ? "bg-chart-3" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

export function SaleCard({
  post,
  view,
  onDeleteAction,
  isDeleting,
}: SaleCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const steps = getSteps(post);
  const isSold = post.status === PostStatus.SOLD;
  const isAccepted = post.status === PostStatus.RESERVED;
  const showBadge = post.offersCount > 0 && !isAccepted && !isSold;

  const cardClasses = cn(
    "relative bg-card border border-border flex flex-col overflow-hidden",
    view === "list" && "w-full flex-row p-3 gap-3",
    view === "grid2" && "p-3",
    view === "grid4" && "p-3",
  );

  const thumbClasses = cn(
    "bg-muted aspect-[5/6] flex items-center justify-center text-xs text-muted-foreground",
    view === "list" ? "h-auto w-2/5 max-w-40 shrink-0" : "w-full",
  );

  const isCompact = view === "grid4";
  const showTopActions = !isCompact;

  return (
    <article className={cardClasses}>
      {showBadge && (
        <span className="absolute top-1 left-1 z-10 w-8 h-8 rounded-full text-card flex items-center justify-center border-2 border-card bg-chart-3">
          {post.offersCount}
        </span>
      )}

      {showTopActions && (
        <div className="absolute top-1 right-2 z-20 flex flex-col gap-1">
          <MiniRoundButton
            aria-label="Ver detalle"
            onClick={() => setDetailOpen(true)}
          >
            <IconInfoCircle className="w-4 h-4" />
          </MiniRoundButton>

          {!isSold && !isAccepted && (
            <MiniRoundButton
              aria-label="Editar"
              onClick={() => setEditOpen(true)}
            >
              <IconPencil className="w-4 h-4" />
            </MiniRoundButton>
          )}

          {!isSold && (
            <MiniRoundButton
              aria-label="Eliminar"
              className="text-destructive"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(true)}
            >
              <IconTrash className="w-4 h-4" />
            </MiniRoundButton>
          )}
        </div>
      )}

      <div className={thumbClasses}>Imagen</div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        {!isCompact ? (
          <div>
            <p className="text-lg font-bold uppercase truncate">{post.title}</p>
            <p className="font-bold text-chart-3">
              {formatPriceCLP(post.priceClp)}
            </p>
            <VerticalTimeline steps={steps} />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <HorizontalTimeline steps={steps} />
          </div>
        )}

        <div
          className={cn(
            "flex gap-2 mt-auto w-full pt-1",
            view === "grid4" && "justify-center pb-2",
            view === "grid2" && "flex-col sm:flex-row",
          )}
        >
          {isCompact ? (
            <Button
              variant="outline"
              size="icon"
              aria-label="Acciones"
              className="rounded-full"
            >
              <IconDots className="w-5 h-5" />
            </Button>
          ) : isSold ? (
            <Button className="w-full">Ver venta</Button>
          ) : isAccepted ? (
            <>
              <Button variant="outline" className="flex-1">
                Oferta
              </Button>
              <Button className="flex-1">Entregado</Button>
            </>
          ) : post.offersCount > 0 ? (
            <Button className="w-full">Ofertas</Button>
          ) : null}
        </div>
      </div>

      <PostEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        post={post}
      />
      <PostDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        post={post}
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDeleteAction?.(post.id);
          setDeleteOpen(false);
        }}
        title="¿Eliminar publicación?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
      />
    </article>
  );
}
