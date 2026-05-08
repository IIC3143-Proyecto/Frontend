"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form } from "@/components/ui/form";
import { MetroInput } from "@/components/common/metro-input";
import { Button } from "@/components/ui/button";

const metroSchema = z.object({
  stations: z.array(z.string()).min(1, "Selecciona al menos una estación"),
});

type MetroInput = z.input<typeof metroSchema>;
type MetroOutput = z.output<typeof metroSchema>;

type VariantType = "sm" | "default" | "lg" | "default-disabled";

export function MetroTestForm() {
  const [variant, setVariant] = useState<VariantType>("default");

  const form = useForm<MetroInput, void, MetroOutput>({
    resolver: zodResolver(metroSchema),
    defaultValues: {
      stations: [],
    },
  });

  const onSubmit: SubmitHandler<MetroOutput> = (data) => {
    console.log("Form submitted:", data);
  };

  const getSizeAndDisabled = (v: VariantType) => {
    switch (v) {
      case "sm":
        return { size: "sm" as const, disabled: false };
      case "default":
        return { size: "default" as const, disabled: false };
      case "lg":
        return { size: "lg" as const, disabled: false };
      case "default-disabled":
        return { size: "default" as const, disabled: true };
    }
  };

  const { size, disabled } = getSizeAndDisabled(variant);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl p-8 bg-white rounded-2xl border shadow-sm mx-auto"
      >
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Metro Input Test</h1>
          <p className="text-muted-foreground text-sm">
            Check the console to see if API is being called or localStorage is being used.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["sm", "default", "lg", "default-disabled"] as VariantType[]).map((v) => (
            <Button
              key={v}
              type="button"
              variant={variant === v ? "default" : "outline"}
              onClick={() => setVariant(v)}
              size="sm"
            >
              {v}
            </Button>
          ))}
        </div>

        <MetroInput
          control={form.control}
          name="stations"
          label="Estaciones"
          size={size}
          disabled={disabled}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
