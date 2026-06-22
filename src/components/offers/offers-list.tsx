"use client";

import { useState } from "react";
import { useOffers, useSuccessfulOffers } from "@/hooks/use-offers";
import type { DirectedOffer } from "@/hooks/use-offers";
import { cn } from "@/lib/utils";
import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { OfferCard } from "@/components/common/cards/offer-card";

type TabId = "made" | "received" | "successful";

const TABS: { id: TabId; label: string }[] = [
  { id: "made", label: "Realizadas" },
  { id: "received", label: "Recibidas" },
  { id: "successful", label: "Exitosas" },
];

const EMPTY_MESSAGE: Record<TabId, string> = {
  made: "Aún no has realizado ofertas.",
  received: "No has recibido ofertas.",
  successful: "Todavía no tienes ofertas exitosas.",
};

export function OffersList() {
  const [tab, setTab] = useState<TabId>("made");
  const directionQuery = useOffers(
    tab === "received" ? OfferDirection.RECEIVED : OfferDirection.MADE,
  );
  const successfulQuery = useSuccessfulOffers();

  const { items, isLoading, isError } =
    tab === "successful"
      ? {
          items: successfulQuery.data,
          isLoading: successfulQuery.isLoading,
          isError: successfulQuery.isError,
        }
      : {
          items: (directionQuery.data ?? []).map<DirectedOffer>((offer) => ({
            offer,
            direction:
              tab === "received" ? OfferDirection.RECEIVED : OfferDirection.MADE,
          })),
          isLoading: directionQuery.isLoading,
          isError: directionQuery.isError,
        };

  return (
    <div className="w-full">
      <div className="flex border-b border-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "w-full text-xs font-black uppercase cursor-pointer pt-3 pb-3",
              tab === id
                ? "opacity-100 border-b-2 border-primary -mb-0.5"
                : "opacity-30 hover:opacity-60",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-full p-4 flex flex-col gap-3">
        {isLoading && (
          <p className="w-full text-center text-xs text-muted-foreground py-8">
            Cargando ofertas…
          </p>
        )}
        {isError && (
          <p className="w-full text-center text-xs text-destructive py-8">
            Error al cargar las ofertas.
          </p>
        )}
        {!isLoading && !isError && items.length === 0 && (
          <p className="w-full text-center text-xs text-muted-foreground py-8">
            {EMPTY_MESSAGE[tab]}
          </p>
        )}
        {items.map(({ offer, direction }) => (
          <OfferCard key={offer.id} offer={offer} direction={direction} />
        ))}
      </div>
    </div>
  );
}
