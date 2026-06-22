"use client";

import { useState } from "react";
import { IconLoader2, IconTag } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePostTags } from "@/hooks/use-tags";
import type { PostDto as Post } from "@/lib/types/post";
import { formatPriceCLP } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  post: Post;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
      {children}
    </p>
  );
}

export function PostDetailModal({ open, onClose, post }: Props) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const images = post.imagesUrls?.split(";").filter(Boolean) ?? [];
  const [mainImage, ...restImages] = images;
  const hasMorePhotos = restImages.length > 0;

  const { data: postTags, isLoading: tagsLoading } = usePostTags(
    open ? post.id : undefined,
  );
  const tagGroups = Object.entries(postTags ?? {}).filter(
    ([, values]) => values.length > 0,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xs font-black uppercase tracking-wider">
            Detalles de la prenda
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6">
          <div className="flex flex-col gap-3">
            <div className="bg-muted aspect-5/6 flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                "Imagen"
              )}
            </div>
            {hasMorePhotos && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAllPhotos((v) => !v)}
              >
                {showAllPhotos ? "Ocultar fotos" : "Ver más fotos"}
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div>
              <p className="text-2xl font-bold leading-tight">{post.title}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-2xl font-bold text-chart-3">
                  {formatPriceCLP(post.priceClp)}
                </p>
                {post.isNegotiable && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconTag className="w-4 h-4" />
                    Negociable
                  </span>
                )}
              </div>
            </div>

            <div>
              <SectionLabel>Especificaciones</SectionLabel>
              {tagsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  Cargando…
                </div>
              ) : tagGroups.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {tagGroups.map(([label, values]) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {values.map((value) => (
                          <span
                            key={value}
                            className="rounded-full bg-muted px-2 py-0.5 text-xs"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin especificaciones.
                </p>
              )}
            </div>

            <div>
              <SectionLabel>Descripción</SectionLabel>
              <p className="text-sm">{post.description}</p>
            </div>
          </div>
        </div>

        {showAllPhotos && hasMorePhotos && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {restImages.map((url, i) => (
              <div
                key={url}
                className="bg-muted aspect-5/6 overflow-hidden rounded-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${post.title} — foto ${i + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
