"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import { AvatarUpload } from "@/components/common/avatar-upload";
import { TextInput } from "@/components/common/text-input";
import type { OnboardingSchema } from "../onboarding-form";

interface StepPerfilProps {
  form: UseFormReturn<OnboardingSchema>;
  avatarPreview: string | null;
  avatarError: string | null;
  onAvatarChange: (file: File) => void;
  disabled?: boolean;
}

export function StepPerfil({ form, avatarPreview, avatarError, onAvatarChange, disabled }: StepPerfilProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center">
        <AvatarUpload
          src={avatarPreview ?? undefined}
          onChange={onAvatarChange}
          size="lg"
          disabled={disabled}
          validationError={avatarError ?? undefined}
          required
        />
      </div>

      <TextInput
        control={form.control}
        name="username"
        label="Username *"
        placeholder="Escribe tu username"
        disabled={disabled}
        autoFocus
        required
      />

      <TextInput
        control={form.control}
        name="bio"
        label="Bio *"
        placeholder="Escribe una breve biografía sobre ti..."
        disabled={disabled}
        isTextarea
        inputClassName="min-h-[100px] max-h-[100px]"
      />
    </div>
  );
}
