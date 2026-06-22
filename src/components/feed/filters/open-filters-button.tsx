import { Button } from "@/components/ui/button";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

export function OpenFiltersButton({ isFiltersOpen, onClick }: { isFiltersOpen: boolean; onClick: () => void; }) {
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
