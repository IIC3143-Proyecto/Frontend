"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconMapPin } from "@tabler/icons-react";
import { toast } from "sonner";
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
import { RestoreFieldHeader } from "./restore-field-header";
import { useStationNameMap } from "@/hooks/use-metro-stations";
import { usePatchStations } from "@/hooks/use-patch-user";
import type { UserDto } from "@/lib/types/user";

const metroSchema = z.object({
  metro: z.array(z.string()).min(1, "Selecciona al menos una estación"),
});

type MetroForm = z.infer<typeof metroSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto;
  sub: string;
};

export function MetroDialog({ open, onOpenChange, user, sub }: Props) {
  const stationNameMap = useStationNameMap();
  const patchStations = usePatchStations();

  const originalStations = user.stations ?? [];

  const form = useForm<MetroForm>({
    resolver: zodResolver(metroSchema),
    defaultValues: { metro: originalStations },
  });

  const { dirtyFields } = form.formState;

  const originalTooltip = originalStations.length > 0
    ? originalStations.map(id => stationNameMap.get(id) ?? id).join(" · ")
    : "Sin estaciones originales";

  function handleSave(values: MetroForm) {
    patchStations.mutate(
      { userId: user.id, sub, stations: values.metro },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          toast.error(error.message ?? "No se pudo cambiar la estación");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xs font-black uppercase flex items-center gap-1.5">
            <IconMapPin className="size-3.5" /> Editar zona
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div>
            <RestoreFieldHeader
              label="Estaciones"
              tooltip={originalTooltip}
              isDirty={!!dirtyFields.metro}
              onReset={() => form.resetField("metro")}
            />
            <MetroInput control={form.control} name="metro" size="sm" />
          </div>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={patchStations.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(handleSave)}
            disabled={patchStations.isPending}
          >
            {patchStations.isPending ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
