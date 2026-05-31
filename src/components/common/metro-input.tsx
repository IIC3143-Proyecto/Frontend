"use client";

import * as React from "react";
import { Control, FieldValues, FieldPath } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMetroStations } from "@/hooks/use-metro-stations";
import { cn } from "@/lib/utils";

type MetroInputSize = "sm" | "default" | "lg";

const sizeClasses = {
  sm: {
    label: "text-[9px]",
    input: "h-8 text-xs",
    pill: "h-6 px-2.5 text-[11px]",
    pillsContainer: "min-h-[41.6px]",
    lineBtn: "h-6 px-2 text-[10px]",
    linesRow: "px-2 py-1 gap-1",
    station: "text-xs",
    stationMinCol: "150px",
    stationsArea: "h-36",
    footer: "text-[10px]",
    message: "text-[10px]",
  },
  default: {
    label: "text-[10px]",
    input: "h-10 text-sm",
    pill: "h-7 px-3 text-xs",
    pillsContainer: "min-h-[45.6px]",
    lineBtn: "h-7 px-3 text-xs",
    linesRow: "px-2 py-1.5 gap-1.5",
    station: "text-sm",
    stationMinCol: "170px",
    stationsArea: "h-44",
    footer: "text-xs",
    message: "text-xs",
  },
  lg: {
    label: "text-xs",
    input: "h-12 text-base",
    pill: "h-8 px-4 text-sm",
    pillsContainer: "min-h-[49.6px]",
    lineBtn: "h-8 px-3 text-sm",
    linesRow: "px-2 py-2 gap-2",
    station: "text-base",
    stationMinCol: "200px",
    stationsArea: "h-52",
    footer: "text-sm",
    message: "text-sm",
  },
};

interface MetroInputProps<TFieldValues extends FieldValues> {
  /** React Hook Form control instance. */
  control: Control<TFieldValues>;
  /** Field path within the form. */
  name: FieldPath<TFieldValues>;
  /** Label text displayed above the component. */
  label?: string;
  /** Size variant: `sm`, `default`, `lg`. */
  size?: MetroInputSize;
  /** Disables all interactions and hides scrolling. */
  disabled?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Metro Input Component
 *
 * Multi-select station picker for the Santiago metro system.
 * Features line filtering, search across all stations, pills display of selections,
 * and responsive size variants.
 * Integrates with React Hook Form and uses MSW for API mocking.
 */
export function MetroInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  size = "default",
  disabled,
  className,
}: MetroInputProps<TFieldValues>) {
  const lines = useMetroStations();
  const [search, setSearch] = React.useState("");
  const [activeLine, setActiveLine] = React.useState<string>("");
  const s = sizeClasses[size];
  const effectiveActiveLine = activeLine || lines[0]?.number || "";

  const visibleStations = React.useMemo(() => {
    if (search.trim()) {
      return lines.flatMap(line =>
        line.stations
          .filter(s => s.toLowerCase().includes(search.toLowerCase()))
          .map(name => ({ name, line: line.number }))
      );
    }
    const active = lines.find(l => l.number === effectiveActiveLine);
    return (active?.stations ?? []).map(name => ({ name, line: effectiveActiveLine }));
  }, [search, effectiveActiveLine, lines]);

  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field }) => {
        const selected: string[] = field.value ?? [];

        const toggleStation = (station: string) => {
          const next = selected.includes(station)
            ? selected.filter(s => s !== station)
            : [...selected, station];
          field.onChange(next);
        };

        return (
          <FormItem className={cn("w-full space-y-3", className, disabled && "opacity-60 cursor-not-allowed")}>
            {label && (
              <FormLabel className={cn("font-bold uppercase tracking-wider text-muted-foreground", s.label)}>
                {label}
              </FormLabel>
            )}

            <FormControl>
              <div className="w-full space-y-2 overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("uppercase tracking-wider text-muted-foreground", s.label)}>
                    Seleccionadas:
                  </span>
                  {selected.length > 0 && !disabled && (
                    <button
                      type="button"
                      onClick={() => field.onChange([])}
                      className={cn(s.footer, "text-muted-foreground/50 hover:text-muted-foreground transition-colors")}
                    >
                      Borrar todo
                    </button>
                  )}
                </div>
                <div
                  className={cn(
                    s.pillsContainer,
                    "min-w-0 max-w-full flex flex-nowrap gap-2 rounded-lg border border-dashed p-2 transition-colors",
                    disabled ? "overflow-hidden" : "overflow-x-auto",
                    selected.length === 0 && "border-muted-foreground/20"
                  )}
                  style={{ width: 0, minWidth: '100%' }}
                >
                  {selected.length === 0 ? (
                    <span className={cn("text-muted-foreground/40 self-center whitespace-nowrap", s.footer)}>
                      Ninguna estación seleccionada
                    </span>
                  ) : (
                    selected.map(station => (
                      <span
                        key={station}
                        className={cn(s.pill, "inline-flex items-center gap-1 rounded-full bg-black text-white font-medium shrink-0")}
                      >
                        {station}
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => field.onChange(selected.filter(s => s !== station))}
                            aria-label={`Eliminar ${station}`}
                            className="ml-0.5 hover:opacity-70 transition-opacity leading-none"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>
                <Input
                  placeholder="Buscar estación..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  disabled={disabled}
                  className={s.input}
                />
                <div className="border rounded-lg overflow-hidden">
                  <div className={cn("flex items-center bg-muted/40 border-b", s.linesRow)}>
                    <ToggleGroup
                          type="single"
                          value={search.trim() ? "" : effectiveActiveLine}
                          onValueChange={val => { if (val) setActiveLine(val); }}
                          spacing={8}
                          disabled={disabled || !!search.trim()}
                          className="flex flex-1 gap-1.5 h-auto"
                        >
                          {lines.map(line => (
                            <ToggleGroupItem
                              key={line.number}
                              value={line.number}
                              className={cn(
                                s.lineBtn,
                                "flex-1 rounded-full border border-input bg-muted/40 text-foreground transition-all duration-200",
                                "hover:bg-muted",
                                "data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:border-black",
                                "disabled:opacity-40"
                              )}
                            >
                              L{line.number}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                  </div>
                  <div
                    className={cn(
                      s.stationsArea,
                      "p-3 grid gap-x-2 gap-y-0.5 content-start",
                      disabled ? "overflow-hidden" : "overflow-y-auto"
                    )}
                    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${s.stationMinCol}, 1fr))` }}
                  >
                    {visibleStations.length === 0 && search && (
                      <p className={cn("text-muted-foreground col-span-full", s.station)}>
                        Sin resultados para &quot;{search}&quot;
                      </p>
                    )}
                    {visibleStations.map(({ name, line }) => (
                      <label
                        key={`${line}-${name}`}
                        className={cn(
                          "flex items-center gap-2 py-1 px-1 rounded cursor-pointer hover:bg-muted/50 transition-colors",
                          s.station,
                          disabled && "cursor-not-allowed pointer-events-none"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(name)}
                          onChange={() => toggleStation(name)}
                          disabled={disabled}
                          className="accent-black shrink-0"
                        />
                        <span className="truncate">{name}</span>
                        {search.trim() && (
                          <span className="ml-auto text-muted-foreground text-[10px] shrink-0">L{line}</span>
                        )}
                      </label>
                    ))}
                  </div>


                </div>

              </div>
            </FormControl>

            <div className="min-h-[1.1em]">
              <FormMessage className={cn("font-bold", s.message)} />
            </div>
          </FormItem>
        );
      }}
    />
  );
}