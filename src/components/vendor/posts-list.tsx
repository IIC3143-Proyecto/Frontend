"use client";

import { useMemo, useState } from "react";
import { Grid3x3, LayoutGrid, Menu } from "lucide-react";
import { usePosts } from "@/hooks/use-posts";
import { PostStatus } from "@/lib/types/post-status.enum";
import { cn } from "@/lib/utils";
import { SaleCard, type SaleView } from "@/components/common/cards/sale-card";

type Tab = "activas" | "vendidas";

const TABS: { id: Tab; label: string }[] = [
  { id: "activas", label: "Publicaciones" },
  { id: "vendidas", label: "Vendidas" },
];

const VIEWS: { id: SaleView; label: string; Icon: typeof Menu }[] = [
  { id: "list", label: "Lista", Icon: Menu },
  { id: "grid2", label: "Cuadrícula", Icon: LayoutGrid },
  { id: "grid4", label: "Compacto", Icon: Grid3x3 },
];

export function PostsList() {
  const [view, setView] = useState<SaleView>("list");
  const [tab, setTab] = useState<Tab>("activas");
  const { data: posts, isLoading, isError } = usePosts();

  const filtered = useMemo(() => {
    if (!posts) return [];
    return posts.filter((p) => {
      if (tab === "vendidas") {
        return p.status === PostStatus.SOLD;
      }
      return p.status !== PostStatus.SOLD;
    });
  }, [posts, tab]);

  return (
    <div className="w-full">
      <div className="flex justify-center gap-5 p-3 border-y border-border bg-sidebar">
        {VIEWS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={view === id}
            onClick={() => setView(id)}
            className={cn(
              "cursor-pointer border-0 bg-transparent p-0 transition-opacity",
              view === id ? "opacity-100" : "opacity-30 hover:opacity-60",
            )}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

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

      <div
        className={cn(
          "w-full p-4",
          view === "list" && "flex flex-col gap-3",
          view === "grid2" && "grid grid-cols-2 gap-3",
          view === "grid4" && "grid grid-cols-4 gap-1 sm:gap-2",
        )}
      >
        {isLoading && (
          <p className="w-full text-center text-xs text-muted-foreground py-8">
            Cargando publicaciones…
          </p>
        )}
        {isError && (
          <p className="w-full text-center text-xs text-destructive py-8">
            Error al cargar los posts.
          </p>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="w-full text-center text-xs text-muted-foreground py-8">
            No hay publicaciones en esta sección.
          </p>
        )}
        {filtered.map((post) => (
          <SaleCard key={post.id} post={post} view={view} />
        ))}
      </div>
    </div>
  );
}
