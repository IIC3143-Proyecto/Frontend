"use client";

import { useForm } from "react-hook-form";
import { IconMapPin, IconInfoCircle } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { MetroInput } from "@/components/common/metro-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStations: string[];
};

type ZonaForm = { stations: string[] };

export function ZonaDialog({ open, onOpenChange, currentStations }: Props) {
  const form = useForm<ZonaForm>({
    defaultValues: { stations: currentStations },
  });

  const isDirty = form.formState.isDirty;
  const originalList = currentStations.join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 pt-4 pb-3">
          <DialogTitle className="text-xs font-black uppercase flex items-center gap-1.5">
            <IconMapPin className="size-3.5" /> Editar zona
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="px-4 py-4">
            <MetroInput control={form.control} name="stations" size="sm" />
          </div>
        </Form>

        <DialogFooter className="border-t border-border px-4 py-3 flex-col sm:flex-row">
          <div className="flex items-center gap-0.5 mr-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              disabled={!isDirty}
              onClick={() => form.reset({ stations: currentStations })}
            >
              Restaurar original
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex text-muted-foreground/40 hover:text-muted-foreground cursor-default transition-colors">
                    <IconInfoCircle className="size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  Original: {originalList}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
