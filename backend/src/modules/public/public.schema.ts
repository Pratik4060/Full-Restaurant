import { DietType, MealType, PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const publicMenuQuerySchema = z.object({
  type: z.nativeEnum(MealType).optional(),
  diet: z.nativeEnum(DietType).optional(),
  category: z.string().trim().optional(),
  subCategory: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const publicMenuItemSnapshotSchema = z.object({
  menuItemId: z.string().min(1).optional(),
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().trim().min(1).optional(),
  price: z.number().positive(),
  prepTimeMins: z.number().int().min(1).optional(),
  type: z.nativeEnum(MealType),
  category: z.string().min(1),
  subCategory: z.string().trim().optional(),
  diet: z.nativeEnum(DietType),
  isBestseller: z.boolean().optional(),
});

export const publicRegisterCustomerSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().trim().optional(),
});

export const publicCreateOrderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().trim().optional(),
  tableNumber: z.string().min(1),
  guestCount: z.number().int().min(1),
  items: z.array(
    publicMenuItemSnapshotSchema.extend({
      quantity: z.number().int().min(1),
    })
  ).min(1),
});

export const publicPayOrderSchema = z.object({
  method: z.nativeEnum(PaymentMethod),
});

export const publicLikeMenuItemSchema = publicMenuItemSnapshotSchema;
