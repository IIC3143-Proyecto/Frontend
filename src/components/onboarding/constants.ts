import type { OnboardingSchema } from "./schema";

export const TOTAL_STEPS = 4;

export const STEP_TITLES: Record<number, string> = {
  1: "Tu perfil",
  2: "Tu estilo",
  3: "Contacto",
  4: "Tu zona",
};

export const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "",
  2: "Qué te gustaría ver en el feed",
  3: "Al menos un medio de contacto es obligatorio",
  4: "",
};

export const STEP_FIELDS: Record<number, (keyof OnboardingSchema)[]> = {
  1: ["username", "bio"],
  2: [],
  3: ["contactInstagram", "contactEmail", "contactWhatsapp"],
  4: ["metro"],
};
