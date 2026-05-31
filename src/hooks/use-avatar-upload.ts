"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";

export interface UseAvatarUploadOptions {
  /** Max output file size in MB (default: 1) */
  maxSizeMB?: number;
  /** Max width or height in px (default: 512) */
  maxWidthOrHeight?: number;
  /** WebP quality 0-1 (default: 0.85) */
  quality?: number;
  /** Called when conversion finishes successfully */
  onFileReady?: (file: File) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export interface UseAvatarUploadReturn {
  /** Object URL for preview — revoke on unmount */
  preview: string | null;
  /** True while converting to WebP */
  isConverting: boolean;
  /** Last conversion error, if any */
  error: Error | null;
  /** Feed a raw File from the input/dropzone */
  processFile: (file: File) => Promise<File | null>;
  /** Reset state and revoke preview URL */
  reset: () => void;
}

const WEBP_OPTIONS_DEFAULTS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 512,
  quality: 0.85,
};

export function useAvatarUpload(
  options: UseAvatarUploadOptions = {}
): UseAvatarUploadReturn {
  const { maxSizeMB, maxWidthOrHeight, quality, onFileReady, onError } = {
    ...WEBP_OPTIONS_DEFAULTS,
    ...options,
  };

  const [preview, setPreview] = React.useState<string | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const previewUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const processFile = React.useCallback(
    async (raw: File): Promise<File | null> => {
      setIsConverting(true);
      setError(null);

      try {
        const webpFile = await imageCompression(raw, {
          fileType: "image/webp",
          maxSizeMB,
          maxWidthOrHeight,
          initialQuality: quality,
          useWebWorker: true,
        });

        const namedFile = new File(
          [webpFile],
          raw.name.replace(/\.[^.]+$/, ".webp"),
          { type: "image/webp" }
        );

        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        const objectUrl = URL.createObjectURL(namedFile);
        previewUrlRef.current = objectUrl;
        setPreview(objectUrl);

        onFileReady?.(namedFile);
        return namedFile;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Conversion failed");
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsConverting(false);
      }
    },
    [maxSizeMB, maxWidthOrHeight, quality, onFileReady, onError]
  );

  const reset = React.useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreview(null);
    setError(null);
    setIsConverting(false);
  }, []);

  return { preview, isConverting, error, processFile, reset };
}