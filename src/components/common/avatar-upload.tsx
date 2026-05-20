"use client";

import * as React from "react";
import { IconUserPlus, IconLoader2, IconCamera } from '@tabler/icons-react';
import { useDropzone, type FileRejection } from "react-dropzone";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAvatarUpload, type UseAvatarUploadOptions } from "@/hooks/use-avatar-upload";

const avatarWrapperVariants = cva("group relative rounded-full", {
  variants: {
    size: {
      sm: "size-14",
      md: "size-24",
      lg: "size-32",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
      false: "cursor-pointer",
    },
  },
  defaultVariants: {
    size: "md",
    disabled: false,
  },
});

const avatarImageVariants = cva("rounded-full", {
  variants: {
    size: {
      sm: "size-14",
      md: "size-24",
      lg: "size-32",
    },
  },
  defaultVariants: { size: "md" },
});

const overlayIconVariants = cva("text-white", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-7",
    },
  },
  defaultVariants: { size: "md" },
});

const fallbackIconVariants = cva("text-muted-foreground", {
  variants: {
    size: {
      sm: "size-5",
      md: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: { size: "md" },
});

export interface AvatarUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof avatarWrapperVariants>,
    Pick<UseAvatarUploadOptions, "maxSizeMB" | "maxWidthOrHeight" | "quality"> {
  /** URL of an existing avatar to display before any file is selected. */
  src?: string;
  /** Content shown when no image is available. Defaults to a user-plus icon. */
  fallback?: string | React.ReactNode;
  /** Called with the converted WebP `File` once the user selects an image. */
  onChange?: (file: File) => void;
  /** Maximum input file size accepted by the dropzone, in bytes. Defaults to 5 MB. */
  maxDropzoneSize?: number;
  /** Disables the dropzone and dims the component. */
  disabled?: boolean;
  /** External error message from a parent form. Shown when no internal error is present. */
  validationError?: string | null;
  /** Called when the file dialog is dismissed without selecting a file. */
  onFileDialogCancel?: () => void;
  /** Adds `aria-required` and a `*` badge. Does not enforce validation internally. */
  required?: boolean;
}

/**
 * AvatarUpload
 *
 * Circular avatar picker that converts any dropped or selected image to WebP in-browser,
 * shows a live preview, and surfaces both dropzone-level and parent-supplied validation errors.
 */
export const AvatarUpload = React.forwardRef<
  HTMLDivElement,
  AvatarUploadProps
>(function AvatarUpload(
  {
    src,
    fallback,
    onChange,
    size = "md",
    disabled = false,
    maxSizeMB = 1,
    maxWidthOrHeight = 512,
    quality = 0.85,
    maxDropzoneSize = 5 * 1024 * 1024,
    validationError,
    onFileDialogCancel,
    required = false,
    className,
    ...props
  },
  ref
) {
  const { preview, isConverting, error, processFile } = useAvatarUpload({
    maxSizeMB,
    maxWidthOrHeight,
    quality,
    onFileReady: onChange,
  });

  const [rejectMessage, setRejectMessage] = React.useState<string | null>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const onDrop = React.useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setRejectMessage(null);

      if (rejected.length > 0) {
        const reason = rejected[0].errors[0]?.message ?? "Archivo no aceptado";
        setRejectMessage(reason);
        return;
      }

      if (accepted[0]) {
        await processFile(accepted[0]);
      }
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"] },
    maxFiles: 1,
    maxSize: maxDropzoneSize,
    disabled: disabled || isConverting,
    multiple: false,
  });

  const displaySrc = preview ?? src;

  const hasInternalError = Boolean(error || rejectMessage);
  const internalErrorMessage = error?.message ?? rejectMessage;

  const hasError = hasInternalError || Boolean(validationError);
  const errorMessage = internalErrorMessage ?? validationError;

  const defaultFallback = (
    <IconUserPlus className={fallbackIconVariants({ size })} />
  );
  const displayFallback = fallback ?? defaultFallback;

  return (
    <div
      ref={ref}
      className={cn("flex flex-col items-center gap-2", className)}
      {...props}
    >
      <div
        {...getRootProps()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
            avatarWrapperVariants({ size, disabled }),
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragActive && "ring-2 ring-primary ring-offset-2",
            hasError && "border-1 border-destructive",
            hasError && (isFocused || isHovered) && "shadow-[0_0_0_3px_oklch(from_var(--destructive)_l_c_h_/_0.12)]"
        )}
        role="img"
        aria-required={required}
        aria-label={`Subir imagen de usuario${required ? " (required)" : ""}`}
        >
        <input
          {...getInputProps()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Subir imagen de usuario"
        />

        <Avatar className={cn(avatarImageVariants({ size }), "size-full")}>
            <AvatarImage src={displaySrc} alt="Vista previa del avatar" />
            <AvatarFallback className="text-sm font-medium select-none flex items-center justify-center">
            {displayFallback}
            </AvatarFallback>
        </Avatar>
        {required && !disabled && (
          <span
            className="absolute -top-2 -right-2 text-base font-bold text-destructive"
            aria-hidden="true"
          >
            *
          </span>
        )}
        {!disabled && (
            <div
            className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full",
                "bg-black/50 transition-opacity duration-200",
                isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            >
            {isConverting ? (
                <IconLoader2 className={cn(overlayIconVariants({ size }), "animate-spin")} />
            ) : (
                <IconCamera className={overlayIconVariants({ size })} />
            )}
            </div>
        )}
        </div>

      <div className="min-h-[1.1em]">
        {hasError ? (
          <p className="text-xs font-bold text-destructive text-center">
            {errorMessage}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground select-none text-center">
            {disabled
              ? "Subida de avatar deshabilitada"
              : isConverting
                ? "Convirtiendo a WebP…"
                : "Haz clic o arrastra para cambiar la imagen"}
          </p>
        )}
      </div>
    </div>
  );
});

AvatarUpload.displayName = "AvatarUpload";