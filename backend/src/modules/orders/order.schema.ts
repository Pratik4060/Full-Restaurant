import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().min(2),
  tableNumber: z.string().min(1),
  guestCount: z.number().int().min(1).optional(),
  customerPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1)
      })
    )
    .min(1)
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus)
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
