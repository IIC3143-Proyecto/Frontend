import { useState } from "react";
import { Button } from "../ui/button";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Filters({ filtersByCategory, appliedFilters, setAppliedFilters }: { filtersByCategory: Record<string, string[]>; appliedFilters: string[]; setAppliedFilters: (filters: string[]) => void;}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleOpen = () => setIsFiltersOpen((isOpen) => !isOpen);

  const clearFilters = () => setSelectedFilters([]);

  const toggleFilterOnOff = (filter: string) => {
    setSelectedFilters(
      selectedFilters.includes(filter)
        ? selectedFilters.filter((selectedFilters) => selectedFilters !== filter)
        : [...selectedFilters, filter]
    );
  };

  const applyFilters = () => setAppliedFilters(selectedFilters);

  const hasUnappliedChanges = !sameFilters(selectedFilters, appliedFilters);

  return (
    <div className="relative shrink-0 bg-background">
      <div className="border-b">
        <OpenFiltersButton isFiltersOpen={isFiltersOpen} onClick={toggleOpen}/>
      </div>

      {isFiltersOpen && (
        <div className="absolute top-full w-full bg-background z-30">
          <FiltersHeader onClearFilters={clearFilters} onApplyFilters={applyFilters} hasUnappliedChanges={hasUnappliedChanges} />
          <FiltersBody filtersByCategory={filtersByCategory} selectedFilters={selectedFilters} onToggleFilter={toggleFilterOnOff}/>
        </div>
      )}

    </div>
  );
}

function OpenFiltersButton({ isFiltersOpen, onClick }: { isFiltersOpen: boolean; onClick: () => void; }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-xs gap-1 pl-3.5 uppercase font-black"
      onClick={onClick}
    >
      Filtros
      {isFiltersOpen ? <IconChevronUp /> : <IconChevronDown />}
    </Button>
  );
}

function FiltersHeader({ onClearFilters, onApplyFilters, hasUnappliedChanges }: { onClearFilters: () => void; onApplyFilters: () => void; hasUnappliedChanges: boolean }) {
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

function FiltersBody({ filtersByCategory, selectedFilters, onToggleFilter}: { filtersByCategory: Record<string, string[]>; selectedFilters: string[]; onToggleFilter: (filter: string) => void;}) {
  const categories = Object.keys(filtersByCategory);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleExpanded = (category: string) => {
    setExpandedCategory((current) => (current === category ? null : category));
  };

  const expandedFilters = expandedCategory ? filtersByCategory[expandedCategory] : [];

  return (
    <div className="relative shrink-0 shadow-md">
      <div className="flex gap-3 p-3 px-4 w-full border-b overflow-auto">
        {categories.map((category, i) => (
          <CategoryButton key={i} active={expandedCategory === category} onClick={() => toggleExpanded(category)}>
            {category}
          </CategoryButton>
        ))}
      </div>

      {expandedCategory && (
        <div className="bg-background border-b absolute top-full z-30 w-full">
          <FiltersGroup filters={expandedFilters} selectedFilters={selectedFilters} onToggleFilter={onToggleFilter}/>
        </div>
      )}
    </div>
  );
}

function FiltersGroup({ filters, selectedFilters, onToggleFilter }: { filters: string[]; selectedFilters: string[]; onToggleFilter: (filter: string) => void }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-x-8 gap-y-2 px-8 py-3 shadow-md">
      {filters.map((filter) => (
        <label key={filter} className="flex items-center gap-1.5 whitespace-nowrap">
          <input type="checkbox" checked={selectedFilters.includes(filter)} onChange={() => onToggleFilter(filter)} className="accent-black" />
          <span>{filter}</span>
        </label>
      ))}
    </div>
  );
}

function CategoryButton({ onClick, active, children}: { onClick: () => void; active: boolean; children: ReactNode;}) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "secondary"}
      className={"text-xs gap-1 pl-3.5 uppercase"}
      onClick={onClick}
    >
      {children}
      {active ? <IconChevronUp /> : <IconChevronDown />}
    </Button>
  );
}

/**Funcion auxiliar para revisar si dos listas de string son iguales. */
function sameFilters(a: string[], b: string[]) {
  if (a.length !== b.length) return false;

  const bSet = new Set(b);
  return a.every((filter) => bSet.has(filter));
}
