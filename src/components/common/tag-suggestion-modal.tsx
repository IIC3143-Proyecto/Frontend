"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconSparkles } from "@tabler/icons-react";
import { GEMINI_TAGS_MOCK } from "@/lib/msw/mocks/data/gemini";

interface TagSuggestionModalProps {
  isOpen: boolean;
  onManual: () => void;
  onGemini: (tags: Array<{ title: string; category: string }>) => void;
}

export function TagSuggestionModal({ isOpen, onManual, onGemini }: TagSuggestionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onManual(); }}>
      <DialogContent aria-describedby={undefined} className="flex flex-col gap-0 p-0 sm:max-w-sm">
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle className="text-base font-semibold">
            ¿Cómo quieres agregar los tags?
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <IconSparkles className="size-4 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gemini sugiere estos tags para tus fotos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {GEMINI_TAGS_MOCK.map((tag) => (
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
            <Button onClick={() => onGemini(GEMINI_TAGS_MOCK)} className="w-full">
              Aplicar estas sugerencias
            </Button>
            <Button onClick={onManual} variant="ghost" className="w-full text-muted-foreground">
              No, yo eligiré los tags manualmente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
