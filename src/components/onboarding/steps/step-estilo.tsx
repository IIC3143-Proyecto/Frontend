"use client";

import type { UseFormReturn } from "react-hook-form";
import { ToggleInputGroup } from "@/components/common/toggle-input";
import type { TagCategories } from "@/lib/types/tag";
import type { OnboardingSchema } from "../schema";

const ONBOARDING_CATEGORY_MAP = {
  clothingGender: 'Género',
  clothingTypes: 'Tipo de prenda',
  size: 'Talla',
} as const;

interface StepEstiloProps {
  form: UseFormReturn<OnboardingSchema>;
  tags: TagCategories;
  disabled?: boolean;
}

export function StepEstilo({ form, tags, disabled }: StepEstiloProps) {
  const clothingGenderOptions = (tags[ONBOARDING_CATEGORY_MAP.clothingGender] ?? []).map((v) => ({ label: v, value: v }));
  const clothingTypeOptions = (tags[ONBOARDING_CATEGORY_MAP.clothingTypes] ?? []).map((v) => ({ label: v, value: v }));
  const sizeOptions = (tags[ONBOARDING_CATEGORY_MAP.size] ?? []).map((v) => ({ label: v, value: v }));

  return (
    <div className="flex flex-col gap-6">
      <ToggleInputGroup
        control={form.control}
        name="clothingGender"
        label="Género de ropa"
        options={clothingGenderOptions}
        type="single"
        disabled={disabled}
      />

      <ToggleInputGroup
        control={form.control}
        name="clothingTypes"
        label="Tipo de prenda"
        options={clothingTypeOptions}
        type="multiple"
        limit={6}
        disabled={disabled}
      />

      <ToggleInputGroup
        control={form.control}
        name="size"
        label="Talla"
        options={sizeOptions}
        type="single"
        disabled={disabled}
      />
    </div>
  );
}
