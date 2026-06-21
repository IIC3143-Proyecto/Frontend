import { Button } from "@/components/ui/button";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { ReactNode } from "react";

export function OpenCategoryButton({ onClick, active, children}: { onClick: () => void; active: boolean; children: ReactNode;}) {
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
