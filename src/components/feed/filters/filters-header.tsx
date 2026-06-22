import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FiltersHeader({ onClearFilters, onApplyFilters, hasUnappliedChanges }: { onClearFilters: () => void; onApplyFilters: () => void; hasUnappliedChanges: boolean }) {
  return (
    <div className="flex justify-between bg-background border-b pr-1">
      <Button
        size="sm"
        variant="ghost"
        className="text-xs gap-1 pl-3.5 uppercase text-muted-foreground font-bold"
        onClick={onClearFilters}
      >
        Limpiar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "text-xs gap-1 pl-3.5 uppercase text-chart-4 font-bold",
          hasUnappliedChanges ? "text-chart-4" : "text-muted-foreground pointer-events-none"
        )}
        onClick={onApplyFilters}
      >
        Aplicar filtros
      </Button>
    </div>
  );
}
