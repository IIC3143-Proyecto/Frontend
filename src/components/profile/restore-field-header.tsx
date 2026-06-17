"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Props for the RestoreFieldHeader component. */
export type RestoreFieldHeaderProps = {
  /** Field label displayed on the left, rendered in uppercase. */
  label: string;
  /** Tooltip text shown on hover of the info icon — use it to display the original value. */
  tooltip: string;
  /** Whether the field has been modified. Controls the restore button's enabled state. */
  isDirty: boolean;
  /** Called when the user clicks "Restablecer". Should reset the field to its original value. */
  onReset: () => void;
};

/**
 * Label row for editable profile fields.
 *
 * Renders a field label on the left and, on the right, an info icon whose tooltip
 * shows the original value plus a "Restablecer" button that is only enabled when
 * the field has been modified (`isDirty`).
 */
export function RestoreFieldHeader({ label, tooltip, isDirty, onReset }: RestoreFieldHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex text-muted-foreground/40 hover:text-muted-foreground cursor-default transition-colors">
                <IconInfoCircle className="size-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-[10px]">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button
          type="button"
          disabled={!isDirty}
          onClick={onReset}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}
