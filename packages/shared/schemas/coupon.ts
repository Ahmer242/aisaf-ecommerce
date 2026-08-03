import { z } from "zod";

export const couponTypeSchema = z.enum(["PERCENT", "FLAT"]);
export type CouponType = z.infer<typeof couponTypeSchema>;

export const couponSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: couponTypeSchema,
  value: z.number().positive(),
  minOrderValue: z.number().nonnegative().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  usedCount: z.number().int().nonnegative(),
  firstOrderOnly: z.boolean(),
  isActive: z.boolean(),
});
export type Coupon = z.infer<typeof couponSchema>;

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1).max(40).toUpperCase(),
  subtotal: z.number().nonnegative(),
  isFirstOrder: z.boolean().default(false),
});
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

export const reviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
  photoUrls: z.array(z.string().url()).default([]),
  isVerifiedPurchase: z.boolean(),
  isApproved: z.boolean(),
  createdAt: z.coerce.date().optional(),
});
export type Review = z.infer<typeof reviewSchema>;

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  photoUrls: z.array(z.string().url()).max(5).default([]),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
