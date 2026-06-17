import { z } from "zod";

export const offerSchema = z.object({
  priceClp: z.number().min(1, "Ingresa un precio válido"),
  comment: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export type OfferForm = z.infer<typeof offerSchema>;
