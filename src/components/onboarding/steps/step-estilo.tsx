"use client";

import type { UseFormReturn } from "react-hook-form";
import { ToggleInputGroup } from "@/components/common/toggle-input";
import { SizeSelector } from "@/components/common/size-selector";
import type { TagCategories } from "@/lib/types/tag";
import type { OnboardingSchema } from "../schema";

interface StepEstiloProps {
  form: UseFormReturn<OnboardingSchema>;
  tags: TagCategories;
  disabled?: boolean;
}

export function StepEstilo({ form, tags, disabled }: StepEstiloProps) {
  const clothingGenderOptions = (tags["Género"] ?? []).map((v) => ({ label: v, value: v }));
  const clothingTypeOptions = (tags["Tipo de prenda"] ?? []).map((v) => ({ label: v, value: v }));
  const sizeOptions = tags["Talla"] ?? [];

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

      <SizeSelector
        control={form.control}
        name="size"
        options={sizeOptions}
        type="single"
        disabled={disabled}
      />
    </div>
  );
}
