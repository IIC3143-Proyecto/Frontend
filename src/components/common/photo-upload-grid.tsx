"use client";

import * as React from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { IconLoader2, IconPlus, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface PhotoItem {
  file: File;
  preview: string;
}

/** Supported size options for PhotoUploadGrid and its slots. */
type PhotoUploadSize = "sm" | "default" | "lg";

/** Size-based class names for PhotoUploadGrid slots. */
const sizeClasses = {
  sm: { icon: "size-4", deleteBtn: "size-5", deleteIcon: "size-3" },
  default: { icon: "size-5", deleteBtn: "size-6", deleteIcon: "size-3.5" },
  lg: { icon: "size-6", deleteBtn: "size-7", deleteIcon: "size-4" },
};

/**
 * Props for the internal PhotoSlot component.
 * Slots follow a sequential-unlock model: only the slot at index `photos.length` is active.
 * @property photo Uploaded photo data; undefined when slot is empty.
 * @property isActive Whether this slot accepts drops and file input.
 * @property isLocked Whether this slot is not yet reachable (previous slots still empty).
 * @property size Visual size variant.
 * @property disabled Disables interaction and dims the slot.
 * @property onPhotoAdded Called with the compressed WebP file and its object URL preview.
 * @property onDelete Called when the user removes the photo from this slot.
 */
interface PhotoSlotProps {
  photo?: PhotoItem;
  isActive: boolean;
  isLocked: boolean;
  size: PhotoUploadSize;
  disabled: boolean;
  onPhotoAdded: (file: File, preview: string) => void;
  onDelete: () => void;
}

/**
 * Single upload slot. Compresses the accepted file to WebP (max 2 MB / 1200 px)
 * before calling onPhotoAdded.
 */
function PhotoSlot({
  photo,
  isActive,
  isLocked,
  size,
  disabled,
  onPhotoAdded,
  onDelete,
}: PhotoSlotProps) {
  const [isConverting, setIsConverting] = React.useState(false);
  const [convError, setConvError] = React.useState<string | null>(null);
  const [rejectMessage, setRejectMessage] = React.useState<string | null>(null);
  const s = sizeClasses[size];

  const processFile = React.useCallback(
    async (raw: File) => {
      setIsConverting(true);
      setConvError(null);
      try {
        const compressed = await imageCompression(raw, {
          fileType: "image/webp",
          maxSizeMB: 2,
          maxWidthOrHeight: 1200,
          initialQuality: 0.85,
          useWebWorker: true,
        });
        const named = new File(
          [compressed],
          raw.name.replace(/\.[^.]+$/, ".webp"),
          { type: "image/webp" }
        );
        const preview = URL.createObjectURL(named);
        onPhotoAdded(named, preview);
      } catch (err) {
        setConvError(
          err instanceof Error ? err.message : "Error al procesar la imagen"
        );
      } finally {
        setIsConverting(false);
      }
    },
    [onPhotoAdded]
  );

  const onDrop = React.useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setRejectMessage(null);
      if (rejected.length > 0) {
        setRejectMessage(rejected[0].errors[0]?.message ?? "Archivo no aceptado");
        return;
      }
      if (accepted[0]) await processFile(accepted[0]);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: !isActive || !!photo || isConverting || disabled,
    multiple: false,
  });

  const hasError = Boolean(convError || rejectMessage);
  const errorMessage = convError ?? rejectMessage;

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "aspect-square rounded-lg overflow-hidden relative border-2 border-dashed",
          photo && "border-transparent",
          !photo && isActive && !hasError && !disabled && "border-muted-foreground/40",
          (!photo && isLocked) || (!photo && isActive && disabled) ? "border-muted-foreground/15" : "",
          !photo && hasError && "border-destructive"
        )}
      >
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.preview}
              alt="Foto de prenda"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Eliminar foto"
                className={cn(
                  "absolute top-1.5 right-1.5",
                  s.deleteBtn,
                  "rounded-full bg-black/70 hover:bg-black transition-colors",
                  "flex items-center justify-center"
                )}
              >
                <IconX className={cn(s.deleteIcon, "text-white")} />
              </button>
            )}
          </>
        ) : isActive && !disabled ? (
          <div
            {...getRootProps()}
            className={cn(
              "w-full h-full flex items-center justify-center",
              "bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors",
              isDragActive && "bg-primary/5"
            )}
          >
            <input {...getInputProps()} />
            {isConverting ? (
              <IconLoader2 className={cn(s.icon, "text-muted-foreground animate-spin")} />
            ) : (
              <IconPlus className={cn(s.icon, "text-muted-foreground/60")} />
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-muted/20" />
        )}
      </div>

      {hasError && (
        <p className="text-[10px] font-bold text-destructive text-center leading-tight px-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

const gridColsClass: Record<number, string> = {
  3: "grid-cols-3",
  6: "grid-cols-6",
};

const gridGapClass: Record<PhotoUploadSize, string> = {
  sm: "gap-2",
  default: "gap-3",
  lg: "gap-4",
};

/**
 * Props for PhotoUploadGrid.
 * @property photos Current list of uploaded photos.
 * @property onAddPhoto Called with the compressed WebP file and its preview URL.
 * @property onRemovePhoto Called with the slot index when a photo is deleted.
 * @property validationError External validation message shown below the grid.
 * @property maxPhotos Maximum number of slots rendered (default 6).
 * @property columns Grid column count: 3 (default, mobile) or 6 (desktop, single row).
 * @property size Visual size variant (default "default").
 * @property disabled Disables all interaction and dims the grid.
 */
interface PhotoUploadGridProps {
  photos: PhotoItem[];
  onAddPhoto: (file: File, preview: string) => void;
  onRemovePhoto: (index: number) => void;
  validationError?: string | null;
  maxPhotos?: number;
  columns?: 3 | 6;
  size?: PhotoUploadSize;
  disabled?: boolean;
}

/**
 * Sequential-unlock photo upload grid.
 * Only one slot is active at a time; the next unlocks once the current is filled.
 */
export function PhotoUploadGrid({
  photos,
  onAddPhoto,
  onRemovePhoto,
  validationError,
  maxPhotos = 6,
  columns = 3,
  size = "default",
  disabled = false,
}: PhotoUploadGridProps) {
  return (
    <div className={cn("flex flex-col gap-3", disabled && "opacity-60 pointer-events-none")}>
      <div className={cn("grid", gridColsClass[columns] ?? "grid-cols-3", gridGapClass[size])}>
        {Array.from({ length: maxPhotos }).map((_, i) => {
          const photo = photos[i];
          const isActive = i === photos.length && photos.length < maxPhotos;
          const isLocked = i > photos.length;

          return (
            <PhotoSlot
              key={i}
              photo={photo}
              isActive={isActive}
              isLocked={isLocked}
              size={size}
              disabled={disabled}
              onPhotoAdded={onAddPhoto}
              onDelete={() => onRemovePhoto(i)}
            />
          );
        })}
      </div>

      {validationError && (
        <p className="text-xs font-bold text-destructive">{validationError}</p>
      )}
    </div>
  );
}
