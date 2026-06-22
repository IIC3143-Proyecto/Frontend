"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { Control, FieldValues, FieldPath } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SizeSelectorProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  options: string[];
  label?: string;
  type?: "single" | "multiple";
  disabled?: boolean;
}

function SizePill({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-9 px-4 text-sm border",
        selected
          ? "bg-black text-white border-black"
          : "bg-[var(--surface-subtle)] border-transparent text-foreground hover:border-zinc-300"
      )}
    >
      {label}
    </Button>
  );
}

function NumericBtn({
  value,
  selected,
  onClick,
  disabled,
}: {
  value: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-10 w-10 text-sm border shrink-0",
        selected
          ? "bg-black text-white border-black"
          : "bg-[var(--surface-subtle)] border-transparent text-foreground hover:border-zinc-300"
      )}
    >
      {value}
    </Button>
  );
}

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between border-b border-border py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:underline"
    >
      {label}
      {open ? <ChevronUpIcon className="size-4 shrink-0" /> : <ChevronDownIcon className="size-4 shrink-0" />}
    </button>
  );
}

export function SizeSelector<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  label = "Talla",
  type = "single",
  disabled,
}: SizeSelectorProps<TFieldValues>) {
  const [textOpen, setTextOpen] = useState(false);
  const [numericOpen, setNumericOpen] = useState(false);

  const textSizes = options.filter((o) => isNaN(Number(o)));
  const numericSizes = options.filter((o) => !isNaN(Number(o)));

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const rawValue = field.value as string | string[] | undefined;

        const isSelected = (size: string) =>
          type === "multiple"
            ? ((rawValue as string[] | undefined) ?? []).includes(size)
            : rawValue === size;

        const toggle = (size: string) => {
          if (type === "multiple") {
            const current = (rawValue as string[] | undefined) ?? [];
            field.onChange(
              current.includes(size)
                ? current.filter((s) => s !== size)
                : [...current, size]
            );
          } else {
            field.onChange(rawValue === size ? "" : size);
          }
        };

        return (
          <FormItem className="w-full space-y-3">
            <div className="flex items-baseline gap-2">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </FormLabel>
              <span className="text-[12px] text-muted-foreground/70">
                {type === "single" ? "Selecciona una opción" : "Selecciona una o más opciones"}
              </span>
            </div>
            <FormControl>
              <div className="w-full">
                <SectionHeader
                  label="Tallas de letra"
                  open={textOpen}
                  onToggle={() => setTextOpen((v) => !v)}
                />
                {textOpen && (
                  <div className="flex flex-wrap gap-2 py-3">
                    {textSizes.map((t) => (
                      <SizePill
                        key={t}
                        label={t}
                        selected={isSelected(t)}
                        onClick={() => toggle(t)}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                )}

                <SectionHeader
                  label="Tallas numéricas"
                  open={numericOpen}
                  onToggle={() => setNumericOpen((v) => !v)}
                />
                {numericOpen && (
                  <div className="max-h-30 overflow-y-auto rounded-xl border border-zinc-100 p-3 mt-2">
                    <div className="grid grid-cols-8 gap-1">
                      {numericSizes.map((n) => (
                        <NumericBtn
                          key={n}
                          value={n}
                          selected={isSelected(n)}
                          onClick={() => toggle(n)}
                          disabled={disabled}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            <div className="min-h-[1.1em]">
              <FormMessage className="text-xs font-bold" />
            </div>
          </FormItem>
        );
      }}
    />
  );
}
