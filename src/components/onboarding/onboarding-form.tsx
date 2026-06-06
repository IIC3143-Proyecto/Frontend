"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconChevronLeft, IconChevronRight, IconCheck } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { uploadUserAvatar, patchUser, patchUserTags } from "@/lib/api/user";
import { getAccessToken } from "@/actions/auth";
import { StepProgress } from "@/components/common/step-progress";
import { useTags } from "@/hooks/use-tags";
import { StepPerfil } from "./steps/step-perfil";
import { StepEstilo } from "./steps/step-estilo";
import { StepContacto } from "./steps/step-contacto";
import { StepZona } from "./steps/step-zona";
import { StepResumen } from "./steps/step-resumen";

const onboardingSchema = z.object({
  // Step 1 — required
  username: z
    .string()
    .min(1, "Username es requerido")
    .min(3, "Username debe tener al menos 3 caracteres")
    .max(30, "Username debe tener como máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username solo puede contener letras, números, guiones y guiones bajos"),
  bio: z.string().min(1, "Bio es requerida").max(500, "Bio debe tener como máximo 500 caracteres"),
  // Step 2 — optional (valores dinámicos del API de tags)
  clothingGender: z.string().optional(),
  clothingTypes: z.array(z.string()).optional(),
  size: z.string().optional(),
  // Step 3 — mínimo 1 requerido (validación manual)
  contactInstagram: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  contactWhatsapp: z.string().optional(),
  // Step 4 — required
  metro: z.array(z.string()).min(1, "Selecciona al menos una estación de metro"),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;

const TOTAL_STEPS = 4;

const STEP_TITLES: Record<number, string> = {
  1: "Tu perfil",
  2: "Tu estilo",
  3: "Contacto",
  4: "Tu zona",
};

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "Foto, nombre de usuario y una bio",
  2: "Preferencias de moda (opcional)",
  3: "Cómo contactarte",
  4: "¿Dónde te mueves?",
};

const STEP_FIELDS: Record<number, (keyof OnboardingSchema)[]> = {
  1: ["username", "bio"],
  2: [],
  3: ["contactInstagram", "contactEmail", "contactWhatsapp"],
  4: ["metro"],
};

export interface OnboardingFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onSuccess?: () => void | Promise<void>;
  disabled?: boolean;
  userId?: string;
}

export const OnboardingForm = React.forwardRef<HTMLDivElement, OnboardingFormProps>(
  function OnboardingForm({ onSuccess, disabled = false, userId = "me", className, ...props }, ref) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { categories: tags } = useTags();

    const form = useForm<OnboardingSchema>({
      resolver: zodResolver(onboardingSchema),
      mode: "onTouched",
      defaultValues: {
        username: "",
        bio: "",
        clothingGender: undefined,
        clothingTypes: [],
        size: undefined,
        contactInstagram: "",
        contactEmail: "",
        contactWhatsapp: "",
        metro: [],
      },
    });

    const [currentStep, setCurrentStep] = React.useState(1);
    const [showSummary, setShowSummary] = React.useState(false);
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

    const handleNext = async () => {
      if (currentStep === 1) {
        const valid = await form.trigger(STEP_FIELDS[1]);
        if (!valid) return;
        if (!avatarFile) {
          setAvatarError("Avatar es requerido");
          return;
        }
      }

      if (currentStep === 3) {
        const { contactInstagram, contactEmail, contactWhatsapp } = form.getValues();
        if (!contactInstagram?.trim() && !contactEmail?.trim() && !contactWhatsapp?.trim()) {
          form.setError("contactInstagram", { message: "Agrega al menos un medio de contacto" });
          return;
        }
      }

      if (currentStep === 4) {
        const valid = await form.trigger(STEP_FIELDS[4]);
        if (!valid) return;
        setShowSummary(true);
        return;
      }

      setCurrentStep((s) => s + 1);
    };

    const handleBack = () => {
      if (showSummary) {
        setShowSummary(false);
        return;
      }
      setCurrentStep((s) => s - 1);
    };

    const handleSubmit = async () => {
      if (!avatarFile) {
        setAvatarError("Avatar es requerido");
        return;
      }

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
          photoUrl = await uploadUserAvatar(userId, avatarFile, token);
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
            setShowSummary(false);
            setCurrentStep(1);
            return;
          }
          toast.error("Error", { description: message });
          return;
        }

        const { username, bio, metro, contactInstagram, contactEmail, contactWhatsapp } = form.getValues();
        const { clothingGender, clothingTypes, size } = form.getValues();

        await patchUser(
          userId,
          {
            username,
            bio,
            photoUrl,
            metro: metro?.length ? metro : undefined,
            contactInfo: {
              instagram: contactInstagram || undefined,
              email: contactEmail || undefined,
              whatsapp: contactWhatsapp || undefined,
            },
          },
          token,
        );

        await patchUserTags(
          userId,
          {
            clothingGender: clothingGender || undefined,
            clothingTypes: clothingTypes?.length ? clothingTypes : undefined,
            size: size || undefined,
          },
          token,
        );

        queryClient.setQueriesData(
          { queryKey: ["dbUser"], exact: false },
          (old: unknown) =>
            old && typeof old === "object" ? { ...(old as object), onboardingCompleted: true } : old,
        );

        toast.success("¡Perfil completado!", { description: "Tu perfil ha sido actualizado exitosamente." });
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
          "w-full max-w-md mx-auto flex flex-col gap-6",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
        {...props}
      >
        {!showSummary && (
          <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        )}

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            {showSummary ? "Resumen" : STEP_TITLES[currentStep]}
          </h1>
          <p className="text-sm text-muted-foreground">
            {showSummary
              ? "Revisa tu información antes de finalizar"
              : STEP_DESCRIPTIONS[currentStep]}
          </p>
        </div>

        <Form {...form}>
          <div className="flex flex-col gap-8">
            {showSummary ? (
              <StepResumen form={form} avatarPreview={avatarPreview} />
            ) : (
              <>
                {currentStep === 1 && (
                  <StepPerfil
                    form={form}
                    avatarPreview={avatarPreview}
                    avatarError={avatarError}
                    onAvatarChange={handleAvatarChange}
                    disabled={disabled || isLoading}
                  />
                )}
                {currentStep === 2 && (
                  <StepEstilo form={form} tags={tags} disabled={disabled || isLoading} />
                )}
                {currentStep === 3 && (
                  <StepContacto form={form} disabled={disabled || isLoading} />
                )}
                {currentStep === 4 && (
                  <StepZona form={form} disabled={disabled || isLoading} />
                )}
              </>
            )}

            <div className={cn("flex", currentStep === 1 && !showSummary ? "justify-end" : "justify-between")}>
              {(currentStep > 1 || showSummary) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <IconChevronLeft className="size-4" />
                  Atrás
                </Button>
              )}

              {showSummary ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={disabled || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconCheck className="size-4" />
                  )}
                  {isLoading ? "Guardando..." : "Finalizar"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={disabled || isLoading}
                  size="lg"
                >
                  {currentStep === TOTAL_STEPS ? "Ver resumen" : "Siguiente"}
                  <IconChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </Form>
      </div>
    );
  },
);

OnboardingForm.displayName = "OnboardingForm";
