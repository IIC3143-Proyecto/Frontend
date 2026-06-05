"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { patchPost, patchPostTags, appendPostImages, deletePostImages, fetchPostTags } from "@/lib/api/post";
import type { PostDto } from "@/lib/types/post";
import type { PhotoItem } from "@/components/common/photo-upload-grid";

function handleApiError(err: unknown, label: string, router: { push: (url: string) => void }) {
  const status = (err as { status?: number }).status;
  const message = err instanceof Error ? err.message : `Error en ${label}`;
  if (status === undefined) {
    toast.error("Error de red", { description: "Verifica tu conexión e inténtalo de nuevo." });
  } else if (status === 401) {
    router.push("/session-expired");
  } else {
    toast.error(label, { description: message });
  }
}

export const editPostSchema = z.object({
  title: z.string().min(1, "Título requerido").max(100, "Máximo 100 caracteres"),
  priceClp: z.coerce.number().positive("El precio debe ser mayor a 0"),
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

export type EditPostSchema = z.infer<typeof editPostSchema>;
export type EditPostInput = z.input<typeof editPostSchema>;

export interface UseEditPostReturn {
  form: ReturnType<typeof useForm<EditPostInput, unknown, EditPostSchema>>;
  allPhotos: PhotoItem[];
  photoError: string | null;
  addPhoto: (file: File, preview: string) => void;
  removePhoto: (index: number) => void;
  isLocked: boolean;
  isSaving: boolean;
  handleSave: () => Promise<void>;
  handleClose: () => void;
}

function buildInitialPhotos(imagesUrls: string): PhotoItem[] {
  return imagesUrls
    .split(",")
    .filter(Boolean)
    .map((url) => ({
      preview: url,
      // Dummy file (size=0) marks this as an existing photo — only preview/url is used for display
      file: new File([], "existing-photo", { type: "image/jpeg" }),
    }));
}

export function useEditPost(post: PostDto, onClose: () => void): UseEditPostReturn {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isLocked = (post.offersCount ?? 0) > 0;

  const initialExistingUrls = React.useRef(
    new Set(post.imagesUrls?.split(",").filter(Boolean) ?? [])
  );

  const [allPhotos, setAllPhotos] = React.useState<PhotoItem[]>(() =>
    buildInitialPhotos(post.imagesUrls ?? "")
  );
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<EditPostInput, unknown, EditPostSchema>({
    resolver: zodResolver(editPostSchema),
    mode: "onTouched",
    defaultValues: {
      title: post.title,
      priceClp: String(post.priceClp),
      isNegotiable: post.isNegotiable,
      description: post.description ?? "",
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

  // Pre-load current tags from backend (endpoint pending — stub returns mock data)
  const { data: postTags } = useQuery({
    queryKey: ["postTags", post.id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return fetchPostTags(post.id, accessToken);
    },
  });

  React.useEffect(() => {
    if (!postTags) return;
    form.reset({
      ...form.getValues(),
      Talla: postTags.Talla ?? [],
      Condición: postTags.Condición ?? "",
      "Tipo de prenda": postTags["Tipo de prenda"] ?? [],
      Marca: postTags.Marca ?? [],
      Color: postTags.Color ?? [],
      Género: postTags.Género ?? [],
      Estilo: postTags.Estilo ?? [],
      Temporada: postTags.Temporada ?? [],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postTags]);

  const addPhoto = React.useCallback((file: File, preview: string) => {
    setAllPhotos((prev) => [...prev, { file, preview }]);
    setPhotoError(null);
  }, []);

  const removePhoto = React.useCallback((index: number) => {
    setAllPhotos((prev) => {
      const item = prev[index];
      if (!initialExistingUrls.current.has(item.preview)) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
    setPhotoError(null);
  }, []);

  const handleClose = React.useCallback(() => {
    setAllPhotos((prev) => {
      prev.forEach((p) => {
        if (!initialExistingUrls.current.has(p.preview)) {
          URL.revokeObjectURL(p.preview);
        }
      });
      return buildInitialPhotos(post.imagesUrls ?? "");
    });
    setPhotoError(null);
    form.reset({
      title: post.title,
      priceClp: String(post.priceClp),
      isNegotiable: post.isNegotiable,
      description: post.description ?? "",
      Talla: [],
      Condición: "",
      "Tipo de prenda": [],
      Marca: [],
      Color: [],
      Género: [],
      Estilo: [],
      Temporada: [],
    });
    onClose();
  }, [form, onClose, post]);

  const handleSave = React.useCallback(async () => {
    if (allPhotos.length < 3) {
      setPhotoError("Debes tener al menos 3 fotos");
      return;
    }

    setIsSaving(true);

    await form.handleSubmit(
      async (data: EditPostSchema) => {
        let accessToken: string;
        try {
          accessToken = await getAccessToken();
        } catch {
          router.push("/session-expired");
          return;
        }

        try {
          const deletedUrls = [...initialExistingUrls.current].filter(
            (url) => !allPhotos.some((p) => p.preview === url)
          );
          const newPhotos = allPhotos.filter(
            (p) => !initialExistingUrls.current.has(p.preview)
          );

          await patchPost(
            {
              id: post.id,
              title: data.title,
              description: data.description,
              priceClp: Number(data.priceClp),
              isNegotiable: data.isNegotiable,
            },
            accessToken,
          );

          if (deletedUrls.length > 0) {
            await deletePostImages(post.id, deletedUrls, accessToken);
          }
          if (newPhotos.length > 0) {
            const fd = new FormData();
            newPhotos.forEach((p) => fd.append("images", p.file));
            await appendPostImages(post.id, fd, accessToken);
          }

          await patchPostTags(
            post.id,
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

          toast.success("Publicación actualizada", {
            description: "Los cambios fueron guardados exitosamente.",
          });
          queryClient.invalidateQueries({ queryKey: ["posts"] });
          onClose();
        } catch (err) {
          handleApiError(err, "Error al guardar cambios", router);
        }
      },
      () => {
        toast.error("Por favor completa los campos requeridos");
      },
    )();

    setIsSaving(false);
  }, [form, post.id, allPhotos, router, queryClient, onClose]);

  return {
    form,
    allPhotos,
    photoError,
    addPhoto,
    removePhoto,
    isLocked,
    isSaving,
    handleSave,
    handleClose,
  };
}
