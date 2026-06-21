"use client";

import type { UseFormReturn } from "react-hook-form";
import { MetroInput } from "@/components/common/metro-input";
import type { OnboardingSchema } from "../schema";

interface StepZonaProps {
  form: UseFormReturn<OnboardingSchema>;
  disabled?: boolean;
}

export function StepZona({ form, disabled }: StepZonaProps) {
  return (
    <MetroInput
      control={form.control}
      name="metro"
      label="Estación(es) de metro *"
      disabled={disabled}
    />
  );
}
