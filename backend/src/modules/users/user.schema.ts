import { UserRole } from "@prisma/client";
import { z } from "zod";

const staffUserRoleSchema = z.nativeEnum(UserRole).refine((role) => role !== UserRole.ADMIN, {
  message: "Use the admin account table for admin users",
});

export const usersQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: staffUserRoleSchema,
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: staffUserRoleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UsersQueryInput = z.infer<typeof usersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
