"use client";

import type { UseFormReturn } from "react-hook-form";
import { IconMail } from "@tabler/icons-react";
import { TextInput } from "@/components/common/text-input";
import type { OnboardingSchema } from "../schema";

interface StepContactoProps {
  form: UseFormReturn<OnboardingSchema>;
  disabled?: boolean;
}

export function StepContacto({ form, disabled }: StepContactoProps) {
  return (
    <div className="flex flex-col gap-6">
      <TextInput
        control={form.control}
        name="contactInstagram"
        label="Instagram"
        placeholder="tu_usuario"
        prefix="@"
        disabled={disabled}
      />

      <TextInput
        control={form.control}
        name="contactEmail"
        label="Correo"
        placeholder="tucorreo@ejemplo.com"
        type="email"
        icon={IconMail}
        disabled={disabled}
      />

      <TextInput
        control={form.control}
        name="contactWhatsapp"
        label="WhatsApp"
        placeholder="12345678"
        prefix="+569"
        onlyDigits
        maxLength={8}
        disabled={disabled}
      />
    </div>
  );
}
