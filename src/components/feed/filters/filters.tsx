import { useState } from "react";
import { OpenFiltersButton } from "./open-filters-button";
import { FiltersHeader } from "./filters-header";
import { FiltersBody } from "./filters-body";
import { arraysEqual } from "@/lib/utils";

export function Filters({ filtersByCategory, appliedFilters, setAppliedFilters }: { filtersByCategory: Record<string, string[]>; appliedFilters: string[]; setAppliedFilters: (filters: string[]) => void;}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
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

  const hasUnappliedChanges = !arraysEqual(selectedFilters, appliedFilters);

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
