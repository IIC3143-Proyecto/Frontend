"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { useGeminiTags } from "@/hooks/use-gemini-tags";

interface TagSuggestionModalProps {
  isOpen: boolean;
  photos: File[];
  onManual: () => void;
  onGemini: (tags: Array<{ title: string; category: string }>) => void;
}

export function TagSuggestionModal({ isOpen, photos, onManual, onGemini }: TagSuggestionModalProps) {
  const { mutate, data: tags, isPending, isError, reset } = useGeminiTags();

  useEffect(() => {
    if (isOpen && photos.length > 0) {
      mutate(photos);
    }
    if (!isOpen) {
      reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onManual(); }}>
      <DialogContent aria-describedby={undefined} className="flex flex-col gap-0 p-0 sm:max-w-sm">
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle className="text-base font-semibold">
            ¿Cómo quieres agregar los tags?
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 pb-5">
          {isPending && (
            <div className="flex flex-col items-center gap-3 py-6">
              <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Analizando tus fotos…</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-destructive text-center">
                No se pudieron analizar las fotos.
              </p>
              <Button onClick={onManual} variant="outline" className="w-full">
                Seleccionar manualmente
              </Button>
            </div>
          )}

          {tags && !isPending && !isError && (
            <>
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <IconSparkles className="size-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Gemini sugiere estos tags para tus fotos.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      {tag.title}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Basado en el análisis de tu prenda.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => onGemini(tags)} className="w-full">
                  Aplicar estas sugerencias
                </Button>
                <Button onClick={onManual} variant="ghost" className="w-full text-muted-foreground">
                  No, yo eligiré los tags manualmente
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
