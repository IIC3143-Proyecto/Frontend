import { z } from "zod";

export const onboardingSchema = z.object({
  username: z
    .string()
    .min(1, "Username es requerido")
    .min(3, "Username debe tener al menos 3 caracteres")
    .max(30, "Username debe tener como máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username solo puede contener letras, números, guiones y guiones bajos")
    .transform((v) => v.toLowerCase()),
  bio: z.string().min(1, "Bio es requerida").max(500, "Bio debe tener como máximo 500 caracteres"),
  clothingGender: z.string().optional(),
  clothingTypes: z.array(z.string()).optional(),
  size: z.string().optional(),
  contactInstagram: z
    .string()
    .refine((v) => !v || !/\s/.test(v), "No puede contener espacios")
    .optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  contactWhatsapp: z
    .string()
    .refine((v) => !v || /^\d{8}$/.test(v), "Debe tener exactamente 8 dígitos")
    .optional(),
  metro: z.array(z.string()).min(1, "Selecciona al menos una estación de metro"),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;
