"use client";

import * as React from "react";
import { IconLoader2, IconCurrencyDollar } from "@tabler/icons-react";
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
import { TextInput } from "@/components/common/text-input";
import { ToggleInputGroup } from "@/components/common/toggle-input";
import { SizeSelector } from "@/components/common/size-selector";
import { StepProgress } from "@/components/common/step-progress";
import { PhotoUploadGrid } from "@/components/common/photo-upload-grid";
import { useCreatePost, type CreatePostInput } from "@/hooks/use-create-post";
import { TagSuggestionModal } from "@/components/common/tag-suggestion-modal";
import type { PhotoItem } from "@/lib/types/post";
import { useTags } from "@/hooks/use-tags";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepBaseProps {
  control: Control<CreatePostInput>;
}

interface PhotoStepProps {
  photos: PhotoItem[];
  onAddPhoto: (file: File, preview: string) => void;
  onRemovePhoto: (index: number) => void;
  photoError: string | null;
}

interface TagStepProps extends StepBaseProps {
  opts: (cat: string) => { label: string; value: string }[];
  tagsLoading: boolean;
}

function NegotiableSwitch({ control }: StepBaseProps) {
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
                "data-[state=checked]:left-[calc(100%-2.25rem)]"
              )}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="min-h-[1.1em]" />
        </FormItem>
      )}
    />
  );
}

function TagsLoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <IconLoader2 className="size-5 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Cargando etiquetas…</span>
    </div>
  );
}

function MobileStep1({ control }: StepBaseProps) {
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        control={control}
        name="title"
        label="Título *"
        placeholder="ej: Camiseta Nike azul"
      />
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <TextInput
            control={control}
            name="priceClp"
            type="number"
            label="Precio (CLP) *"
            placeholder="ej: 25000"
            step={10}
            icon={IconCurrencyDollar}
            formatNumber
            maxValue={1000000}
          />
        </div>
        <NegotiableSwitch control={control} />
      </div>
      <TextInput
        control={control}
        name="description"
        label="Descripción"
        placeholder="Describe la prenda, tela, detalles…"
        isTextarea
        inputClassName="min-h-[100px] max-h-[160px]"
      />
    </div>
  );
}

function MobileStep2({ photos, onAddPhoto, onRemovePhoto, photoError }: PhotoStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Fotos de la prenda *
        </p>
        <p className="text-xs text-muted-foreground">
          Mínimo 3, máximo 6.
        </p>
      </div>
      <PhotoUploadGrid
        photos={photos}
        onAddPhoto={onAddPhoto}
        onRemovePhoto={onRemovePhoto}
        validationError={photoError}
      />
    </div>
  );
}

function RequiredTagsStep({ control, opts, tagsLoading }: TagStepProps) {
  if (tagsLoading) return <TagsLoadingState />;
  return (
    <div className="flex flex-col gap-6">
      <SizeSelector
        control={control}
        name="Talla"
        label="Talla *"
        options={opts("Talla").map((o) => o.value)}
        type="multiple"
      />
      <ToggleInputGroup
        control={control}
        name="Condición"
        label="Condición *"
        options={opts("Condición")}
        type="single"
      />
      <ToggleInputGroup
        control={control}
        name="Tipo de prenda"
        label="Tipo de prenda *"
        options={opts("Tipo de prenda")}
        type="multiple"
      />
    </div>
  );
}

function MobileOptionalTags1({ control, opts, tagsLoading }: TagStepProps) {
  if (tagsLoading) return <TagsLoadingState />;
  return (
    <div className="flex flex-col gap-6">
      <ToggleInputGroup control={control} name="Marca" label="Marca" options={opts("Marca")} type="multiple" />
      <ToggleInputGroup control={control} name="Color" label="Color" options={opts("Color")} type="multiple" />
      <ToggleInputGroup control={control} name="Género" label="Género" options={opts("Género")} type="multiple" />
    </div>
  );
}

function MobileOptionalTags2({ control, opts, tagsLoading }: TagStepProps) {
  if (tagsLoading) return <TagsLoadingState />;
  return (
    <div className="flex flex-col gap-6">
      <ToggleInputGroup control={control} name="Temporada" label="Temporada" options={opts("Temporada")} type="multiple" />
      <ToggleInputGroup control={control} name="Estilo" label="Estilo" options={opts("Estilo")} type="multiple" />
    </div>
  );
}

interface DesktopStep1Props extends StepBaseProps, PhotoStepProps {}

