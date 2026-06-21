"use client";

import { useState } from "react";
import { useOffers } from "@/hooks/use-offers";
import { cn } from "@/lib/utils";
import { OfferDirection } from "@/lib/types/offer-direction.enum";
import { OfferCard } from "@/components/common/cards/offer-card";

const TABS: { id: OfferDirection; label: string }[] = [
  { id: OfferDirection.MADE, label: "Realizadas" },
  { id: OfferDirection.RECEIVED, label: "Recibidas" },
];

export function OffersList() {
  const [tab, setTab] = useState<OfferDirection>(OfferDirection.MADE);
  const { data: offers, isLoading, isError } = useOffers(tab);

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
        {!isLoading && !isError && (offers?.length ?? 0) === 0 && (
          <p className="w-full text-center text-xs text-muted-foreground py-8">
            {tab === OfferDirection.MADE
              ? "Aún no has realizado ofertas."
              : "No has recibido ofertas."}
          </p>
        )}
        {offers?.map((offer) => (
          <OfferCard key={offer.id} offer={offer} direction={tab} />
        ))}
      </div>
    </div>
  );
}
