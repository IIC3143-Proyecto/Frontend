"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconChevronLeft, IconChevronRight, IconCheck } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { onboardingSchema, type OnboardingSchema } from "./schema";
import { TOTAL_STEPS, STEP_TITLES, STEP_DESCRIPTIONS, STEP_FIELDS } from "./constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { uploadUserAvatar, patchUser } from "@/lib/api/user";
import { patchUserTags } from "@/lib/api/tag";
import { getAccessToken } from "@/actions/auth";
import { StepProgress } from "@/components/common/step-progress";
import { useTags } from "@/hooks/use-tags";
import { StepPerfil } from "./steps/step-perfil";
import { StepEstilo } from "./steps/step-estilo";
import { StepContacto } from "./steps/step-contacto";
import { StepZona } from "./steps/step-zona";
import { StepResumen } from "./steps/step-resumen";

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

    const [showIntro, setShowIntro] = React.useState(true);
    const [currentStep, setCurrentStep] = React.useState(1);
    const [showSummary, setShowSummary] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [avatarFile, setAvatarFile] = React.useState<File | undefined>();
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
    const [avatarError, setAvatarError] = React.useState<string | null>(null);

    const handleAvatarChange = React.useCallback((file: File) => {
      setAvatarPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setAvatarFile(file);
      setAvatarError(null);
    }, []);

    const handleNext = async () => {
      if (currentStep === 1) {
        const valid = await form.trigger(STEP_FIELDS[1]);
        if (!avatarFile) {
          setAvatarError("Avatar es requerido");
        }
        if (!valid || !avatarFile) return;
      }

      if (currentStep === 3) {
        const { contactInstagram, contactEmail, contactWhatsapp } = form.getValues();
        if (!contactInstagram?.trim() && !contactEmail?.trim() && !contactWhatsapp?.trim()) {
          form.setError("contactInstagram", { message: "Agrega al menos un medio de contacto" });
          return;
        }
        const valid = await form.trigger(STEP_FIELDS[3]);
        if (!valid) return;
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

        const { username, bio, contactInstagram, contactEmail, contactWhatsapp, metro, clothingGender, clothingTypes, size } = form.getValues();

        try {
          await patchUser(
            userId,
            {
              username: username.toLowerCase(),
              bio,
              metro: metro.length ? metro : undefined,
              contactInfo: {
                instagram: contactInstagram ? `@${contactInstagram}` : undefined,
                email: contactEmail || undefined,
                whatsapp: contactWhatsapp || undefined,
              },
            },
            token,
          );
        } catch (err) {
          const status = (err as { status?: number }).status;
          const field = (err as { field?: string }).field;
          const message = err instanceof Error ? err.message : 'Error al actualizar el perfil';

          if (status === undefined) {
            toast.error('Error de red', { description: 'Verifica tu conexión e inténtalo de nuevo.' });
            return;
          }
          if (status === 401) {
            router.push('/session-expired');
            return;
          }
          if (status === 409 && field === 'username') {
            form.setError('username', { message });
            setShowSummary(false);
            setCurrentStep(1);
            return;
          }
          toast.error('Error', { description: message });
          return;
        }

        const tags: Record<string, string[]> = {};
        if (clothingGender) tags['Género'] = [clothingGender];
        if (clothingTypes?.length) tags['Tipo de prenda'] = clothingTypes;
        if (size) tags['Talla'] = [size];

        try {
          await patchUserTags({ tags }, token);
        } catch (err) {
          const status = (err as { status?: number }).status;
          if (status === undefined) {
            toast.error('Error de red', { description: 'Verifica tu conexión e inténtalo de nuevo.' });
            return;
          }
          if (status === 401) {
            router.push('/session-expired');
            return;
          }
          if (status !== 403) {
            const message = err instanceof Error ? err.message : 'Error al guardar preferencias de estilo';
            toast.error('Error', { description: message });
            return;
          }
        }

        queryClient.setQueriesData(
          { queryKey: ["dbUser"], exact: false },
          (old: unknown) =>
            old && typeof old === "object"
              ? { ...(old as object), status: 'Activo', photoUrl }
              : old,
        );

        toast.success("¡Perfil completado!", { description: "Tu perfil ha sido actualizado exitosamente." });
        await onSuccess?.();
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-lg mx-auto flex flex-col h-full",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
        {...props}
      >
        {showIntro ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <h1 className="text-3xl font-bold">¡Arma tu perfil!</h1>
              <p className="text-sm text-muted-foreground">Cuéntanos sobre ti y tu estilo. Solo toma un par de minutos.</p>
            </div>

            <div className="flex justify-center pt-4 shrink-0">
              <Button
                type="button"
                size="lg"
                onClick={() => setShowIntro(false)}
              >
                Empezar
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 pb-4 shrink-0">
              {!showSummary && (
                <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} className="w-full max-w-50 mx-auto" />
              )}
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold">
                  {showSummary ? "Resumen" : STEP_TITLES[currentStep]}
                </h1>
                {(showSummary || STEP_DESCRIPTIONS[currentStep]) && (
                  <p className="text-sm text-muted-foreground">
                    {showSummary
                      ? "Revisa tu información antes de finalizar"
                      : STEP_DESCRIPTIONS[currentStep]}
                  </p>
                )}
              </div>
            </div>

            <Form {...form}>
              <div className="flex-1 min-h-0">
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
                        disabled={disabled || isSubmitting}
                      />
                    )}
                    {currentStep === 2 && (
                      <StepEstilo form={form} tags={tags} disabled={disabled || isSubmitting} />
                    )}
                    {currentStep === 3 && (
                      <StepContacto form={form} disabled={disabled || isSubmitting} />
                    )}
                    {currentStep === 4 && (
                      <StepZona form={form} disabled={disabled || isSubmitting} />
                    )}
                  </>
                )}
              </div>
            </Form>

            <div className={cn("flex pt-4 shrink-0", currentStep === 1 && !showSummary ? "justify-end" : "justify-between")}>
              {(currentStep > 1 || showSummary) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <IconChevronLeft className="size-4" />
                  Atrás
                </Button>
              )}

              {showSummary ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={disabled || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconCheck className="size-4" />
                  )}
                  {isSubmitting ? "Guardando..." : "Finalizar"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={disabled || isSubmitting}
                  size="lg"
                >
                  {currentStep === TOTAL_STEPS ? "Ver resumen" : "Siguiente"}
                  <IconChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  },
);

OnboardingForm.displayName = "OnboardingForm";
