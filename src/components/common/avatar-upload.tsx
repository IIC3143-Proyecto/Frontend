"use client";

import * as React from "react";
import { Camera, Loader2 } from "lucide-react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAvatarUpload, type UseAvatarUploadOptions } from "@/hooks/use-avatar-upload";

// ─── Variants ────────────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvatarUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof avatarWrapperVariants>,
    Pick<UseAvatarUploadOptions, "maxSizeMB" | "maxWidthOrHeight" | "quality"> {
  /** Current avatar URL (e.g. from server) */
  src?: string;
  /** Initials shown in AvatarFallback */
  fallback?: string;
  /** Called with the converted WebP File, ready to send to the backend */
  onChange?: (file: File) => void;
  /** Max accepted file size for the dropzone in bytes (default: 5 MB) */
  maxDropzoneSize?: number;
  disabled?: boolean;
  /** External validation error (e.g. from form submission) */
  validationError?: string | null;
  /** Called when file dialog is closed without selecting a file */
  onFileDialogCancel?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AvatarUpload = React.forwardRef<
  HTMLDivElement,
  AvatarUploadProps
>(function AvatarUpload(
  {
    src,
    fallback = "??",
    onChange,
    size = "md",
    disabled = false,
    maxSizeMB = 1,
    maxWidthOrHeight = 512,
    quality = 0.85,
    maxDropzoneSize = 5 * 1024 * 1024,
    validationError,
    onFileDialogCancel,
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
        const reason = rejected[0].errors[0]?.message ?? "File not accepted";
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

  // Internal errors from conversion/rejection take priority; fall back to external validation error
  const hasInternalError = Boolean(error || rejectMessage);
  const internalErrorMessage = error?.message ?? rejectMessage;

  const hasError = hasInternalError || Boolean(validationError);
  const errorMessage = internalErrorMessage ?? validationError;

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
        >
        <input
          {...getInputProps()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Upload avatar image"
        />

        <Avatar className={cn(avatarImageVariants({ size }), "size-full")}>
            <AvatarImage src={displaySrc} alt="Avatar preview" />
            <AvatarFallback className="text-sm font-medium select-none">
            {fallback}
            </AvatarFallback>
        </Avatar>

        {!disabled && (
            <div
            className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full",
                "bg-black/50 transition-opacity duration-200",
                isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            >
            {isConverting ? (
                <Loader2 className={cn(overlayIconVariants({ size }), "animate-spin")} />
            ) : (
                <Camera className={overlayIconVariants({ size })} />
            )}
            </div>
        )}
        </div>


      {/* Status / error message — mirrors FormMessage pattern */}
      <div className="min-h-[1.1em]">
        {hasError ? (
          <p className="text-xs font-bold text-destructive text-center">
            {errorMessage}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground select-none text-center">
            {disabled
              ? "Avatar upload disabled"
              : isConverting
                ? "Converting to WebP…"
                : "Click or drag to change avatar"}
          </p>
        )}
      </div>
    </div>
  );
});

AvatarUpload.displayName = "AvatarUpload";