import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const billingQuerySchema = z.object({
  period: z.enum(["weekly", "monthly", "yearly"]).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const processPaymentSchema = z.object({
  orderId: z.string().min(1),
  method: z.nativeEnum(PaymentMethod),
});

export type BillingQueryInput = z.infer<typeof billingQuerySchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