function DesktopStep1({
  control,
  photos,
  onAddPhoto,
  onRemovePhoto,
  photoError,
}: DesktopStep1Props) {
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        control={control}
        name="title"
        label="Título *"
        placeholder="ej: Camiseta Nike azul"
      />
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <TextInput
            control={control}
            name="priceClp"
            type="number"
            label="Precio (CLP) *"
            placeholder="ej: 25000"
            step={10}
            icon={IconCurrencyDollar}
            formatNumber
            maxValue={1000000}
          />
        </div>
        <NegotiableSwitch control={control} />
      </div>
      <TextInput
        control={control}
        name="description"
        label="Descripción"
        placeholder="Describe la prenda, tela, detalles…"
        isTextarea
        inputClassName="min-h-[80px] max-h-[120px]"
      />

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Fotos * <span className="font-normal text-muted-foreground/50">(mín. 3)</span>
        </p>
        <PhotoUploadGrid
          photos={photos}
          onAddPhoto={onAddPhoto}
          onRemovePhoto={onRemovePhoto}
          validationError={photoError}
          columns={6}
        />
      </div>
    </div>
  );
}

function DesktopAllOptionalTags({ control, opts, tagsLoading }: TagStepProps) {
  if (tagsLoading) return <TagsLoadingState />;
  return (
    <div className="flex flex-col gap-6">
      <ToggleInputGroup control={control} name="Marca" label="Marca" options={opts("Marca")} type="multiple" />
      <ToggleInputGroup control={control} name="Color" label="Color" options={opts("Color")} type="multiple" />
      <ToggleInputGroup control={control} name="Género" label="Género" options={opts("Género")} type="multiple" />
      <ToggleInputGroup control={control} name="Temporada" label="Temporada" options={opts("Temporada")} type="multiple" />
      <ToggleInputGroup control={control} name="Estilo" label="Estilo" options={opts("Estilo")} type="multiple" />
    </div>
  );
}

export function PostCreateModal({ isOpen, onClose }: CreatePostModalProps) {
  const {
    form,
    photos,
    addPhoto,
    removePhoto,
    photoError,
    step,
    totalSteps,
    isMobile,
    isUploading,
    isPosting,
    isPostCreated,
    isSubmitting,
    isLastStep,
    showTagSuggestionModal,
    handleNext,
    handleBack,
    handlePublish,
    handleManualTags,
    handleGeminiTags,
    reset,
  } = useCreatePost(onClose);

  const { categories, isLoading: tagsLoading } = useTags();

  const opts = React.useCallback(
    (cat: string) =>
      (categories[cat] ?? []).map((v) => ({ label: v, value: v })),
    [categories]
  );

  const handleClose = React.useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const isPending = isUploading || isPosting || isSubmitting;

  const stepLabel = isMobile
    ? ["Información básica", "Fotos", "Tags obligatorios", "Tags opcionales", "Tags opcionales"][step - 1]
    : ["Información y fotos", "Tags obligatorios", "Tags opcionales"][step - 1];

  const renderContent = () => {
    const baseProps: StepBaseProps = { control: form.control };
    const photoProps: PhotoStepProps = {
      photos,
      onAddPhoto: addPhoto,
      onRemovePhoto: removePhoto,
      photoError,
    };
    const tagProps: TagStepProps = { ...baseProps, opts, tagsLoading };

    if (isMobile) {
      switch (step) {
        case 1: return <MobileStep1 {...baseProps} />;
        case 2: return <MobileStep2 {...photoProps} />;
        case 3: return <RequiredTagsStep {...tagProps} />;
        case 4: return <MobileOptionalTags1 {...tagProps} />;
        case 5: return <MobileOptionalTags2 {...tagProps} />;
      }
    } else {
      switch (step) {
        case 1: return <DesktopStep1 {...baseProps} {...photoProps} />;
        case 2: return <RequiredTagsStep {...tagProps} />;
        case 3: return <DesktopAllOptionalTags {...tagProps} />;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className={cn(
          "flex flex-col p-0 gap-0 w-full sm:max-w-lg",
          isMobile ? "h-[640px]" : "h-[640px] md:max-w-2xl"
        )}
      >
        <TagSuggestionModal
          isOpen={showTagSuggestionModal}
          photos={photos.map((p) => p.file)}
          onManual={handleManualTags}
          onGemini={handleGeminiTags}
        />
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              Nueva Publicación
            </DialogTitle>
            <span className="text-xs text-muted-foreground">{stepLabel}</span>
          </div>
        </DialogHeader>

        <Separator />

        {/* Stepper */}
        <div className="px-6 py-3 shrink-0">
          <StepProgress currentStep={step} totalSteps={totalSteps} />
        </div>

        <Separator />

        {/* Scrollable content */}
        <Form {...form}>
          <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
            {renderContent()}
          </div>
        </Form>

        <Separator />

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
            className="text-muted-foreground"
          >
            Cancelar
          </Button>

          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isPending || (step === 2 && isPostCreated)}
              >
                Atrás
              </Button>
            )}
            <Button
              onClick={isLastStep ? handlePublish : handleNext}
              disabled={isPending}
            >
              {isPending && (
                <IconLoader2 className="mr-1.5 size-4 animate-spin" />
              )}
              {isLastStep
                ? isSubmitting
                  ? "Publicando…"
                  : "Publicar"
                : isPosting
                  ? "Creando…"
                  : isUploading
                    ? "Subiendo…"
                    : "Siguiente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
