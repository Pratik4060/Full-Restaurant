import { z } from "zod";

export const customersQuerySchema = z.object({
  period: z.enum(["weekly", "monthly", "yearly"]).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const bulkDeleteCustomersSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export type CustomersQueryInput = z.infer<typeof customersQuerySchema>;
export type BulkDeleteCustomersInput = z.infer<typeof bulkDeleteCustomersSchema>;
