"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { AvatarUpload } from "../common/avatar-upload";
import { TextInput } from "../common/text-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Validation Schema ────────────────────────────────────────────────────────

const onboardingSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters"),
});

type OnboardingFormSchema = z.infer<typeof onboardingSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingFormData extends OnboardingFormSchema {
  avatar: File;
}

export interface OnboardingFormProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  onSubmit?: (data: OnboardingFormData) => Promise<void>;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const OnboardingForm = React.forwardRef<
  HTMLDivElement,
  OnboardingFormProps
>(function OnboardingForm({ onSubmit, disabled = false, className, ...props }, ref) {
  const form = useForm<OnboardingFormSchema>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      bio: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | undefined>();
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  

  const handleAvatarChange = React.useCallback((file: File) => {
    setAvatarFile(file);
    // Clear validation error as soon as user picks a file
    setAvatarError(null);

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    return () => URL.revokeObjectURL(url);
  }, []);

  const handleSubmitClick = () => {
    if (!avatarFile) setAvatarError("Avatar is required");
  };

  const handleFormSubmit = async (data: OnboardingFormSchema) => {
    // Validate avatar is present — set error so AvatarUpload shows it
    if (!avatarFile) {
      setAvatarError("Avatar is required");
      return;
    }

    if (!onSubmit) return;

    try {
      setIsSubmitting(true);
      setGlobalError(null);
      await onSubmit({
        ...data,
        avatar: avatarFile,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setGlobalError(message);
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
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-semibold">Complete Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Add your avatar, username, and a brief bio
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-6"
            noValidate
          >
            {/* Avatar — validationError drives the error ring + message */}
            <div className="flex flex-col items-center">
              <AvatarUpload
                src={avatarPreview ?? undefined}
                fallback="YOU"
                onChange={handleAvatarChange}
                size="lg"
                disabled={disabled || isLoading}
                validationError={avatarError}
              />
            </div>

            {/* Username */}
            <TextInput
              control={form.control}
              name="username"
              label="Username *"
              placeholder="Enter your username"
              disabled={disabled || isLoading}
              autoFocus
              required
            />

            {/* Bio */}
            <TextInput
              control={form.control}
              name="bio"
              label="Bio"
              placeholder="Write a short bio about yourself..."
              disabled={disabled || isLoading}
              isTextarea
              inputClassName={cn("min-h-[100px] max-h-[100px]")}
            />

            {/* Submit */}
            <Button
              type="submit"
              onMouseDown={handleSubmitClick}
              disabled={disabled || isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isLoading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>

          {globalError && (
            <p className="text-sm text-destructive font-medium text-center bg-destructive/10 p-3 rounded">
              {globalError}
            </p>
          )}
        </div>
      </Form>
    </div>
  );
});

OnboardingForm.displayName = "OnboardingForm";