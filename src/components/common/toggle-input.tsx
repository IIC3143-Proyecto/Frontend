"use client";

import * as React from "react";
import { Control, FieldValues, FieldPath } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Supported size options for the ToggleInputGroup component.
 */
type ToggleInputSize = "sm" | "default" | "lg";

/**
 * Size-based class names for ToggleInputGroup and its elements.
 */
const sizeClasses = {
  sm: {
    label: "text-[9px]",
    description: "text-[11px]",
    pill: "h-7 px-3 text-xs",
    button: "h-7 px-3 text-[11px]",
    message: "text-[10px]",
  },
  default: {
    label: "text-[10px]",
    description: "text-[12px]",
    pill: "h-9 px-4 text-sm",
    button: "h-9 px-4 text-xs",
    message: "text-xs",
  },
  lg: {
    label: "text-xs",
    description: "text-sm",
    pill: "h-11 px-5 text-base",
    button: "h-11 px-5 text-sm",
    message: "text-sm",
  },
};

/**
 * Props for the ToggleInputGroup component.
 * @template TFieldValues Type of form field values.
 * @property control react-hook-form control object.
 * @property name Field name.
 * @property label Optional label text.
 * @property options Array of toggle options (label and value).
 * @property type Selection type: "single" or "multiple".
 * @property limit Max number of options to show before expanding.
 * @property size Size of the toggles (sm, default, lg).
 * @property disabled Whether the toggle group is disabled.
 * @property className Additional class names for the group.
 */
interface ToggleInputGroupProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  options: { label: string; value: string }[];
  type?: "single" | "multiple";
  limit?: number;
  size?: ToggleInputSize;
  disabled?: boolean;
  className?: string;
}

/**
 * Toggle group input for forms, supporting single/multiple selection, size, and expand/collapse.
 * Integrates with react-hook-form.
 */
export function ToggleInputGroup<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  type = "single",
  limit,
  size = "default",
  disabled,
  className,
}: ToggleInputGroupProps<TFieldValues>) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const s = sizeClasses[size];

  const actualLimit = limit ?? options.length;
  const visibleOptions = isExpanded ? options : options.slice(0, actualLimit);
  const hasMore = options.length > actualLimit;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("w-full space-y-3", className, disabled && "opacity-60")}>
          {label && (
            <div className="flex items-baseline gap-2">
              <FormLabel
                className={cn(
                  "font-bold uppercase tracking-wider text-muted-foreground",
                  s.label,
                  disabled && "text-muted-foreground/50"
                )}
              >
                {label}
              </FormLabel>
              <FormDescription
                className={cn(
                  "font-normal text-muted-foreground/70",
                  s.description,
                  disabled && "text-muted-foreground/40"
                )}
              >
                {type === "single" ? "Selecciona una opción" : "Selecciona una o más opciones"}
              </FormDescription>
            </div>
          )}

          <FormControl>
            <ToggleGroup
              type={type as "single" | "multiple"}
              value={field.value ?? (type === "multiple" ? [] : "")}
              disabled={disabled}
              onValueChange={(val: string | string[]) => {
                field.onChange(val);
              }}
              spacing={8}
              className="flex flex-wrap justify-start gap-2 h-auto"
            >
              {visibleOptions.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    s.pill,
                    "rounded-full border transition-all duration-200",
                    "bg-[#F8F7F4] border-transparent text-foreground",
                    "data-[state=on]:bg-black data-[state=on]:text-white",
                    disabled && "pointer-events-none opacity-50 shadow-none"
                  )}
                >
                  {opt.label}
                </ToggleGroupItem>
              ))}

              {hasMore && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={disabled} 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    s.button,
                    "rounded-full font-bold text-muted-foreground hover:bg-zinc-100"
                  )}
                >
                  {isExpanded
                    ? "Ver menos"
                    : `Ver ${options.length - actualLimit} más`}
                </Button>
              )}
            </ToggleGroup>
          </FormControl>

          <div className="min-h-[1.1em]">
            <FormMessage className={cn("font-bold", s.message)} />
          </div>
        </FormItem>
      )}
    />
  );
}