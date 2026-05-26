"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/actions/auth";

export const createPostSchema = z.object({
  title: z.string().min(1, "Título requerido").max(100, "Máximo 100 caracteres"),
  priceClp: z.coerce
    .number()
    .positive("El precio debe ser mayor a 0"),
  isNegotiable: z.boolean().default(false),
  description: z.string().max(500, "Máximo 500 caracteres"),
  Talla: z.array(z.string()).min(1, "Selecciona al menos una talla"),
  Condición: z.string().min(1, "Selecciona una condición"),
  "Tipo de prenda": z.array(z.string()).min(1, "Selecciona al menos un tipo de prenda"),
  Marca: z.array(z.string()).default([]),
  Color: z.array(z.string()).default([]),
  Género: z.array(z.string()).default([]),
  Estilo: z.array(z.string()).default([]),
  Temporada: z.array(z.string()).default([]),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;
export type CreatePostInput = z.input<typeof createPostSchema>;

export interface PhotoItem {
  file: File;
  preview: string;
}

async function uploadPhotos(photos: PhotoItem[], accessToken: string): Promise<string[]> {
  const fd = new FormData();
  photos.forEach((p) => fd.append("photos", p.file));

  const res = await fetch("/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: fd,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? "Error al subir las fotos"),
      { status: res.status }
    );
  }

  const { photoUrls } = (await res.json()) as { photoUrls: string[] };
  return photoUrls;
}

/**
 * @param data.Condición Single string from the form; wrapped in an array because the API expects string[].
 */
async function createPost(
  data: CreatePostSchema & { photoUrls: string[]; accessToken: string }
): Promise<void> {
  const { Condición, accessToken, ...rest } = data;

  const res = await fetch("/post", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...rest, Condición: [Condición] }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? "Error al crear la publicación"),
      { status: res.status }
    );
  }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

function desktopToMobile(step: number, photoCount: number): number {
  switch (step) {
    case 1: return photoCount > 0 ? 2 : 1;
    case 2: return 3;
    case 3: return 4;
    default: return 1;
  }
}

function mobileToDesktop(step: number): number {
  switch (step) {
    case 3: return 2;
    case 4:
    case 5: return 3;
    default: return 1;
  }
}

export interface UseCreatePostReturn {
  form: ReturnType<typeof useForm<CreatePostInput, unknown, CreatePostSchema>>;
  photos: PhotoItem[];
  addPhoto: (file: File, preview: string) => void;
  removePhoto: (index: number) => void;
  photoError: string | null;
  step: number;
  totalSteps: number;
  isMobile: boolean;
  isUploading: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  handlePublish: () => Promise<void>;
  reset: () => void;
}

export function useCreatePost(onClose: () => void): UseCreatePostReturn {
  const router = useRouter();
  const isMobile = useIsMobile();
  const totalSteps = isMobile ? 5 : 3;

  const [step, setStep] = React.useState(1);
  const [photos, setPhotos] = React.useState<PhotoItem[]>([]);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const uploadedUrlsRef = React.useRef<string[]>([]);

  const photosRef = React.useRef(photos);
  React.useLayoutEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const isLastStep = step === totalSteps;
  const isPhotoStep = isMobile ? step === 2 : step === 1;

  const isMountedRef = React.useRef(false);
  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    setStep(prev =>
      isMobile
        ? desktopToMobile(prev, photosRef.current.length)
        : mobileToDesktop(prev)
    );
  }, [isMobile]);

  const form = useForm<CreatePostInput, unknown, CreatePostSchema>({
    resolver: zodResolver(createPostSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      priceClp: "",
      isNegotiable: false,
      description: "",
      Talla: [],
      Condición: "",
      "Tipo de prenda": [],
      Marca: [],
      Color: [],
      Género: [],
      Estilo: [],
      Temporada: [],
    },
  });

  const addPhoto = React.useCallback((file: File, preview: string) => {
    setPhotos((prev) => [...prev, { file, preview }]);
    setPhotoError(null);
  }, []);

  const removePhoto = React.useCallback((index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const validateStep = React.useCallback(async (): Promise<boolean> => {
    if (isMobile) {
      switch (step) {
        case 1:
          return form.trigger(["title", "priceClp", "description"]);
        case 2:
          if (photos.length < 3) {
            setPhotoError("Debes subir al menos 3 fotos");
            return false;
          }
          return true;
        case 3:
          return form.trigger(["Talla", "Condición", "Tipo de prenda"]);
        default:
          return true;
      }
    } else {
      switch (step) {
        case 1: {
          const textOk = await form.trigger(["title", "priceClp", "description"]);
          if (photos.length < 3) {
            setPhotoError("Debes subir al menos 3 fotos");
            return false;
          }
          return textOk;
        }
        case 2:
          return form.trigger(["Talla", "Condición", "Tipo de prenda"]);
        default:
          return true;
      }
    }
  }, [isMobile, step, photos.length, form]);

  const doUpload = React.useCallback(async (): Promise<boolean> => {
    setIsUploading(true);
    try {
      let accessToken: string;
      try {
        accessToken = await getAccessToken();
      } catch {
        router.push("/session-expired");
        return false;
      }
      const urls = await uploadPhotos(photos, accessToken);
      uploadedUrlsRef.current = urls;
      return true;
    } catch (err) {
      const status = (err as { status?: number }).status;
      const message =
        err instanceof Error ? err.message : "Error al subir las fotos";

      if (status === undefined) {
        toast.error("Error de red", {
          description: "Verifica tu conexión e inténtalo de nuevo.",
        });
      } else if (status === 401) {
        router.push("/session-expired");
      } else {
        toast.error("Error al subir fotos", { description: message });
      }
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [photos, router]);

  const handleNext = React.useCallback(async () => {
    const valid = await validateStep();
    if (!valid) return;

    if (isPhotoStep) {
      const ok = await doUpload();
      if (!ok) return;
    }

    setStep((s) => s + 1);
  }, [validateStep, isPhotoStep, doUpload]);

  const handleBack = React.useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const reset = React.useCallback(() => {
    form.reset();
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.preview));
      return [];
    });
    setPhotoError(null);
    setStep(1);
    uploadedUrlsRef.current = [];
  }, [form]);

  const handlePublish = React.useCallback(async () => {
    const valid = await validateStep();
    if (!valid) return;

    setIsSubmitting(true);

    await form.handleSubmit(
      async (data: CreatePostSchema) => {
        let accessToken: string;
        try {
          accessToken = await getAccessToken();
        } catch {
          router.push("/session-expired");
          return;
        }
        try {
          await createPost({ ...data, photoUrls: uploadedUrlsRef.current, accessToken });
          toast.success("Publicación creada", {
            description: "Tu prenda fue publicada exitosamente.",
          });
          onClose();
          reset();
        } catch (err) {
          const status = (err as { status?: number }).status;
          const message =
            err instanceof Error ? err.message : "Error al crear la publicación";

          if (status === undefined) {
            toast.error("Error de red", {
              description: "Verifica tu conexión e inténtalo de nuevo.",
            });
          } else if (status === 401) {
            router.push("/session-expired");
          } else {
            toast.error("Error", { description: message });
          }
        }
      },
      () => {
        toast.error("Por favor completa todos los campos requeridos");
      }
    )();

    setIsSubmitting(false);
  }, [validateStep, form, onClose, reset, router]);

  return {
    form,
    photos,
    addPhoto,
    removePhoto,
    photoError,
    step,
    totalSteps,
    isMobile,
    isUploading,
    isSubmitting,
    isLastStep,
    handleNext,
    handleBack,
    handlePublish,
    reset,
  };
}
