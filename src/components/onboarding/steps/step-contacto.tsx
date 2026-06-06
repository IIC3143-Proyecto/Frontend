"use client";

import type { UseFormReturn } from "react-hook-form";
import { IconBrandInstagram, IconMail, IconBrandWhatsapp } from "@tabler/icons-react";
import { TextInput } from "@/components/common/text-input";
import type { OnboardingSchema } from "../onboarding-form";

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
        placeholder="@tu_usuario"
        icon={IconBrandInstagram}
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
        placeholder="+56 9 1234 5678"
        type="tel"
        icon={IconBrandWhatsapp}
        disabled={disabled}
      />
    </div>
  );
}
