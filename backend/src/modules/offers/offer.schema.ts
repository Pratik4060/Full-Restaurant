import { z } from "zod";

const baseOfferSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  discountText: z.string().min(1),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  validUntil: z.string().datetime().optional()
});

export const createOfferSchema = baseOfferSchema;
export const updateOfferSchema = baseOfferSchema.partial();
