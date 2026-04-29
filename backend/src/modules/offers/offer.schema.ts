import { z } from "zod";

const baseOfferSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  discountText: z.string().min(1),
  imageUrl: z.string({ required_error: "Image is required" }).trim().min(1, "Image is required"),
  isActive: z.boolean().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional()
});

export const createOfferSchema = baseOfferSchema;
export const updateOfferSchema = baseOfferSchema.partial();
