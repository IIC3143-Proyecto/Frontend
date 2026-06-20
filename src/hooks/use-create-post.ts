"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { createPost, patchPostTags, uploadPostImages } from "@/lib/api/post";
import { desktopToMobile, mobileToDesktop } from '@/lib/post-steps';
import { handleApiError } from "@/lib/api/handle-error";
import type { PhotoItem } from "@/lib/types/post";

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

export type { PhotoItem };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
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
  isPosting: boolean;
  isPostCreated: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
  showTagSuggestionModal: boolean;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  handlePublish: () => Promise<void>;
  handleManualTags: () => void;
  handleGeminiTags: (tags: Array<{ title: string; category: string }>) => void;
  reset: () => void;
}

export function useCreatePost(onClose: () => void): UseCreatePostReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const totalSteps = isMobile ? 5 : 3;

  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPostCreated, setIsPostCreated] = useState(false);
  const [showTagSuggestionModal, setShowTagMethodModal] = useState(false);
  const postIdRef = useRef<string>('');
  const photosUploadedRef = useRef<boolean>(false);

  const photosRef = useRef(photos);
  useLayoutEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const isLastStep = step === totalSteps;
  const isPhotoStep = isMobile ? step === 2 : step === 1;

  const isMountedRef = useRef(false);
  useEffect(() => {
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

  const addPhoto = useCallback((file: File, preview: string) => {
    setPhotos((prev) => [...prev, { file, preview }]);
    setPhotoError(null);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const validateStep = useCallback(async (): Promise<boolean> => {
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

  const doUpload = useCallback(async (): Promise<boolean> => {
    if (photosUploadedRef.current) return true;
    setIsUploading(true);
    try {
      let accessToken: string;
      try {
        accessToken = await getAccessToken();
      } catch {
        router.push("/session-expired");
        return false;
      }
      const fd = new FormData();
      photos.forEach((p) => fd.append("images", p.file));
      await uploadPostImages(postIdRef.current, fd, accessToken);
      photosUploadedRef.current = true;
      return true;
    } catch (err) {
      handleApiError(err, "Error al subir fotos", router);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [photos, router]);

  const doCreatePost = useCallback(async (): Promise<boolean> => {
    if (postIdRef.current) return true;
    setIsPosting(true);
    try {
      let accessToken: string;
      try {
        accessToken = await getAccessToken();
      } catch {
        router.push("/session-expired");
        return false;
      }

      const values = form.getValues();
      const id = await createPost(
        {
          title: values.title,
          description: values.description,
          priceClp: Number(values.priceClp),
          isNegotiable: values.isNegotiable ?? false,
        },
        accessToken,
      );
      postIdRef.current = id;
      setIsPostCreated(true);
      return true;
    } catch (err) {
      handleApiError(err, "Error al crear publicación", router);
      return false;
    } finally {
      setIsPosting(false);
    }
  }, [form, router]);

  const handleManualTags = useCallback(() => {
    setShowTagMethodModal(false);
    setStep((s) => s + 1);
  }, []);

  const handleGeminiTags = useCallback((tags: Array<{ title: string; category: string }>) => {
    const grouped: Record<string, string[]> = {};
    for (const { title, category } of tags) {
      (grouped[category] ??= []).push(title);
    }
    const single = ['Condición'] as const;
    for (const [category, values] of Object.entries(grouped)) {
      const key = category as keyof CreatePostSchema;
      if (single.includes(category as typeof single[number])) {
        form.setValue(key, values[0] ?? '', { shouldValidate: true });
      } else {
        form.setValue(key, values, { shouldValidate: true });
      }
    }
    setShowTagMethodModal(false);
    setStep((s) => s + 1);
  }, [form]);

  const handleNext = useCallback(async () => {
    const valid = await validateStep();
    if (!valid) return;

    if (step === 1) {
      const ok = await doCreatePost();
      if (!ok) return;
    }

    if (isPhotoStep) {
      const ok = await doUpload();
      if (!ok) return;
      setShowTagMethodModal(true);
      return;
    }

    setStep((s) => s + 1);
  }, [validateStep, step, doCreatePost, isPhotoStep, doUpload]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const reset = useCallback(() => {
    form.reset();
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.preview));
      return [];
    });
    setPhotoError(null);
    setStep(1);
    postIdRef.current = '';
    photosUploadedRef.current = false;
    setIsPostCreated(false);
  }, [form]);

  const handlePublish = useCallback(async () => {
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
          await patchPostTags(
            postIdRef.current,
            {
              Talla: data.Talla,
              Condición: [data.Condición],
              "Tipo de prenda": data["Tipo de prenda"],
              Marca: data.Marca,
              Color: data.Color,
              Género: data.Género,
              Estilo: data.Estilo,
              Temporada: data.Temporada,
            },
            accessToken,
          );
          toast.success("Publicación creada", {
            description: "Tu prenda fue publicada exitosamente.",
          });
          queryClient.invalidateQueries({ queryKey: ["posts"] });
          onClose();
          reset();
        } catch (err) {
          handleApiError(err, "Error al publicar", router);
        }
      },
      () => {
        toast.error("Por favor completa todos los campos requeridos");
      }
    )();

    setIsSubmitting(false);
  }, [validateStep, form, onClose, reset, router, queryClient]);

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
  };
}
