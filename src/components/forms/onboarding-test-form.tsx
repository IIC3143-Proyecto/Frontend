"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IconMail } from "@tabler/icons-react";

import { Form } from "@/components/ui/form";
import { TextInput } from "@/components/common/text-input";
import { ToggleInputGroup as ToggleInput } from "@/components/common/toggle-input";
import { Button } from "@/components/ui/button";

const CLOTHING_STYLES = [
  { label: "Minimalista", value: "min" }, { label: "Vintage", value: "vin" },
  { label: "Streetwear", value: "str" }, { label: "Gorpcore", value: "gor" },
  { label: "Formal", value: "for" }, { label: "Boho", value: "boh" },
  { label: "Grunge", value: "gru" }, { label: "Y2K", value: "y2k" },
  { label: "Cyberpunk", value: "cyb" }, { label: "Old Money", value: "old" },
  { label: "Preppy", value: "pre" }, { label: "Dark Academia", value: "dark" },
  { label: "Athleisure", value: "ath" }, { label: "Punk", value: "pun" },
  { label: "Indie", value: "ind" }, { label: "Skater", value: "ska" },
  { label: "Techwear", value: "tec" }, { label: "Casual", value: "cas" },
  { label: "Chic", value: "chi" }, { label: "E-Girl", value: "egi" }
];

const demoSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  mainStyle: z.string().min(1, "Selecciona tu estilo principal"),
  smallStyle: z.string().min(1, "Selecciona tu estilo principal"),
  secondaryStyles: z.array(z.string()).min(1, "Elige al menos uno"),
  lockedPreferences: z.array(z.string()).optional(),
  age: z.coerce.number().optional(),
});

type DemoInput = z.input<typeof demoSchema>;
type DemoOutput = z.output<typeof demoSchema>;

export function OnboardingStylesForm() {
  const form = useForm<DemoInput, void, DemoOutput>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      mainStyle: "",
        smallStyle: "",
      secondaryStyles: [],
      lockedPreferences: ["min", "vin"],
      age: 0,
    },
  });

  const onSubmit: SubmitHandler<DemoOutput> = (data) => console.log(data);

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-12 max-w-2xl p-8 bg-white rounded-2xl border shadow-sm mx-auto"
      >
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Showcase: Onboarding Blocks</h1>
          <p className="text-muted-foreground text-sm">Validación de componentes, tamaños y límites.</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Campos de Texto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput 
              control={form.control} 
              name="username" 
              label="Usuario" 
              size="sm" 
              placeholder="Ej: floaq" 
            />
            <TextInput 
              control={form.control} 
              name="email" 
              label="Email" 
              icon={IconMail} 
              placeholder="tu@email.com" 
            />
            <TextInput 
              control={form.control} 
              name="password" 
              label="Contraseña" 
              type="password" 
              size="lg" 
            />
            <TextInput 
              control={form.control} 
              name="age" 
              label="Campo Bloqueado" 
              disabled 
              placeholder="No editable" 
            />
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Selección de Tokens</h2>
          
          <ToggleInput
            control={form.control}
            name="mainStyle"
            label="Estilo Principal (Single Selection)"
            type="single"
            limit={5} 
            options={CLOTHING_STYLES}
          />
          <ToggleInput
            control={form.control}
            name="smallStyle"
            label="Estilo Principal (Single Selection)"
            type="single"
            limit={5}
            options={CLOTHING_STYLES}
            size="sm"
          />

          <ToggleInput
            control={form.control}
            name="secondaryStyles"
            label="Otros Estilos (Multiple + Large Size)"
            type="multiple"
            size="lg"
            limit={8} 
            options={CLOTHING_STYLES}
          />

          <ToggleInput
            control={form.control}
            name="lockedPreferences"
            label="Preferencias Guardadas (Disabled)"
            type="multiple"
            disabled
            limit={4} 
            options={CLOTHING_STYLES}
            size="sm"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-black text-white hover:bg-zinc-800 rounded-xl font-bold transition-all active:scale-95"
        >
          Finalizar Onboarding
        </Button>
      </form>
    </Form>
  );
}