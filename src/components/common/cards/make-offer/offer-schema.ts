import { z } from "zod";

export const offerSchema = z.object({
  priceClp: z.number().min(0),
  comment: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export type OfferForm = z.infer<typeof offerSchema>;
