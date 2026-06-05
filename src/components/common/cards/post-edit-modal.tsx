"use client";

import * as React from "react";
import { IconLoader2, IconCurrencyDollar, IconLock } from "@tabler/icons-react";
import { Control } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TextInput } from "@/components/common/text-input";
import { ToggleInputGroup } from "@/components/common/toggle-input";
import { PhotoUploadGrid } from "@/components/common/photo-upload-grid";
import { useEditPost, type EditPostInput } from "@/hooks/use-edit-post";
import { useTags } from "@/hooks/use-tags";
import type { PostDto as Post } from "@/lib/types/post";

type Props = {
  open: boolean;
  onClose: () => void;
  post: Post;
};

interface SectionProps {
  control: Control<EditPostInput>;
}

function NegotiableSwitch({
  control,
  disabled,
}: SectionProps & { disabled: boolean }) {
  return (
    <FormField
      control={control}
      name="isNegotiable"
      render={({ field }) => (
        <FormItem className="space-y-1.5 w-max shrink-0">
          <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Negociable
          </FormLabel>
          <FormControl>
            <Switch
              className="relative w-full h-10"
              thumbClassName={cn(
                "pointer-events-none absolute top-0.65 left-1 size-8 rounded-full",
                "bg-background shadow-lg",
                "[transition:left_150ms_ease]",
                "data-[state=unchecked]:left-1",
                "data-[state=checked]:left-[calc(100%-2.25rem)]",
              )}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="min-h-[1.1em]" />
        </FormItem>
      )}
    />
  );
}

export function PostEditModal({ open, onClose, post }: Props) {
  const {
    form,
    allPhotos,
    addPhoto,
    removePhoto,
    isLocked,
    isSaving,
    handleSave,
    handleClose,
  } = useEditPost(post, onClose);

  const { categories, isLoading: tagsLoading } = useTags();

  const opts = React.useCallback(
    (cat: string) =>
      (categories[cat] ?? []).map((v) => ({ label: v, value: v })),
    [categories],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex flex-col p-0 gap-0 w-full sm:max-w-lg h-[640px] md:max-w-2xl"
      >
        <DialogHeader className="px-6 pt-5 pb-4 shrink-0">
          <DialogTitle className="text-base font-semibold">
            Editar Publicación
          </DialogTitle>
        </DialogHeader>

        <Separator />

        {isLocked && (
          <div className="mx-4 mt-3 flex items-center justify-center gap-2 rounded-3xl bg-destructive px-3 py-3 text-[11px] font-black uppercase text-destructive-foreground">
            <IconLock className="size-3.5 shrink-0" />
            <span>Precio bloqueado — hay ofertas activas</span>
          </div>
        )}

        <Form {...form}>
          <div className="flex-1 overflow-y-auto min-h-0">
            <Accordion type="multiple" className="w-full">

              {/* Título */}
              <AccordionItem value="title" className="border-b border-border px-6">
                <AccordionTrigger className="text-xs font-black uppercase tracking-wider hover:no-underline">
                  Título
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <TextInput
                    control={form.control}
                    name="title"
                    label=""
                    placeholder="ej: Camiseta Nike azul"
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Precio & Negociable */}
              <AccordionItem value="price" className="border-b border-border px-6">
                <AccordionTrigger
                  className={cn(
                    "text-xs font-black uppercase tracking-wider hover:no-underline",
                    isLocked && "text-muted-foreground",
                  )}
                >
                  <span className="flex items-center gap-2">
                    Precio &amp; Negociable
                    {isLocked && <IconLock className="size-3 shrink-0" />}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div
                    className={cn(
                      "flex items-start gap-3",
                      isLocked && "opacity-50 pointer-events-none",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <TextInput
                        control={form.control}
                        name="priceClp"
                        type="number"
                        label="Precio (CLP)"
                        placeholder="ej: 25000"
                        step={10}
                        icon={IconCurrencyDollar}
                        formatNumber
                        maxValue={1000000}
                        disabled={isLocked}
                      />
                    </div>
                    <NegotiableSwitch
                      control={form.control}
                      disabled={isLocked}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Descripción */}
              <AccordionItem value="desc" className="border-b border-border px-6">
                <AccordionTrigger className="text-xs font-black uppercase tracking-wider hover:no-underline">
                  Descripción
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <TextInput
                    control={form.control}
                    name="description"
                    label=""
                    placeholder="Describe la prenda, tela, detalles…"
                    isTextarea
                    inputClassName="min-h-[100px] max-h-[160px]"
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Fotos */}
              <AccordionItem value="photos" className="border-b border-border px-6">
                <AccordionTrigger className="text-xs font-black uppercase tracking-wider hover:no-underline">
                  Fotos de la prenda
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <PhotoUploadGrid
                    photos={allPhotos}
                    onAddPhoto={addPhoto}
                    onRemovePhoto={removePhoto}
                    columns={6}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Especificaciones esenciales */}
              <AccordionItem value="tags-required" className="border-b border-border px-6">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-black uppercase tracking-wider">Especificaciones esenciales</span>
                    <span className="text-[10px] text-muted-foreground font-normal normal-case tracking-normal">Talla · Condición · Tipo de prenda</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {tagsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <IconLoader2 className="size-5 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Cargando…</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <ToggleInputGroup
                        control={form.control}
                        name="Talla"
                        label="Talla"
                        options={opts("Talla")}
                        type="multiple"
                      />
                      <ToggleInputGroup
                        control={form.control}
                        name="Condición"
                        label="Condición"
                        options={opts("Condición")}
                        type="single"
                      />
                      <ToggleInputGroup
                        control={form.control}
                        name="Tipo de prenda"
                        label="Tipo de prenda"
                        options={opts("Tipo de prenda")}
                        type="multiple"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Especificaciones opcionales */}
              <AccordionItem value="tags-optional" className="px-6">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-black uppercase tracking-wider">Especificaciones opcionales</span>
                    <span className="text-[10px] text-muted-foreground font-normal normal-case tracking-normal">Marca · Color · Género · Estilo · Temporada</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {tagsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <IconLoader2 className="size-5 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Cargando…</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <ToggleInputGroup
                        control={form.control}
                        name="Marca"
                        label="Marca"
                        options={opts("Marca")}
                        type="multiple"
                      />
                      <ToggleInputGroup
                        control={form.control}
                        name="Color"
                        label="Color"
                        options={opts("Color")}
                        type="multiple"
                      />
                      <ToggleInputGroup
                        control={form.control}
                        name="Género"
                        label="Género"
                        options={opts("Género")}
                        type="multiple"
                      />
                      <ToggleInputGroup
                        control={form.control}
                        name="Estilo"
                        label="Estilo"
                        options={opts("Estilo")}
                        type="multiple"
                      />
                      <ToggleInputGroup
                        control={form.control}
                        name="Temporada"
                        label="Temporada"
                        options={opts("Temporada")}
                        type="multiple"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </Form>

        <Separator />

        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
            className="text-muted-foreground"
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <IconLoader2 className="mr-1.5 size-4 animate-spin" />}
            {isSaving ? "Guardando…" : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
