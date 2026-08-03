import { z } from "zod";

export const roleSchema = z.enum(["CUSTOMER", "ADMIN", "STAFF"]);
export type Role = z.infer<typeof roleSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const userPublicSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: roleSchema,
  image: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
});
export type UserPublic = z.infer<typeof userPublicSchema>;

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().max(60).nullable().optional(),
  fullName: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).nullable().optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).nullable().optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2).default("PK"),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.infer<typeof addressSchema>;
