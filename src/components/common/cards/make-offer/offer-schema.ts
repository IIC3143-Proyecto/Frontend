import { z } from "zod";

export const offerSchema = z.object({
  priceClp: z.number().int().min(1_000, "La oferta mínima es $1.000"),
  comment: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export type OfferForm = z.infer<typeof offerSchema>;
