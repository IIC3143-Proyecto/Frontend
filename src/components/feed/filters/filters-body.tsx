import { useState } from "react";
import { OpenCategoryButton } from "./open-category-button";

export function FiltersBody({ filtersByCategory, selectedFilters, onToggleFilter}: { filtersByCategory: Record<string, string[]>; selectedFilters: string[]; onToggleFilter: (filter: string) => void;}) {
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
          <OpenCategoryButton key={i} active={expandedCategory === category} onClick={() => toggleExpanded(category)}>
            {category}
          </OpenCategoryButton>
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
