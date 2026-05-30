"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { AvatarUpload } from "../common/avatar-upload";
import { TextInput } from "../common/text-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getAccessToken } from "@/actions/auth";

const onboardingSchema = z.object({
  username: z
    .string()
    .min(1, "Username es requerido")
    .min(3, "Username debe tener al menos 3 caracteres")
    .max(30, "Username debe tener como máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username solo puede contener letras, números, guiones y guiones bajos"),
  bio: z
    .string()
    .max(500, "Bio debe tener como máximo 500 caracteres"),
});

type OnboardingFormSchema = z.infer<typeof onboardingSchema>;

export interface OnboardingFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onSuccess?: () => void | Promise<void>;
  disabled?: boolean;
  /** User ID from dbUser.id — needed to build the avatar upload URL. */
  userId?: string;
}

async function uploadAvatar(file: File, token: string, userId: string): Promise<string> {
  const body = new FormData();
  body.append("images", file);

  const res = await fetch(api.userImage(userId), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error(json.message ?? "Failed to upload avatar"), { status: res.status });
  }

  const { photoUrl } = await res.json();
  return photoUrl as string;
}

async function patchUser(
  data: { username: string; bio: string; photoUrl: string },
  token: string,
  userId: string,
): Promise<void> {
  const res = await fetch(api.user(userId), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error(json.message ?? "Failed to save profile"), {
      status: res.status,
      field: json.field as string | undefined,
    });
  }
}

/**
 * OnboardingForm
 *
 * Profile completion form. Uploads an avatar to `POST /profile/avatar`,
 * then saves username and bio via `PATCH /user`.
 */
export const OnboardingForm = React.forwardRef<
  HTMLDivElement,
  OnboardingFormProps
>(function OnboardingForm({ onSuccess, disabled = false, userId = 'me', className, ...props }, ref) {
  const router = useRouter();

  const form = useForm<OnboardingFormSchema>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      bio: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | undefined>();
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);

  const handleAvatarChange = React.useCallback((file: File) => {
    setAvatarFile(file);
    setAvatarError(null);

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    return () => URL.revokeObjectURL(url);
  }, []);

  const validateAvatar = React.useCallback(() => {
    if (!avatarFile) {
      setAvatarError("Avatar es requerido");
      return false;
    }
    return true;
  }, [avatarFile]);

  const handleFormSubmit = async (data: OnboardingFormSchema) => {
    if (!validateAvatar()) return;

    setIsSubmitting(true);

    let token: string;
    try {
      token = await getAccessToken();
    } catch {
      router.push("/session-expired");
      setIsSubmitting(false);
      return;
    }

    try {
      let photoUrl: string;

      try {
        photoUrl = await uploadAvatar(avatarFile!, token, userId);
      } catch (err) {
        const status = (err as { status?: number }).status;
        const message = err instanceof Error ? err.message : "Error al subir la foto de usuario";

        if (status === undefined) {
          toast.error("Error de red", { description: "Verifica tu conexión e inténtalo de nuevo." });
          return;
        }
        if (status === 401) {
          router.push("/session-expired");
          return;
        }
        if (status === 422) {
          setAvatarError(message);
          return;
        }
        toast.error("Error", { description: message });
        return;
      }

      try {
        await patchUser({ username: data.username, bio: data.bio, photoUrl }, token, userId);
      } catch (err) {
        const status = (err as { status?: number }).status;
        const field = (err as { field?: string }).field;
        const message = err instanceof Error ? err.message : "Error al guardar el perfil";

        if (status === undefined) {
          toast.error("Error de red", { description: "Verifica tu conexión e inténtalo de nuevo." });
          return;
        }
        if (status === 401) {
          router.push("/session-expired");
          return;
        }
        if (status === 409 && field === "username") {
          form.setError("username", { type: "server", message });
          return;
        }
        toast.error("Error", { description: message });
        return;
      }

      toast.success("Perfil actualizado!", { description: "Tu perfil ha sido actualizado exitosamente." });
      await onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting;

  return (
    <div
      ref={ref}
      className={cn(
        "w-full max-w-md mx-auto flex flex-col gap-8",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      <Form {...form}>
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold">Completa tu perfil</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Agrega tu avatar, nombre de usuario y una breve biografía
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-6"
            noValidate
          >
            <div className="flex flex-col items-center">
              <AvatarUpload
                src={avatarPreview ?? undefined}
                onChange={handleAvatarChange}
                size="lg"
                disabled={disabled || isLoading}
                validationError={avatarError}
                required={true}
              />
            </div>

            <TextInput
              control={form.control}
              name="username"
              label="Username *"
              placeholder="Escribe tu username"
              disabled={disabled || isLoading}
              autoFocus
              required
            />

            <TextInput
              control={form.control}
              name="bio"
              label="Bio"
              placeholder="Escribe una breve biografía sobre ti..."
              disabled={disabled || isLoading}
              isTextarea
              inputClassName={cn("min-h-[100px] max-h-[100px]")}
            />

            <Button
              type="submit"
              onMouseDown={validateAvatar}
              disabled={disabled || isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading && <IconLoader2 className="mr-2 size-4 animate-spin" />}
              {isLoading ? "Guardando..." : "Guardar perfil"}
            </Button>
          </form>

        </div>
      </Form>
    </div>
  );
});

OnboardingForm.displayName = "OnboardingForm";
